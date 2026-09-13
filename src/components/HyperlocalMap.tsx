import React, { useState, useMemo, useEffect, useRef } from "react";
import L from "leaflet";
import { UrbanZone, SensorNode, GridCellFeature } from "../types";
import { CalculationBreakdown } from "../utils/temperatureEngine";
import {
  Layers,
  Thermometer,
  Wind,
  Sun,
  AlertTriangle,
  RefreshCw,
  Eye,
  MapPin,
  CheckCircle,
  Trees,
  ShieldAlert,
  Info,
  Navigation,
  Compass,
  Sliders,
  Maximize2,
  Minimize2,
  Grid3X3,
  Map as MapIcon,
  RotateCcw,
  Calculator,
  ChevronDown,
  ChevronUp,
  Flame,
} from "lucide-react";

interface HyperlocalMapProps {
  zones: UrbanZone[];
  sensors: SensorNode[];
  gridCells: GridCellFeature[];
  selectedCell: GridCellFeature | null;
  calculationBreakdown?: CalculationBreakdown | null;
  onSelectCell: (cell: GridCellFeature) => void;
  onRecalibrateSensor: (nodeId: string) => void;
}

const JAIPUR_LANDMARKS = [
  { name: "Johari Bazaar (Old City)", lat: 26.9239, lng: 75.8267, zoneId: "zone-core", row: 7, col: 7 },
  { name: "Central Park (Cool Oasis)", lat: 26.9015, lng: 75.8078, zoneId: "zone-parks", row: 7, col: 3 },
  { name: "Nahargarh & Amer Hills", lat: 26.9855, lng: 75.8507, zoneId: "zone-periurban", row: 14, col: 13 },
  { name: "Jal Mahal Lake", lat: 26.9534, lng: 75.8462, zoneId: "zone-waterfront", row: 2, col: 12 },
  { name: "Sitapura Industrial Zone", lat: 26.7824, lng: 75.8281, zoneId: "zone-industrial", row: 13, col: 12 },
  { name: "Mansarovar Residential", lat: 26.8665, lng: 75.7645, zoneId: "zone-suburban", row: 10, col: 5 },
  { name: "Civil Lines", lat: 26.9067, lng: 75.7852, zoneId: "zone-suburban", row: 8, col: 6 },
  { name: "Jaipur Int'l Airport", lat: 26.8289, lng: 75.8056, zoneId: "zone-suburban", row: 12, col: 8 },
];

