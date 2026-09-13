import React from "react";
import { MeteorologicalContext } from "../types";
import {
  Satellite,
  Radio,
  Wind,
  Trees,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { HoverTile } from "./HoverDescription";

interface DataIngestionBarProps {
  weather: MeteorologicalContext | null;
  sensorStats: {
    total: number;
    referenceStations: number;
    sht31Count: number;
    dht22Count: number;
    onlineCount: number;
    warningDriftCount: number;
    avgCityAirTemp: number;
  } | null;
  onRefreshWeather: () => void;
  loading: boolean;
}

export function DataIngestionBar({
  weather,
  sensorStats,
  onRefreshWeather,
  loading,
}: DataIngestionBarProps) {
  return (
    <div
      id="data-ingestion-bar"
      className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl p-5 shadow-xs text-stone-800"
    >
      {/* Top Header & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EFECE6]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-200 shrink-0">
            <Satellite className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-stone-900">
                Live Multi-Source Data Feeds
              </h2>
              <HoverTile
                content={{
                  title: "Active Sensor Feeds",
                  badge: "Live Sync",
                  summary: "Continuous 5-minute sync of satellite passes, weather models, and 150 IoT nodes.",
                  details: "Copernicus CDS + Landsat + LoRaWAN",
                }}
                position="bottom"
                align="start"
              >
                <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium cursor-pointer transition">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  Active Feeds Synced
                </span>
              </HoverTile>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Hover over any feed tile below to inspect data source physics, resolution, and sensor calibration.
            </p>
          </div>
        </div>

        {/* Refresh Action */}
        <div className="flex items-center gap-2.5">
          <button
            id="refresh-weather-btn"
            onClick={onRefreshWeather}
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition disabled:opacity-60 cursor-pointer"
            title="Polls the latest weather data from atmospheric servers"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Update Weather</span>
          </button>
        </div>
      </div>

      {/* 4 Clean Ingestion Source Cards with Hover Descriptions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
        {/* Stream 1: Real-time Weather (Ambient Air Weather) */}
        <HoverTile
          content={{
            title: "Ambient Air Weather",
            badge: "Copernicus ERA5",
            summary: "Standard 2-metre synoptic air temperature before urban building and asphalt heating.",
            details: "ECMWF ERA5 hourly reanalysis (~25 km)",
          }}
          position="bottom"
          align="start"
          className="cursor-pointer"
        >
          <div className="bg-[#FAF8F5] hover:bg-emerald-50/40 transition p-3.5 rounded-xl border border-[#EAE5DC] hover:border-emerald-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-emerald-700" />
                Ambient Air Weather
              </span>
              <span className="text-[11px] font-medium bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded">
                ERA5 Reanalysis
              </span>
            </div>

            <div className="mt-2.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-stone-900">
                  {weather ? `${weather.currentConditions.temperature2m}°C` : "39.8°C"}
                </span>
                <span className="text-xs font-medium text-stone-600">Air Temp (2m)</span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#EAE5DC] text-[11px] text-stone-600 space-y-1">
              <div className="flex justify-between">
                <span>Wind Speed:</span>
                <span className="font-semibold text-stone-800">
                  {weather ? `${weather.currentConditions.windSpeedMs} m/s` : "3.4 m/s"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Solar Radiation:</span>
                <span className="font-semibold text-amber-700">
                  {weather ? `${weather.currentConditions.solarRadiationWm2} W/m²` : "740 W/m²"}
                </span>
              </div>
            </div>
          </div>
        </HoverTile>

        {/* Stream 2: Satellite Thermal Surface Heat */}
        <HoverTile
          content={{
            title: "Satellite Surface Heat (LST)",
            badge: "Landsat & MODIS",
            summary: "Thermal skin temperature of roofs, roads, and soil; up to 15°C hotter than air.",
            details: "Landsat 8/9 TIRS-2 (100m) + MODIS orbits",
          }}
          position="bottom"
          align="center"
          className="cursor-pointer"
        >
          <div className="bg-[#FAF8F5] hover:bg-emerald-50/40 transition p-3.5 rounded-xl border border-[#EAE5DC] hover:border-emerald-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5 text-emerald-700" />
                Satellite Surface Heat
              </span>
              <span className="text-[11px] font-medium bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded">
                Landsat &amp; MODIS
              </span>
            </div>

            <div className="mt-2.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-stone-900">
                  42.7°C
                </span>
                <span className="text-xs font-medium text-stone-600">Surface Skin (LST)</span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#EAE5DC] text-[11px] text-stone-600 space-y-1">
              <div className="flex justify-between">
                <span>Spatial Grid:</span>
                <span className="font-semibold text-stone-800">100m resolution</span>
              </div>
              <div className="flex justify-between">
                <span>Orbit Passes:</span>
                <span className="font-semibold text-stone-800">10:30 &amp; 13:30 IST</span>
              </div>
            </div>
          </div>
        </HoverTile>

        {/* Stream 3: Ground Weather Stations */}
        <HoverTile
          content={{
            title: "150 Street Sensor Mesh",
            badge: "LoRaWAN Ground",
            summary: "Pedestrian-level air temperature measured at 1.5–2m height every 5 minutes.",
            details: "Sensirion SHT31 calibrated to Davis stations",
          }}
          position="bottom"
          align="center"
          className="cursor-pointer"
        >
          <div className="bg-[#FAF8F5] hover:bg-emerald-50/40 transition p-3.5 rounded-xl border border-[#EAE5DC] hover:border-emerald-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-700" />
                150 Street Sensors
              </span>
              <span className="text-[11px] font-medium bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded">
                LoRaWAN Ground
              </span>
            </div>

            <div className="mt-2.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-stone-900">
                  {sensorStats ? `${sensorStats.avgCityAirTemp}°C` : "38.4°C"}
                </span>
                <span className="text-xs font-medium text-stone-600">Street Level</span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#EAE5DC] text-[11px] text-stone-600 space-y-1">
              <div className="flex justify-between">
                <span>Active Nodes:</span>
                <span className="font-semibold text-emerald-700">
                  {sensorStats ? `${sensorStats.onlineCount} online` : "150 online"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Calib Standards:</span>
                <span className="font-semibold text-stone-800">3 Davis Vantage Pro2</span>
              </div>
            </div>
          </div>
        </HoverTile>

        {/* Stream 4: Tree Canopy & Street View */}
        <HoverTile
          content={{
            title: "Street Trees & Shade",
            badge: "DeepLab v3+ Vision",
            summary: "Greenery (GVI) and sky openness (SVF) cooling street corridors by up to 2.2°C.",
            details: "Panoramic vision features (64 PCA dimensions)",
          }}
          position="bottom"
          align="end"
          className="cursor-pointer"
        >
          <div className="bg-[#FAF8F5] hover:bg-emerald-50/40 transition p-3.5 rounded-xl border border-[#EAE5DC] hover:border-emerald-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                <Trees className="w-3.5 h-3.5 text-emerald-700" />
                Street Trees &amp; Shade
              </span>
              <span className="text-[11px] font-medium bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded">
                Deep Learning View
              </span>
            </div>

            <div className="mt-2.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-stone-900">
                  21%
                </span>
                <span className="text-xs font-medium text-stone-600">Tree Greenery (GVI)</span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#EAE5DC] text-[11px] text-stone-600 space-y-1">
              <div className="flex justify-between">
                <span>AI Vision Vector:</span>
                <span className="font-semibold text-stone-800">64 PCA dimensions</span>
              </div>
              <div className="flex justify-between">
                <span>Sky View (SVF):</span>
                <span className="font-semibold text-emerald-700">0.34 canyon openness</span>
              </div>
            </div>
          </div>
        </HoverTile>
      </div>
    </div>
  );
}
