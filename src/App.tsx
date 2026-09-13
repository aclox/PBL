import React, { useState, useEffect } from "react";
import { PILOT_ZONES } from "./data/researchData";
import { UrbanZone, SensorNode, GridCellFeature, MeteorologicalContext } from "./types";
import {
  generateMathematicallyCalculatedGrid,
  MeteorologicalForcing,
  CalculationBreakdown,
} from "./utils/temperatureEngine";
import { DataIngestionBar } from "./components/DataIngestionBar";
import { HyperlocalMap } from "./components/HyperlocalMap";
import { MathCalculators } from "./components/MathCalculators";
import { ModelEvaluation } from "./components/ModelEvaluation";
import { UrbanPlanningAndAlerts } from "./components/UrbanPlanningAndAlerts";
import { AboutAndResearch } from "./components/AboutAndResearch";
import {
  Map as MapIcon,
  Calculator,
  BarChart3,
  Building,
  GraduationCap,
  Trees,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

export default function App() {
  const [activePage, setActivePage] = useState<"map" | "math" | "eval" | "planning" | "about">("map");
  const [zones] = useState<UrbanZone[]>(PILOT_ZONES);
  const [sensors, setSensors] = useState<SensorNode[]>([]);
  const [sensorStats, setSensorStats] = useState<any>(null);
  const [weather, setWeather] = useState<MeteorologicalContext | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [gridCells, setGridCells] = useState<GridCellFeature[]>([]);
  const [breakdowns, setBreakdowns] = useState<Map<string, CalculationBreakdown>>(new Map());
  const [selectedCell, setSelectedCell] = useState<GridCellFeature | null>(null);

  // Compute 100m grid using real mathematical biophysical SEB & downscaling equations
  useEffect(() => {
    const meteo: MeteorologicalForcing = {
      temperature2m: weather?.currentConditions?.temperature2m ?? 39.8,
      relativeHumidity: weather?.currentConditions?.relativeHumidity ?? 32,
      windSpeedMs: weather?.currentConditions?.windSpeedMs ?? 3.4,
      windU: weather?.currentConditions?.windU ?? -2.8,
      windV: weather?.currentConditions?.windV ?? -1.9,
      solarRadiationWm2: weather?.currentConditions?.solarRadiationWm2 ?? 680,
      referenceElevation: weather?.location?.elevation ?? 435,
    };

    const { cells, breakdowns: calculatedBreakdowns } = generateMathematicallyCalculatedGrid(
      zones,
      meteo,
      sensors
    );

    setGridCells(cells);
    setBreakdowns(calculatedBreakdowns);

    setSelectedCell((prev) => {
      if (!prev) {
        return cells.find((c) => c.zoneId === "zone-core") || cells[120];
      }
      return cells.find((c) => c.id === prev.id) || cells[0];
    });
  }, [zones, weather, sensors]);

  // Fetch real Copernicus ERA5 & Open-Meteo meteorological stream
  const fetchWeather = async () => {
    setWeatherLoading(true);
    try {
      const res = await fetch("/api/weather/copernicus-era5?lat=26.9124&lng=75.7873");
      if (!res.ok) return;
      const text = await res.text();
      if (!text || !text.startsWith("{")) return;
      const data = JSON.parse(text);
      setWeather(data);
    } catch (err) {
      console.warn("Notice reading weather stream:", err);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Fetch 150 IoT Sensor Nodes
  const fetchSensors = async () => {
    try {
      const res = await fetch("/api/sensors");
      if (!res.ok) return;
      const text = await res.text();
      if (!text || !text.startsWith("{")) return;
      const data = JSON.parse(text);
      setSensors(data.nodes || []);
      setSensorStats(data.stats || null);
    } catch (err) {
      console.warn("Notice reading sensor mesh:", err);
    }
  };

  // Recalibrate sensor handler
  const handleRecalibrateSensor = async (nodeId: string) => {
    try {
      const res = await fetch("/api/sensors/recalibrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeId }),
      });
      const data = await res.json();
      if (data.success && data.calibratedSensor) {
        setSensors((prev) =>
          prev.map((s) => (s.id === nodeId ? data.calibratedSensor : s))
        );
        fetchSensors();
      }
    } catch (err) {
      console.error("Error recalibrating sensor:", err);
    }
  };

  useEffect(() => {
    fetchWeather();
    fetchSensors();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* Top Nature-Green & Cream Navigation Header */}
      <header className="bg-white border-b border-[#E5DFD5] sticky top-0 z-40 shadow-xs">
        {/* Main Branding Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-700 text-white rounded-2xl flex items-center justify-center shadow-xs">
              <Trees className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                  Hyperlocal Urban Heat Platform
                </h1>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-medium">
                  Jaipur 100m Pilot
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                <span className="flex items-center gap-1 text-emerald-800 font-medium">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                  Manipal University Jaipur
                </span>
                <span>&bull;</span>
                <span>Akshit Goel, Swaraj Roy &amp; Dr. Sandeep Chaurasia</span>
              </div>
            </div>
          </div>

          {/* Quick Explanatory Key Metrics */}
          <div className="flex items-center gap-3 text-xs">
            <div className="bg-[#FAF8F5] px-3.5 py-2 rounded-xl border border-[#E5DFD5]">
              <div className="flex items-baseline gap-1.5">
                <span className="text-stone-500 font-medium">24h Forecast Error:</span>
                <span className="text-emerald-800 font-bold font-mono text-sm">±1.38°C</span>
              </div>
              <span className="text-[10px] text-stone-500 block">31% more accurate than standard models</span>
            </div>

            <div className="bg-[#FAF8F5] px-3.5 py-2 rounded-xl border border-[#E5DFD5] hidden sm:block">
              <div className="flex items-baseline gap-1.5">
                <span className="text-stone-500 font-medium">Spatial Coverage:</span>
                <span className="text-stone-900 font-bold font-mono text-sm">40,000 Tiles</span>
              </div>
              <span className="text-[10px] text-stone-500 block">100m resolution across 400 km²</span>
            </div>
          </div>
        </div>

        {/* Dedicated Page Tabs with Small Descriptions */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-2 overflow-x-auto no-scrollbar border-t border-[#EFECE6] py-1">
          {/* Page 1: Spatial Grid Map */}
          <button
            id="nav-tab-map"
            onClick={() => setActivePage("map")}
            className={`py-2 px-3.5 text-xs rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activePage === "map"
                ? "bg-emerald-700 text-white font-semibold shadow-xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]"
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <div className="text-left">
              <span className="block font-semibold">100m Spatial Grid</span>
              <span className={`text-[10px] block ${activePage === "map" ? "text-emerald-100" : "text-stone-400"}`}>
                Heatmap &amp; live sensors
              </span>
            </div>
          </button>

          {/* Page 2: Climate Lab & Estimators */}
          <button
            id="nav-tab-math"
            onClick={() => setActivePage("math")}
            className={`py-2 px-3.5 text-xs rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activePage === "math"
                ? "bg-emerald-700 text-white font-semibold shadow-xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]"
            }`}
          >
            <Calculator className="w-4 h-4" />
            <div className="text-left">
              <span className="block font-semibold">Climate Lab</span>
              <span className={`text-[10px] block ${activePage === "math" ? "text-emerald-100" : "text-stone-400"}`}>
                Cooling &amp; heat tools
              </span>
            </div>
          </button>

          {/* Page 3: Model Benchmarks */}
          <button
            id="nav-tab-eval"
            onClick={() => setActivePage("eval")}
            className={`py-2 px-3.5 text-xs rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activePage === "eval"
                ? "bg-emerald-700 text-white font-semibold shadow-xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <div className="text-left">
              <span className="block font-semibold">Model Benchmarks</span>
              <span className={`text-[10px] block ${activePage === "eval" ? "text-emerald-100" : "text-stone-400"}`}>
                Accuracy &amp; comparisons
              </span>
            </div>
          </button>

          {/* Page 4: Urban Planning & Alerts */}
          <button
            id="nav-tab-planning"
            onClick={() => setActivePage("planning")}
            className={`py-2 px-3.5 text-xs rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activePage === "planning"
                ? "bg-emerald-700 text-white font-semibold shadow-xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]"
            }`}
          >
            <Building className="w-4 h-4" />
            <div className="text-left">
              <span className="block font-semibold">Urban Planning &amp; Alerts</span>
              <span className={`text-[10px] block ${activePage === "planning" ? "text-emerald-100" : "text-stone-400"}`}>
                Trees &amp; health warnings
              </span>
            </div>
          </button>

          {/* Page 5: Research & Documentation */}
          <button
            id="nav-tab-about"
            onClick={() => setActivePage("about")}
            className={`py-2 px-3.5 text-xs rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activePage === "about"
                ? "bg-emerald-700 text-white font-semibold shadow-xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <div className="text-left">
              <span className="block font-semibold">Research Guide</span>
              <span className={`text-[10px] block ${activePage === "about" ? "text-emerald-100" : "text-stone-400"}`}>
                Jaipur study background
              </span>
            </div>
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Live Weather & Sensor Ingestion Bar */}
        <DataIngestionBar
          weather={weather}
          sensorStats={sensorStats}
          onRefreshWeather={fetchWeather}
          loading={weatherLoading}
        />

        {/* Page 1: Spatial Grid Map */}
        {activePage === "map" && (
          <HyperlocalMap
            zones={zones}
            sensors={sensors}
            gridCells={gridCells}
            selectedCell={selectedCell}
            calculationBreakdown={selectedCell ? breakdowns.get(selectedCell.id) : null}
            onSelectCell={(c) => setSelectedCell(c)}
            onRecalibrateSensor={handleRecalibrateSensor}
          />
        )}

        {/* Page 2: Climate Laboratory */}
        {activePage === "math" && (
          <MathCalculators
            weather={weather}
            selectedCellBreakdown={selectedCell ? breakdowns.get(selectedCell.id) : null}
          />
        )}

        {/* Page 3: Model Evaluation Benchmarks */}
        {activePage === "eval" && <ModelEvaluation />}

        {/* Page 4: Urban Planning & Heat Health Alerts */}
        {activePage === "planning" && (
          <UrbanPlanningAndAlerts
            zones={zones}
            currentTemp2m={weather ? weather.currentConditions.temperature2m : 39.8}
          />
        )}

        {/* Page 5: Research & Field Guide */}
        {activePage === "about" && <AboutAndResearch />}
      </main>

      {/* Footer with Clean Cream & Nature Green Styling */}
      <footer className="border-t border-[#E5DFD5] bg-white py-6 text-xs text-stone-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-stone-800 font-semibold">
              Hyperlocal Urban Heat Index Forecasting Platform
            </span>
            <span className="text-stone-500">
              Department of Computer Science and Engineering &bull; Manipal University Jaipur &bull; DSE2170
            </span>
          </div>
          <div className="flex items-center gap-3 text-stone-600 text-[11px]">
            <span className="bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#E5DFD5]">
              Landsat 8/9 Band 10
            </span>
            <span>&bull;</span>
            <span className="bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#E5DFD5]">
              Copernicus ERA5
            </span>
            <span>&bull;</span>
            <span className="bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#E5DFD5]">
              150 IoT Sensor Nodes
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