export function HyperlocalMap({
  zones,
  sensors,
  gridCells,
  selectedCell,
  calculationBreakdown,
  onSelectCell,
  onRecalibrateSensor,
}: HyperlocalMapProps) {
  const [activeLayer, setActiveLayer] = useState<
    "forecast24h" | "forecast1h" | "satelliteLST" | "uhiIntensity" | "gvi" | "vulnerabilityScore"
  >("forecast24h");
  const [mapStyle, setMapStyle] = useState<"streets" | "osm" | "satellite" | "light">("streets");
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.65);
  const [showSensors, setShowSensors] = useState<boolean>(true);
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);
  const [filterZone, setFilterZone] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"mapOverlay" | "matrix">("mapOverlay");
  const [hoveredCell, setHoveredCell] = useState<GridCellFeature | null>(null);
  const [showMathDetails, setShowMathDetails] = useState<boolean>(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const gridOverlayLayerRef = useRef<L.LayerGroup | null>(null);
  const sensorsLayerRef = useRef<L.LayerGroup | null>(null);
  const landmarksLayerRef = useRef<L.LayerGroup | null>(null);

  // Map IoT sensors onto distinct grid cells for quick lookup
  const cellSensorMap = useMemo(() => {
    const map = new Map<string, SensorNode>();
    if (!sensors || sensors.length === 0) return map;
    sensors.forEach((s, idx) => {
      const row = (idx * 3 + 2) % 16;
      const col = (idx * 5 + 3) % 16;
      const key = `${row}-${col}`;
      if (!map.has(key)) {
        map.set(key, s);
      }
    });
    return map;
  }, [sensors]);

  // Color scale: Nature green -> Lime -> Yellow -> Orange -> Crimson Red
  const getColorForValue = (val: number, layer: string) => {
    if (val === undefined || isNaN(val)) return "#CBD5E1";
    switch (layer) {
      case "forecast1h":
      case "forecast24h": {
        const t = Math.max(0, Math.min(1, (val - 34) / 12));
        if (t < 0.2) return "#15803D"; // Deep green (34-36.4°C)
        if (t < 0.4) return "#65A30D"; // Lime green (36.4-38.8°C)
        if (t < 0.65) return "#EAB308"; // Warm yellow (38.8-41.8°C)
        if (t < 0.85) return "#F97316"; // Hot orange (41.8-44.2°C)
        return "#E11D48"; // Extreme heat crimson (44.2-46°C+)
      }
      case "satelliteLST": {
        const t = Math.max(0, Math.min(1, (val - 34) / 16));
        if (t < 0.2) return "#15803D";
        if (t < 0.45) return "#CA8A04";
        if (t < 0.75) return "#EA580C";
        return "#BE123C";
      }
      case "uhiIntensity": {
        const t = Math.max(0, Math.min(1, val / 6));
        if (t < 0.3) return "#10B981";
        if (t < 0.65) return "#F59E0B";
        return "#DC2626";
      }
      case "gvi": {
        const t = Math.max(0, Math.min(1, val / 0.55));
        if (t < 0.2) return "#DC2626";
        if (t < 0.45) return "#D97706";
        if (t < 0.7) return "#84CC16";
        return "#15803D";
      }
      case "vulnerabilityScore": {
        const t = Math.max(0, Math.min(1, val));
        if (t < 0.35) return "#10B981";
        if (t < 0.65) return "#F59E0B";
        return "#DC2626";
      }
      default:
        return "#15803D";
    }
  };

  const layerDescriptions: Record<string, { title: string; subtitle: string; unit: string }> = {
    forecast24h: {
      title: "24-Hour Air Temperature Forecast",
      subtitle: "Predicted street-level temperature for tomorrow during afternoon peak heat",
      unit: "°C",
    },
    forecast1h: {
      title: "1-Hour Immediate Nowcast",
      subtitle: "Short-term next-hour pedestrian temperature forecast",
      unit: "°C",
    },
    satelliteLST: {
      title: "Satellite Roof & Surface Heat",
      subtitle: "Thermal infrared temperature of concrete, asphalt, and rooftops from space",
      unit: "°C",
    },
    uhiIntensity: {
      title: "Urban Heat Island Excess",
      subtitle: "How much hotter this street is compared to rural countryside outside Jaipur",
      unit: "°C hotter",
    },
    gvi: {
      title: "Street Tree Canopy (Green View)",
      subtitle: "Percentage of field-of-view covered by green trees and shaded vegetation",
      unit: "shade ratio",
    },
    vulnerabilityScore: {
      title: "Heat Health Vulnerability Risk",
      subtitle: "Composite score factoring senior residents, low AC access, and concrete density",
      unit: "score (0-1)",
    },
  };

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [26.9124, 75.7873],
        zoom: 12,
        minZoom: 10,
        maxZoom: 17,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Create LayerGroups
      const gridGroup = L.layerGroup().addTo(map);
      const sensorsGroup = L.layerGroup().addTo(map);
      const landmarksGroup = L.layerGroup().addTo(map);

      gridOverlayLayerRef.current = gridGroup;
      sensorsLayerRef.current = sensorsGroup;
      landmarksLayerRef.current = landmarksGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Update Basemap Tiles
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
    let subdomains = "abcd";

    if (mapStyle === "osm") {
      tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
      subdomains = "abc";
    } else if (mapStyle === "satellite") {
      tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      attribution = '&copy; Esri, Maxar, Earthstar Geographics';
      subdomains = "abc";
    } else if (mapStyle === "light") {
      tileUrl = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO';
      subdomains = "abcd";
    }

    const newTileLayer = L.tileLayer(tileUrl, {
      attribution,
      subdomains,
      maxZoom: 18,
    });
    newTileLayer.addTo(map);
    tileLayerRef.current = newTileLayer;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [mapStyle]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Render Geographic Temperature Color Overlays on Jaipur Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const gridGroup = gridOverlayLayerRef.current;
    if (!map || !gridGroup) return;

    gridGroup.clearLayers();

    // Lat/Lng span for each 100m–400m cell block
    const latSpan = 0.0055;
    const lngSpan = 0.0055;

    gridCells.forEach((cell) => {
      const inSelectedZone = filterZone === "all" || cell.zoneId === filterZone;
      if (!inSelectedZone) return;

      let cellVal = cell.forecast24h;
      let valDisplay = `${cell.forecast24h}°C`;
      if (activeLayer === "forecast1h") {
        cellVal = cell.forecast1h;
        valDisplay = `${cell.forecast1h}°C`;
      } else if (activeLayer === "satelliteLST") {
        cellVal = cell.satelliteLST;
        valDisplay = `${cell.satelliteLST}°C`;
      } else if (activeLayer === "uhiIntensity") {
        cellVal = cell.uhiIntensity;
        valDisplay = `+${cell.uhiIntensity}°C`;
      } else if (activeLayer === "gvi") {
        cellVal = cell.gvi;
        valDisplay = `${Math.round(cell.gvi * 100)}% shade`;
      } else if (activeLayer === "vulnerabilityScore") {
        cellVal = cell.vulnerabilityScore;
        valDisplay = `${cell.vulnerabilityScore} risk`;
      }

      const color = getColorForValue(cellVal, activeLayer);
      const isSelected = selectedCell?.id === cell.id;

      // Geographical bounding box for the cell
      const bounds: L.LatLngBoundsExpression = [
        [cell.lat - latSpan / 2, cell.lng - lngSpan / 2],
        [cell.lat + latSpan / 2, cell.lng + lngSpan / 2],
      ];

      const rect = L.rectangle(bounds, {
        color: isSelected ? "#0F172A" : color,
        weight: isSelected ? 2.5 : 0.8,
        fillColor: color,
        fillOpacity: isSelected ? Math.min(0.92, overlayOpacity + 0.25) : overlayOpacity,
        className: "transition-all cursor-pointer",
      });

      // Hover and Click events
      rect.on("mouseover", () => {
        setHoveredCell(cell);
        rect.setStyle({
          weight: 2,
          color: "#FFFFFF",
          fillOpacity: Math.min(0.95, overlayOpacity + 0.2),
        });
      });

      rect.on("mouseout", () => {
        setHoveredCell(null);
        rect.setStyle({
          weight: isSelected ? 2.5 : 0.8,
          color: isSelected ? "#0F172A" : color,
          fillOpacity: isSelected ? Math.min(0.92, overlayOpacity + 0.25) : overlayOpacity,
        });
      });

      rect.on("click", () => {
        onSelectCell(cell);
      });

      rect.bindTooltip(
        `<div style="font-family: sans-serif; font-size: 11px; padding: 2px 4px;">
          <div style="font-weight: bold; color: #1E293B;">${cell.zoneName}</div>
          <div style="color: ${color}; font-weight: 700; font-size: 13px; margin-top: 1px;">
            ${valDisplay}
          </div>
          <div style="color: #64748B; font-size: 10px;">Click to inspect street data</div>
        </div>`,
        { sticky: true, opacity: 0.95 }
      );

      gridGroup.addLayer(rect);
    });
  }, [gridCells, activeLayer, overlayOpacity, filterZone, selectedCell, onSelectCell]);

  // 3. Render Landmark Markers on Map
  useEffect(() => {
    const landmarksGroup = landmarksLayerRef.current;
    if (!landmarksGroup) return;

    landmarksGroup.clearLayers();
    if (!showLandmarks) return;

    JAIPUR_LANDMARKS.forEach((lm) => {
      const icon = L.divIcon({
        className: "custom-landmark-badge",
        html: `<div class="flex items-center gap-1.5 bg-stone-900/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-md border border-stone-600/80 whitespace-nowrap cursor-pointer hover:bg-emerald-800 transition hover:scale-105">
          <span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
          <span>${lm.name}</span>
        </div>`,
        iconSize: [140, 24],
        iconAnchor: [70, 12],
      });

      const marker = L.marker([lm.lat, lm.lng], { icon });
      marker.on("click", () => {
        handleJumpLandmark(lm.zoneId, lm.row, lm.col, lm.lat, lm.lng);
      });
      landmarksGroup.addLayer(marker);
    });
  }, [showLandmarks]);

  // 4. Render Sensor Node Pins on Map
  useEffect(() => {
    const sensorsGroup = sensorsLayerRef.current;
    if (!sensorsGroup) return;

    sensorsGroup.clearLayers();
    if (!showSensors) return;

    // Place sensor pins on map
    sensors.slice(0, 45).forEach((sensor) => {
      const isOnline = sensor.status === "online";
      const icon = L.divIcon({
        className: "custom-sensor-node-pin",
        html: `<div class="relative flex items-center justify-center cursor-pointer group" title="${sensor.name}">
          <div class="w-3 h-3 rounded-full ${
            isOnline ? "bg-emerald-600" : "bg-amber-500"
          } ring-2 ring-white shadow-md transition group-hover:scale-125"></div>
        </div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const marker = L.marker([sensor.lat, sensor.lng], { icon });
      marker.bindTooltip(
        `<div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
          <div style="font-weight: bold;">${sensor.nodeCode} (${sensor.type})</div>
          <div style="font-size: 12px; color: #047857; font-weight: 700;">${sensor.temperature}°C &bull; ${sensor.humidity}% RH</div>
          <div style="font-size: 10px; color: ${isOnline ? '#059669' : '#D97706'}; font-weight: 600;">Status: ${sensor.status.toUpperCase()}</div>
        </div>`,
        { sticky: true }
      );

      marker.on("click", () => {
        const closestCell = gridCells.find((c) => c.zoneId === sensor.zoneId) || gridCells[0];
        if (closestCell) onSelectCell(closestCell);
      });

      sensorsGroup.addLayer(marker);
    });
  }, [sensors, showSensors, gridCells, onSelectCell]);

  // Pan to landmark
  const handleJumpLandmark = (
    zoneIdTarget: string,
    defaultRow: number,
    defaultCol: number,
    lat?: number,
    lng?: number
  ) => {
    setFilterZone("all");
    const found = gridCells.find((c) => c.row === defaultRow && c.col === defaultCol);
    if (found) {
      onSelectCell(found);
    }
    if (mapInstanceRef.current && lat && lng) {
      mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1.2 });
    }
  };

  // Reset map view to full city
  const handleResetMapView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([26.9124, 75.7873], 12, { duration: 1 });
    }
  };

  // Filtered sensors for inspector
  const activeCellSensor = selectedCell
    ? cellSensorMap.get(`${selectedCell.row}-${selectedCell.col}`) ||
      sensors.find((s) => s.zoneId === selectedCell.zoneId) ||
      sensors[0]
    : null;

  return (
    <div
      id="hyperlocal-map-container"
      className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl p-6 shadow-xs text-stone-800 space-y-6"
    >
      {/* Header & Map Settings */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#EFECE6]">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs tracking-wider uppercase mb-1">
            <Layers className="w-4 h-4 text-emerald-700" />
            Jaipur Hyperlocal Heat Map
          </div>
          <h2 className="text-xl font-bold text-stone-900">
            Street-Level Temperature Map Overlay &bull; 400 km&sup2; City Domain
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Live temperature indicator colors are overlaid directly onto the real map of Jaipur. Click or hover over any neighborhood to inspect rooftop heat, tree shade, and street sensor readings.
          </p>
        </div>

        {/* Filter Zone Dropdown & View Mode Switch */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-[#FAF8F5] p-1.5 rounded-xl border border-[#EAE5DC]">
            <span className="text-xs font-semibold text-stone-700 ml-1">Focus District:</span>
            <select
              id="zone-select-filter"
              value={filterZone}
              onChange={(e) => {
                const val = e.target.value;
                setFilterZone(val);
                if (val !== "all") {
                  const firstInZone = gridCells.find((c) => c.zoneId === val);
                  if (firstInZone) {
                    onSelectCell(firstInZone);
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.flyTo([firstInZone.lat, firstInZone.lng], 13.5, { duration: 1 });
                    }
                  }
                }
              }}
              className="bg-white border border-[#D5CEC2] text-xs font-medium rounded-lg px-2.5 py-1.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Entire City (All Districts)</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset View Button */}
          <button
            onClick={handleResetMapView}
            className="flex items-center gap-1.5 text-xs bg-[#FAF8F5] hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border border-[#DCD6CA] hover:border-emerald-300 font-semibold px-3 py-2 rounded-xl transition shadow-xs"
            title="Reset map view to center Jaipur"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Center</span>
          </button>
        </div>
      </div>

      {/* Layer Selector Buttons */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-emerald-700" />
            Choose Map Temperature &amp; Climate Layer:
          </span>
          <span className="text-xs text-stone-500 hidden sm:inline">
            Colors on the map update instantly based on your selection
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Button 1: 24h Forecast */}
          <button
            id="layer-btn-24h"
            onClick={() => setActiveLayer("forecast24h")}
            className={`p-3 rounded-xl text-left border transition ${
              activeLayer === "forecast24h"
                ? "bg-emerald-700 text-white border-emerald-800 shadow-sm"
                : "bg-[#FAF8F5] text-stone-700 border-[#E5DFD5] hover:bg-emerald-50 hover:border-emerald-300"
            }`}
          >
            <span className="font-semibold text-xs block">24h Forecast</span>
            <span
              className={`text-[11px] block mt-0.5 ${
                activeLayer === "forecast24h" ? "text-emerald-100" : "text-stone-500"
              }`}
            >
              Tomorrow&apos;s peak heat
            </span>
          </button>

          {/* Button 2: 1h Nowcast */}
          <button
            id="layer-btn-1h"
            onClick={() => setActiveLayer("forecast1h")}
            className={`p-3 rounded-xl text-left border transition ${
              activeLayer === "forecast1h"
                ? "bg-emerald-700 text-white border-emerald-800 shadow-sm"
                : "bg-[#FAF8F5] text-stone-700 border-[#E5DFD5] hover:bg-emerald-50 hover:border-emerald-300"
            }`}
          >
            <span className="font-semibold text-xs block">1h Nowcast</span>
            <span
              className={`text-[11px] block mt-0.5 ${
                activeLayer === "forecast1h" ? "text-emerald-100" : "text-stone-500"
              }`}
            >
              Immediate next hour
            </span>
          </button>

          {/* Button 3: Satellite LST */}
          <button
            id="layer-btn-lst"
            onClick={() => setActiveLayer("satelliteLST")}
            className={`p-3 rounded-xl text-left border transition ${
              activeLayer === "satelliteLST"
                ? "bg-emerald-700 text-white border-emerald-800 shadow-sm"
                : "bg-[#FAF8F5] text-stone-700 border-[#E5DFD5] hover:bg-emerald-50 hover:border-emerald-300"
            }`}
          >
            <span className="font-semibold text-xs block">Satellite Roof Heat</span>
            <span
              className={`text-[11px] block mt-0.5 ${
                activeLayer === "satelliteLST" ? "text-emerald-100" : "text-stone-500"
              }`}
            >
              Surface skin temperature
            </span>
          </button>

          {/* Button 4: UHI Gap */}
          <button
            id="layer-btn-uhi"
            onClick={() => setActiveLayer("uhiIntensity")}
            className={`p-3 rounded-xl text-left border transition ${
              activeLayer === "uhiIntensity"
                ? "bg-emerald-700 text-white border-emerald-800 shadow-sm"
                : "bg-[#FAF8F5] text-stone-700 border-[#E5DFD5] hover:bg-emerald-50 hover:border-emerald-300"
            }`}
          >
            <span className="font-semibold text-xs block">Heat Island Gap</span>
            <span
              className={`text-[11px] block mt-0.5 ${
                activeLayer === "uhiIntensity" ? "text-emerald-100" : "text-stone-500"
              }`}
            >
              Extra heat vs countryside
            </span>
          </button>

          {/* Button 5: Tree Canopy (GVI) */}
          <button
            id="layer-btn-gvi"
            onClick={() => setActiveLayer("gvi")}
            className={`p-3 rounded-xl text-left border transition ${
              activeLayer === "gvi"
                ? "bg-emerald-700 text-white border-emerald-800 shadow-sm"
                : "bg-[#FAF8F5] text-stone-700 border-[#E5DFD5] hover:bg-emerald-50 hover:border-emerald-300"
            }`}
          >
            <span className="font-semibold text-xs block">Tree Canopy</span>
            <span
              className={`text-[11px] block mt-0.5 ${
                activeLayer === "gvi" ? "text-emerald-100" : "text-stone-500"
              }`}
            >
              Street greenery &amp; shade
            </span>
          </button>

          {/* Button 6: Vulnerability */}
          <button
            id="layer-btn-vuln"
            onClick={() => setActiveLayer("vulnerabilityScore")}
            className={`p-3 rounded-xl text-left border transition ${
              activeLayer === "vulnerabilityScore"
                ? "bg-emerald-700 text-white border-emerald-800 shadow-sm"
                : "bg-[#FAF8F5] text-stone-700 border-[#E5DFD5] hover:bg-emerald-50 hover:border-emerald-300"
            }`}
          >
            <span className="font-semibold text-xs block">Health Risk</span>
            <span
              className={`text-[11px] block mt-0.5 ${
                activeLayer === "vulnerabilityScore" ? "text-emerald-100" : "text-stone-500"
              }`}
            >
              High-risk senior areas
            </span>
          </button>
        </div>
      </div>

      {/* Landmark Quick Jump Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <span className="text-xs font-semibold text-stone-500 whitespace-nowrap">
          Quick Landmarks:
        </span>
        {JAIPUR_LANDMARKS.map((lm) => (
          <button
            key={lm.name}
            onClick={() => handleJumpLandmark(lm.zoneId, lm.row, lm.col, lm.lat, lm.lng)}
            className="text-xs bg-[#FAF8F5] hover:bg-emerald-50 text-stone-800 border border-[#E5DFD5] hover:border-emerald-300 px-3 py-1 rounded-full whitespace-nowrap transition flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>{lm.name}</span>
          </button>
        ))}
      </div>

      {/* Main Map & Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7.5 Cols: Actual Geographic Map with Overlaid Temperature Colors */}
        <div className="lg:col-span-8 bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-4 flex flex-col space-y-3">
          {/* Map Top Bar Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EAE5DC]">
            <div>
              <span className="text-xs font-bold text-stone-900 block">
                {layerDescriptions[activeLayer]?.title}
              </span>
              <span className="text-[11px] text-stone-500">
                {layerDescriptions[activeLayer]?.subtitle}
              </span>
            </div>

            {/* Map Controls: Style switcher, Opacity slider, Sensor toggle */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Basemap switcher */}
              <div className="flex items-center bg-white border border-stone-300 rounded-lg p-0.5 text-xs font-medium">
                <button
                  onClick={() => setMapStyle("streets")}
                  className={`px-2 py-1 rounded-md transition ${
                    mapStyle === "streets" ? "bg-emerald-700 text-white shadow-xs" : "text-stone-700 hover:text-stone-900"
                  }`}
                >
                  Street Map
                </button>
                <button
                  onClick={() => setMapStyle("osm")}
                  className={`px-2 py-1 rounded-md transition ${
                    mapStyle === "osm" ? "bg-emerald-700 text-white shadow-xs" : "text-stone-700 hover:text-stone-900"
                  }`}
                >
                  OSM
                </button>
                <button
                  onClick={() => setMapStyle("satellite")}
                  className={`px-2 py-1 rounded-md transition ${
                    mapStyle === "satellite" ? "bg-emerald-700 text-white shadow-xs" : "text-stone-700 hover:text-stone-900"
                  }`}
                >
                  Satellite
                </button>
                <button
                  onClick={() => setMapStyle("light")}
                  className={`px-2 py-1 rounded-md transition ${
                    mapStyle === "light" ? "bg-emerald-700 text-white shadow-xs" : "text-stone-700 hover:text-stone-900"
                  }`}
                >
                  Light
                </button>
              </div>

              {/* Opacity slider */}
              <div className="hidden sm:flex items-center gap-1.5 bg-white border border-stone-300 px-2 py-1 rounded-lg text-xs">
                <Sliders className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-[11px] text-stone-600 font-medium">Heat:</span>
                <input
                  type="range"
                  min={0.2}
                  max={0.9}
                  step={0.05}
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                  className="w-16 accent-emerald-700 cursor-pointer"
                  title="Adjust temperature overlay transparency over the map"
                />
                <span className="text-[10px] text-stone-500 font-mono w-7">
                  {Math.round(overlayOpacity * 100)}%
                </span>
              </div>

              {/* Sensors toggle */}
              <button
                onClick={() => setShowSensors(!showSensors)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition flex items-center gap-1.5 ${
                  showSensors
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-white text-stone-600 border-stone-300"
                }`}
                title="Show or hide IoT sensor pins on map"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sensors</span>
              </button>

              {/* Landmarks toggle */}
              <button
                onClick={() => setShowLandmarks(!showLandmarks)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition flex items-center gap-1.5 ${
                  showLandmarks
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-white text-stone-600 border-stone-300"
                }`}
                title="Show or hide landmarks on map"
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Landmarks</span>
              </button>
            </div>
          </div>

          {/* Actual Map Container */}
          <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-[#E0D9CD] shadow-inner bg-[#E2E8F0]">
            <div
              id="jaipur-actual-map"
              ref={mapContainerRef}
              className="w-full h-full z-0"
            />

            {/* Compass badge top-right */}
            <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-stone-300 shadow-sm flex items-center gap-1 text-[11px] font-semibold text-stone-700 pointer-events-none">
              <Navigation className="w-3 h-3 text-emerald-700" />
              <span>North: Amer &amp; Hills</span>
            </div>

            {/* Hovered cell float info badge bottom-left */}
            {hoveredCell && (
              <div className="absolute bottom-3 left-3 z-10 bg-stone-900/90 text-white px-3 py-1.5 rounded-xl shadow-lg border border-stone-700 text-xs flex items-center gap-2 pointer-events-none">
                <span className="font-semibold">{hoveredCell.zoneName}</span>
                <span className="text-emerald-400 font-bold font-mono">
                  {activeLayer === "forecast24h"
                    ? `${hoveredCell.forecast24h}°C`
                    : activeLayer === "forecast1h"
                    ? `${hoveredCell.forecast1h}°C`
                    : activeLayer === "satelliteLST"
                    ? `${hoveredCell.satelliteLST}°C (Skin)`
                    : activeLayer === "uhiIntensity"
                    ? `+${hoveredCell.uhiIntensity}°C UHI`
                    : activeLayer === "gvi"
                    ? `${Math.round(hoveredCell.gvi * 100)}% Canopy`
                    : `${hoveredCell.vulnerabilityScore} Risk`}
                </span>
                <span className="text-stone-400 text-[10px]">
                  ({hoveredCell.lat.toFixed(3)}°N, {hoveredCell.lng.toFixed(3)}°E)
                </span>
              </div>
            )}
          </div>

          {/* Color Scale Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-stone-600">
              <span className="font-semibold text-stone-800">Map Heat Indicators:</span>
              <span className="text-[11px] text-stone-500">
                (Nature Green &rarr; Warm Yellow &rarr; Crimson Red)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-stone-700 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]"></span> Cool &amp; Shaded (&lt;36°C)
              </span>
              <span className="flex items-center gap-1 text-stone-700 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#65A30D]"></span> Moderate (37-38°C)
              </span>
              <span className="flex items-center gap-1 text-stone-700 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]"></span> Warm (39-41°C)
              </span>
              <span className="flex items-center gap-1 text-stone-700 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]"></span> Hot (42-44°C)
              </span>
              <span className="flex items-center gap-1 text-stone-700 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48]"></span> Extreme Heat (&gt;44°C)
              </span>
            </div>
          </div>
        </div>

        {/* Right 4.5 Cols: Selected Location Data Inspector */}
        <div className="lg:col-span-4 bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DC]">
              <div>
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                  Location Heat Inspector
                </span>
                <h3 className="text-base font-bold text-stone-900">
                  {selectedCell ? selectedCell.zoneName : "Johari Bazaar (Old City)"}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono bg-white px-2.5 py-1 rounded-md border border-[#DCD6CA] text-stone-700 font-semibold block">
                  {selectedCell ? `100m Pilot Cell` : "Select Point"}
                </span>
                <span className="text-[10px] text-stone-500 mt-0.5 block">Jaipur Metropolitan</span>
              </div>
            </div>

            {selectedCell ? (
              <div className="mt-4 space-y-3">
                {/* Coordinates */}
                <div className="flex justify-between items-center text-xs bg-white px-3 py-2 rounded-lg border border-[#E5DFD5] text-stone-600 font-mono">
                  <span>GPS Coordinates:</span>
                  <span className="font-semibold text-stone-900">
                    {selectedCell.lat.toFixed(4)}° N, {selectedCell.lng.toFixed(4)}° E
                  </span>
                </div>

                {/* Tomorrow's Air Temperature */}
                <div className="bg-white p-3.5 rounded-xl border border-[#E5DFD5]">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-stone-600 font-medium">
                      Tomorrow&apos;s Air Temperature
                    </span>
                    <span className="text-2xl font-bold font-mono text-stone-900">
                      {selectedCell.forecast24h}°C
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Pedestrian breathing level forecast at 2-metre height during afternoon peak.
                  </p>
                </div>

                {/* Satellite Roof Heat */}
                <div className="bg-white p-3.5 rounded-xl border border-[#E5DFD5]">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-stone-600 font-medium">
                      Satellite Surface Heat (Skin)
                    </span>
                    <span className="text-xl font-bold font-mono text-amber-700">
                      {selectedCell.satelliteLST}°C
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Roof and asphalt skin temperature measured by Landsat thermal satellites.
                  </p>
                </div>

                {/* Tree Canopy Coverage */}
                <div className="bg-white p-3.5 rounded-xl border border-[#E5DFD5]">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-stone-600 font-medium">
                      Tree Canopy Coverage (Shade)
                    </span>
                    <span className="text-xl font-bold font-mono text-emerald-700">
                      {Math.round(selectedCell.gvi * 100)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    {selectedCell.gvi < 0.2
                      ? "Low tree cover. Planting shade trees here can drop temperature by up to 2.2°C."
                      : "Healthy tree canopy providing natural shade and cooling breeze."}
                  </p>
                </div>

                {/* Urban Heat Island Gap */}
                <div className="bg-white p-3.5 rounded-xl border border-[#E5DFD5]">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-stone-600 font-medium">
                      Heat Island Gap vs Countryside
                    </span>
                    <span className="text-xl font-bold font-mono text-rose-700">
                      +{selectedCell.uhiIntensity}°C
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Excess heat trapped in this dense district compared to green rural areas outside Jaipur.
                  </p>
                </div>

                {/* Real Mathematical Derivation Section */}
                {calculationBreakdown && (
                  <div className="bg-white rounded-xl border border-emerald-300 overflow-hidden shadow-xs">
                    <button
                      onClick={() => setShowMathDetails(!showMathDetails)}
                      className="w-full px-3.5 py-2.5 bg-emerald-50/80 hover:bg-emerald-100/80 transition flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                        <Calculator className="w-4 h-4 text-emerald-700" />
                        <span>Real Mathematical Calculation</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-semibold">
                        <span>{showMathDetails ? "Hide Math" : "Show Equations"}</span>
                        {showMathDetails ? (
                          <ChevronUp className="w-3.5 h-3.5 text-emerald-700" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-emerald-700" />
                        )}
                      </div>
                    </button>

                    {showMathDetails && (
                      <div className="p-3.5 space-y-2.5 text-xs text-stone-700 border-t border-emerald-200 bg-[#FCFBF8]">
                        <div className="text-[11px] text-stone-500 font-medium">
                          Computed directly from live Copernicus ERA5 macro-weather using the biophysical Surface Energy Balance (SEB) downscaling model:
                        </div>

                        {/* Step 1: Synoptic Base & Lapse */}
                        <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-stone-200 font-mono text-[11px]">
                          <span className="text-stone-600">ERA5 Base Air Temp (T_syn):</span>
                          <span className="font-bold text-stone-900">{calculationBreakdown.tSynoptic}°C</span>
                        </div>

                        {/* Step 2: Elevation Lapse */}
                        <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-stone-200 font-mono text-[11px]">
                          <span className="text-stone-600">
                            Lapse Rate (Δz={calculationBreakdown.elevationDeltaMeters}m):
                          </span>
                          <span className="font-semibold text-stone-800">
                            {calculationBreakdown.lapseRateCorrection > 0
                              ? `+${calculationBreakdown.lapseRateCorrection}`
                              : calculationBreakdown.lapseRateCorrection}
                            °C
                          </span>
                        </div>

                        {/* Step 3: Radiative & Latent Fluxes */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                          <div className="bg-white p-2 rounded-lg border border-stone-200">
                            <span className="text-stone-500 text-[10px] block">Net Radiation (R_n):</span>
                            <span className="font-semibold text-amber-800">
                              {calculationBreakdown.netRadiationWm2} W/m²
                            </span>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-stone-200">
                            <span className="text-stone-500 text-[10px] block">Latent Cooling (λE):</span>
                            <span className="font-semibold text-emerald-800">
                              -{calculationBreakdown.latentHeatEvapWm2} W/m²
                            </span>
                          </div>
                        </div>

                        {/* Step 4: UHI Downscaling Anomaly */}
                        <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-stone-200 font-mono text-[11px]">
                          <span className="text-stone-600">Canopy UHI Δ (ISA &amp; Shade):</span>
                          <span className="font-bold text-rose-700">
                            +{calculationBreakdown.uhiDeltaCelsius}°C
                          </span>
                        </div>

                        {/* Step 5: IoT Sensor Residual Blending */}
                        <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-stone-200 font-mono text-[11px]">
                          <span className="text-stone-600">IoT Mesh IDW Residual (ε):</span>
                          <span className="font-semibold text-stone-800">
                            {calculationBreakdown.idwSensorResidualCelsius > 0
                              ? `+${calculationBreakdown.idwSensorResidualCelsius}`
                              : calculationBreakdown.idwSensorResidualCelsius}
                            °C
                          </span>
                        </div>

                        {/* Step 6: Final Calculated Street Temperature */}
                        <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-300 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-emerald-950 block">Final Ground Air Temp</span>
                            <span className="text-[10px] text-emerald-800">T_air = T_syn + ΔT_elev + ΔT_UHI + ε</span>
                          </div>
                          <span className="font-bold font-mono text-base text-emerald-900">
                            {calculationBreakdown.tAir2m}°C
                          </span>
                        </div>

                        {/* Step 7: Heat Index Risk */}
                        <div className="flex justify-between items-center pt-1 text-[11px]">
                          <span className="text-stone-600">Rothfusz Feels-Like Index:</span>
                          <span className="font-bold font-mono text-rose-700">
                            {calculationBreakdown.feelsLikeHeatIndex}°C ({calculationBreakdown.heatRiskLevel})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-stone-400">
                <Info className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                <p className="text-xs">Click anywhere on the Jaipur map to inspect local street climate data.</p>
              </div>
            )}
          </div>

          {/* Quick Sensor Recalibration Card */}
          {activeCellSensor && (
            <div className="pt-3 border-t border-[#EAE5DC]">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900">
                    <CheckCircle className="w-4 h-4 text-emerald-700" />
                    <span>Station {activeCellSensor.nodeCode} ({activeCellSensor.type})</span>
                  </div>
                  <button
                    onClick={() => onRecalibrateSensor(activeCellSensor.id)}
                    className="text-[11px] bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-2.5 py-1 rounded-md transition shadow-xs"
                    title="Calibrates this sensor against reference Davis Vantage weather station"
                  >
                    Recalibrate Sensor
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-600 mt-2">
                  <span>Reading: <strong>{activeCellSensor.temperature}°C</strong></span>
                  <span>Drift Offset: <strong>{activeCellSensor.driftEst > 0 ? `+${activeCellSensor.driftEst}` : activeCellSensor.driftEst}°C</strong></span>
                  <span className={`font-semibold ${activeCellSensor.status === "online" ? "text-emerald-700" : "text-amber-700"}`}>
                    {activeCellSensor.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
