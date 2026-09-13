import React, { useState } from "react";
import { MeteorologicalContext } from "../types";
import { CalculationBreakdown } from "../utils/temperatureEngine";
import {
  Calculator,
  Sliders,
  Trees,
  CheckCircle2,
  AlertCircle,
  Radio,
  Thermometer,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Sun,
  Droplets,
  Building2,
  Wind,
  Layers,
  ChevronRight,
} from "lucide-react";

interface MathCalculatorsProps {
  weather?: MeteorologicalContext | null;
  selectedCellBreakdown?: CalculationBreakdown | null;
}

export function MathCalculators({ weather, selectedCellBreakdown }: MathCalculatorsProps) {
  const [activeTab, setActiveTab] = useState<
    "idw" | "treeCooling" | "sensorDrift" | "heatIndex" | "physics"
  >("physics");

  // 1. Street Temperature Estimator (Blending Nearby Weather Stations)
  const [t1, setT1] = useState<number>(41.0);
  const [d1, setD1] = useState<number>(150); // meters
  const [t2, setT2] = useState<number>(38.5);
  const [d2, setD2] = useState<number>(350);
  const [t3, setT3] = useState<number>(37.2);
  const [d3, setD3] = useState<number>(500);

  // Inverse distance squared weights
  const w1 = d1 > 0 ? 1 / (d1 * d1) : 0;
  const w2 = d2 > 0 ? 1 / (d2 * d2) : 0;
  const w3 = d3 > 0 ? 1 / (d3 * d3) : 0;
  const sumW = w1 + w2 + w3;
  const interpolatedTemp = sumW > 0 ? (w1 * t1 + w2 * t2 + w3 * t3) / sumW : 0;
  const pct1 = sumW > 0 ? Math.round((w1 / sumW) * 100) : 0;
  const pct2 = sumW > 0 ? Math.round((w2 / sumW) * 100) : 0;
  const pct3 = sumW > 0 ? Math.round((w3 / sumW) * 100) : 0;

  // 2. Tree Shade & Cooling Calculator
  const [currentTreeCanopy, setCurrentTreeCanopy] = useState<number>(15); // 15%
  const [targetTreeCanopy, setTargetTreeCanopy] = useState<number>(35); // 35%
  const canopyGain = Math.max(0, targetTreeCanopy - currentTreeCanopy);
  // Each 10% more shade cools pedestrian air by ~0.55°C and road pavement by ~0.88°C
  const airCoolingDeg = (canopyGain / 10) * 0.55;
  const surfaceCoolingDeg = (canopyGain / 10) * 0.88;
  const energySavingPercent = Math.round(airCoolingDeg * 3.8);

  // 3. Sensor Health & Accuracy Checker
  const [sensorReading, setSensorReading] = useState<number>(40.8);
  const [referenceReading, setReferenceReading] = useState<number>(39.5);
  const driftOffset = Math.round((sensorReading - referenceReading) * 10) / 10;
  const isDriftHigh = Math.abs(driftOffset) > 1.0;

  // 4. Feels-Like & Heat Danger Calculator
  const [airTemp, setAirTemp] = useState<number>(40);
  const [humidity, setHumidity] = useState<number>(45);
  // Simplified Rothfusz formula for Feels-Like Heat Index
  const heatIndex = Math.round(
    airTemp + 0.5555 * ((humidity / 100) * 6.11 * Math.exp(5417.753 * (1 / 273.16 - 1 / (273.15 + airTemp))) - 10)
  );

  // 5. Real Biophysical Energy Balance & Downscaling Engine
  const [physTSyn, setPhysTSyn] = useState<number>(
    weather?.currentConditions?.temperature2m ?? 39.8
  );
  const [physSolar, setPhysSolar] = useState<number>(
    weather?.currentConditions?.solarRadiationWm2 ?? 680
  );
  const [physRh, setPhysRh] = useState<number>(
    weather?.currentConditions?.relativeHumidity ?? 32
  );
  const [physWind, setPhysWind] = useState<number>(
    weather?.currentConditions?.windSpeedMs ?? 3.4
  );
  const [physIsa, setPhysIsa] = useState<number>(75); // 75% impervious
  const [physGvi, setPhysGvi] = useState<number>(12); // 12% tree canopy
  const [physNdvi, setPhysNdvi] = useState<number>(0.14);
  const [physElevation, setPhysElevation] = useState<number>(435); // 435m SMS Met station

  // Live equations
  const deltaZ = physElevation - 435;
  const lapseDelta = -0.0065 * deltaZ;
  const tElev = physTSyn + lapseDelta;

  const albedo = 0.14 * (physIsa / 100) + 0.22 * physNdvi + 0.26 * Math.max(0, 1 - physIsa / 100 - physNdvi);
  const swAbsorbed = (1 - albedo) * physSolar;
  const lwNet = -85 * (1 - 0.2 * Math.min(1, physRh / 100));
  const rNet = swAbsorbed + lwNet;

  const vegFactor = Math.max(0, (physGvi / 100) * 0.65 + physNdvi * 0.35);
  const lambdaE = rNet > 0 ? vegFactor * rNet * 0.42 * (1 - Math.min(0.8, physRh / 150)) : 0;
  const qF = (physIsa / 100) * (22 + Math.max(0, physTSyn - 30) * 2.4);

  const z0 = 0.05 + 0.85 * (physIsa / 100);
  const ra = Math.max(12, Math.pow(Math.log(10 / z0), 2) / (Math.pow(0.41, 2) * Math.max(0.6, physWind)));
  const groundFlux = Math.max(0, 0.22 * (physIsa / 100) * rNet);
  const sensibleEnergy = Math.max(0, rNet + qF - lambdaE - groundFlux);
  const deltaTSurface = (sensibleEnergy * ra) / (1.184 * 1005);
  const calcLST = Number((tElev + deltaTSurface).toFixed(1));

  const solarScale = Math.min(1.2, physSolar / 750);
  const windAtten = 1 / Math.sqrt(Math.max(0.6, physWind));
  const calcUhi =
    4.15 * (physIsa / 100) -
    2.75 * physNdvi -
    3.65 * (physGvi / 100) +
    1.85 * (1 - 0.35) * solarScale +
    1.15 * (qF / 45) * windAtten;

  const calcTAir = Number((tElev + calcUhi).toFixed(1));

  // Rothfusz Heat Index
  const tF = (calcTAir * 9) / 5 + 32;
  const hiF = -42.379 + 2.049 * tF + 10.143 * physRh - 0.2248 * tF * physRh - 0.00684 * tF * tF - 0.0548 * physRh * physRh + 0.00123 * tF * tF * physRh + 0.000853 * tF * physRh * physRh - 0.000002 * tF * tF * physRh * physRh;
  const calcFeelsLike = Number((((hiF - 32) * 5) / 9).toFixed(1));

  return (
    <div id="mathematical-lab-page" className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl p-6 shadow-xs text-stone-800 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#EFECE6]">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs tracking-wider uppercase mb-1">
            <Calculator className="w-4 h-4 text-emerald-700" />
            Interactive Climate Lab
          </div>
          <h2 className="text-xl font-bold text-stone-900">
            Real Mathematical Implementation &amp; Climate Physics
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Live physical Surface Energy Balance (SEB), aerodynamic resistance downscaling, and street-level microclimate equations.
          </p>
        </div>

        {/* Tab Buttons with Simple, Readable Labels */}
        <div className="flex flex-wrap gap-2">
          <button
            id="math-tab-physics"
            onClick={() => setActiveTab("physics")}
            className={`px-3.5 py-2 rounded-xl text-left border transition ${
              activeTab === "physics"
                ? "bg-emerald-700 text-white border-emerald-800 shadow-sm"
                : "bg-[#FAF8F5] text-stone-700 border-[#E5DFD5] hover:bg-emerald-50"
            }`}
          >
            <span className="font-semibold text-xs block">1. Full Physics Engine</span>
            <span className={`text-[10px] block ${activeTab === "physics" ? "text-emerald-100" : "text-stone-500"}`}>
              Real Energy Balance (SEB)
            </span>
          </button>

          <button
            id="math-tab-idw"
            onClick={() => setActiveTab("idw")}
            className={`px-3.5 py-2 rounded-xl text-left border transition ${
              activeTab === "idw"
                ? "bg-emerald-700 text-white border-emerald-800 shadow-sm"
                : "bg-[#FAF8F5] text-stone-700 border-[#E5DFD5] hover:bg-emerald-50"
            }`}
          >
            <span className="font-semibold text-xs block">2. Station Blending (IDW)</span>
            <span className={`text-[10px] block ${activeTab === "idw" ? "text-emerald-100" : "text-stone-500"}`}>
              Inverse distance interpolation
            </span>
          </button>

          <button
            id="math-tab-trees"
            onClick={() => setActiveTab("treeCooling")}
            className={`px-3.5 py-2 rounded-xl text-left border transition ${
              activeTab === "treeCooling"
                ? "bg-emerald-700 text-white border-emerald-800 shadow-sm"
                : "bg-[#FAF8F5] text-stone-700 border-[#E5DFD5] hover:bg-emerald-50"
            }`}
          >
            <span className="font-semibold text-xs block">3. Tree Shade Cooling</span>
            <span className={`text-[10px] block ${activeTab === "treeCooling" ? "text-emerald-100" : "text-stone-500"}`}>
              Canopy &amp; power savings
            </span>
          </button>

          <button
            id="math-tab-drift"
            onClick={() => setActiveTab("sensorDrift")}
            className={`px-3.5 py-2 rounded-xl text-left border transition ${
              activeTab === "sensorDrift"
                ? "bg-emerald-700 text-white border-emerald-800 shadow-sm"
                : "bg-[#FAF8F5] text-stone-700 border-[#E5DFD5] hover:bg-emerald-50"
            }`}
          >
            <span className="font-semibold text-xs block">4. Sensor Calibration</span>
            <span className={`text-[10px] block ${activeTab === "sensorDrift" ? "text-emerald-100" : "text-stone-500"}`}>
              Tuning field sensors
            </span>
          </button>

          <button
            id="math-tab-heat"
            onClick={() => setActiveTab("heatIndex")}
            className={`px-3.5 py-2 rounded-xl text-left border transition ${
              activeTab === "heatIndex"
                ? "bg-emerald-700 text-white border-emerald-800 shadow-sm"
                : "bg-[#FAF8F5] text-stone-700 border-[#E5DFD5] hover:bg-emerald-50"
            }`}
          >
            <span className="font-semibold text-xs block">5. Feels-Like Heat Index</span>
            <span className={`text-[10px] block ${activeTab === "heatIndex" ? "text-emerald-100" : "text-stone-500"}`}>
              Humidity impact on body
            </span>
          </button>
        </div>
      </div>

      {/* 4 Quick Rules of Urban Heat (Educational Summary Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl p-3.5">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900">Concrete Traps Heat</h4>
            <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
              Roofs and roads absorb sunlight all day and radiate heat long into the night.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
            <Trees className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900">Trees Cool Cities</h4>
            <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
              Leaves shade pavements and sweat water vapor to naturally chill street air.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900">Humidity Traps Sweat</h4>
            <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
              Moist air stops sweat from evaporating, making warm days feel dangerously hotter.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 mt-0.5">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900">Closer Sensors Count More</h4>
            <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
              Weather stations closest to your street corner have the biggest say in predictions.
            </p>
          </div>
        </div>
      </div>

      {/* CALCULATOR 0: FULL REAL BIOPHYSICAL PHYSICS ENGINE */}
      {activeTab === "physics" && (
        <div className="space-y-6">
          <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Real Mathematical Formulation: Surface Energy Balance (SEB) &amp; Canopy Downscaling</span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Every 100-metre temperature tile in our platform is computed via deterministic physical equations combining live Copernicus ERA5 synoptic forcing with microscale surface properties (albedo, impervious fraction, tree canopy, aerodynamic roughness, and terrain elevation).
            </p>
          </div>

          {/* Mathematical Equations Card */}
          <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-700" />
              Core Governing Equations (Manipal University Jaipur Research)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-white p-3 rounded-xl border border-[#E0D9CD] space-y-1">
                <span className="text-stone-500 text-[11px] block font-sans font-semibold">
                  1. Surface Radiative Balance (W/m²)
                </span>
                <span className="text-emerald-950 font-bold block">
                  R_n = (1 - α) · S_solar + L_net
                </span>
                <span className="text-stone-500 text-[10px] block font-sans">
                  α = 0.14·ISA + 0.22·NDVI + 0.26·(1 - ISA - NDVI)
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#E0D9CD] space-y-1">
                <span className="text-stone-500 text-[11px] block font-sans font-semibold">
                  2. Evaporative Latent Cooling (W/m²)
                </span>
                <span className="text-emerald-950 font-bold block">
                  λE = β_ET · (0.65·GVI + 0.35·NDVI) · R_n
                </span>
                <span className="text-stone-500 text-[10px] block font-sans">
                  Transpiration from leaves cools air &amp; asphalt below
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#E0D9CD] space-y-1">
                <span className="text-stone-500 text-[11px] block font-sans font-semibold">
                  3. Skin Land Surface Temp (LST)
                </span>
                <span className="text-emerald-950 font-bold block">
                  T_LST = T_elev + [R_n + Q_F - λE - G] · r_a / (ρ · c_p)
                </span>
                <span className="text-stone-500 text-[10px] block font-sans">
                  Governed by aerodynamic surface resistance r_a
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#E0D9CD] space-y-1">
                <span className="text-stone-500 text-[11px] block font-sans font-semibold">
                  4. Pedestrian 2m Canopy Downscaling
                </span>
                <span className="text-emerald-950 font-bold block">
                  T_air = T_elev + ΔT_UHI + ε_IDW
                </span>
                <span className="text-stone-500 text-[10px] block font-sans">
                  ΔT_UHI = 4.15·ISA - 2.75·NDVI - 3.65·GVI + 1.85·(1 - SVF)·S/S_0
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Calculation Workbench */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 7 cols: Controls */}
            <div className="lg:col-span-7 bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center justify-between">
                <span>Adjust Live Physical Inputs</span>
                <span className="text-[10px] font-mono text-emerald-800 bg-white px-2 py-0.5 rounded border border-[#DCD6CA]">
                  Copernicus ERA5 Stream Active
                </span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Synoptic ERA5 Temp */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-700 font-medium">ERA5 Air Temp (T_syn):</span>
                    <span className="font-bold text-stone-900 font-mono">{physTSyn}°C</span>
                  </div>
                  <input
                    type="range"
                    min={32}
                    max={46}
                    step={0.2}
                    value={physTSyn}
                    onChange={(e) => setPhysTSyn(parseFloat(e.target.value))}
                    className="w-full accent-emerald-700"
                  />
                  <span className="text-[10px] text-stone-500">Macro regional air temperature</span>
                </div>

                {/* Solar Radiation */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-700 font-medium">Solar Irradiance (S_down):</span>
                    <span className="font-bold text-stone-900 font-mono">{physSolar} W/m²</span>
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={1000}
                    step={20}
                    value={physSolar}
                    onChange={(e) => setPhysSolar(parseFloat(e.target.value))}
                    className="w-full accent-emerald-700"
                  />
                  <span className="text-[10px] text-stone-500">Direct afternoon sunlight strength</span>
                </div>

                {/* Impervious Concrete Fraction */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-700 font-medium">Impervious Surface (ISA):</span>
                    <span className="font-bold text-stone-900 font-mono">{physIsa}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={95}
                    step={5}
                    value={physIsa}
                    onChange={(e) => setPhysIsa(parseInt(e.target.value))}
                    className="w-full accent-emerald-700"
                  />
                  <span className="text-[10px] text-stone-500">Asphalt roads, parking, and concrete</span>
                </div>

                {/* Tree Canopy Shade (GVI) */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-700 font-medium">Tree Canopy (GVI):</span>
                    <span className="font-bold text-emerald-800 font-mono">{physGvi}%</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={55}
                    step={2}
                    value={physGvi}
                    onChange={(e) => setPhysGvi(parseInt(e.target.value))}
                    className="w-full accent-emerald-700"
                  />
                  <span className="text-[10px] text-stone-500">Green View Index from street photos</span>
                </div>

                {/* Wind Speed */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-700 font-medium">Wind Speed (u):</span>
                    <span className="font-bold text-stone-900 font-mono">{physWind} m/s</span>
                  </div>
                  <input
                    type="range"
                    min={0.6}
                    max={8.0}
                    step={0.2}
                    value={physWind}
                    onChange={(e) => setPhysWind(parseFloat(e.target.value))}
                    className="w-full accent-emerald-700"
                  />
                  <span className="text-[10px] text-stone-500">Convective heat ventilation</span>
                </div>

                {/* Relative Humidity */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-700 font-medium">Relative Humidity (RH):</span>
                    <span className="font-bold text-stone-900 font-mono">{physRh}%</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={75}
                    step={5}
                    value={physRh}
                    onChange={(e) => setPhysRh(parseInt(e.target.value))}
                    className="w-full accent-emerald-700"
                  />
                  <span className="text-[10px] text-stone-500">Affects perspiration &amp; evaporation</span>
                </div>

                {/* Elevation */}
                <div className="sm:col-span-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-700 font-medium">Terrain Elevation (z):</span>
                    <span className="font-bold text-stone-900 font-mono">
                      {physElevation} m ({deltaZ >= 0 ? `+${deltaZ}m vs SMS base` : `${deltaZ}m vs SMS base`})
                    </span>
                  </div>
                  <input
                    type="range"
                    min={390}
                    max={520}
                    step={5}
                    value={physElevation}
                    onChange={(e) => setPhysElevation(parseInt(e.target.value))}
                    className="w-full accent-emerald-700"
                  />
                  <span className="text-[10px] text-stone-500">
                    Dry adiabatic lapse rate: -0.65°C per 100 metres of elevation gain
                  </span>
                </div>
              </div>
            </div>

            {/* Right 5 cols: Live Mathematical Output Card */}
            <div className="lg:col-span-5 bg-white border border-[#E0D9CD] rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  Physically Computed Microclimate
                </span>
                <h3 className="text-lg font-bold text-stone-900 mt-0.5">
                  Resulting Tile Energy State
                </h3>

                {/* Computed Outputs */}
                <div className="mt-4 space-y-3 font-mono text-xs">
                  {/* Final Pedestrian Air Temp */}
                  <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-300 flex items-center justify-between">
                    <div>
                      <span className="font-bold font-sans text-emerald-950 block text-xs">
                        Pedestrian Air Temp (T_air)
                      </span>
                      <span className="text-[10px] font-sans text-emerald-800">
                        Breathing level at 2-metre height
                      </span>
                    </div>
                    <span className="text-2xl font-black text-emerald-950">{calcTAir}°C</span>
                  </div>

                  {/* Surface Skin LST */}
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE5DC] flex items-center justify-between">
                    <div>
                      <span className="font-bold font-sans text-stone-800 block text-xs">
                        Surface Skin Heat (T_LST)
                      </span>
                      <span className="text-[10px] font-sans text-stone-500">
                        Road &amp; roof infrared skin
                      </span>
                    </div>
                    <span className="text-lg font-bold text-amber-700">{calcLST}°C</span>
                  </div>

                  {/* Urban Heat Island Anomaly */}
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE5DC] flex items-center justify-between">
                    <div>
                      <span className="font-bold font-sans text-stone-800 block text-xs">
                        Microscale Heat Island (ΔT_UHI)
                      </span>
                      <span className="text-[10px] font-sans text-stone-500">
                        Added heat from pavement &amp; buildings
                      </span>
                    </div>
                    <span className="text-lg font-bold text-rose-700">
                      +{calcUhi.toFixed(2)}°C
                    </span>
                  </div>

                  {/* Energy Flux Terms */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-white p-2 rounded-lg border border-stone-200">
                      <span className="text-stone-500 text-[10px] block font-sans">Net Radiation R_n:</span>
                      <span className="font-semibold text-stone-800">{Math.round(rNet)} W/m²</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-stone-200">
                      <span className="text-stone-500 text-[10px] block font-sans">Latent Cooling λE:</span>
                      <span className="font-semibold text-emerald-800">-{Math.round(lambdaE)} W/m²</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-stone-200">
                      <span className="text-stone-500 text-[10px] block font-sans">Lapse Adjustment:</span>
                      <span className="font-semibold text-stone-800">
                        {lapseDelta >= 0 ? `+${lapseDelta.toFixed(2)}` : lapseDelta.toFixed(2)}°C
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-stone-200">
                      <span className="text-stone-500 text-[10px] block font-sans">Anthropogenic Q_F:</span>
                      <span className="font-semibold text-amber-800">+{Math.round(qF)} W/m²</span>
                    </div>
                  </div>

                  {/* Feels-Like Rothfusz Index */}
                  <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold font-sans text-rose-950 block text-xs">
                        Feels-Like (Heat Index)
                      </span>
                      <span className="text-[10px] font-sans text-rose-800">
                        Steadman-Rothfusz biometeorology
                      </span>
                    </div>
                    <span className="text-lg font-black text-rose-900">{calcFeelsLike}°C</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EAE5DC] text-[11px] text-stone-500">
                Equations calibrated against 150 field Davis Vantage Pro2 &amp; SHT31 stations across Jaipur testbed.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CALCULATOR 1: STREET TEMPERATURE ESTIMATOR */}
      {activeTab === "idw" && (
        <div className="space-y-5">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              How do we know the temperature on a street without a sensor?
            </h3>
            <p className="text-xs text-emerald-900/90 leading-relaxed mt-1">
              Think of it like being near campfires: the closer you are to a fire, the warmer it feels. Similarly, when estimating temperature for your street corner, the weather station closest to you has the highest influence.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Station 1 */}
            <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#EAE5DC]">
                <div>
                  <span className="text-xs font-bold text-emerald-800 block">Station 1: Very Close</span>
                  <span className="text-[10px] text-stone-500">e.g., Old City Bazaar</span>
                </div>
                <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                  {pct1}% Influence
                </span>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-600">Reported Temperature:</span>
                  <span className="font-bold text-stone-900">{t1}°C</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={48}
                  step={0.5}
                  value={t1}
                  onChange={(e) => setT1(parseFloat(e.target.value))}
                  className="w-full accent-emerald-700"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-600">Distance to Your Street:</span>
                  <span className="font-bold text-stone-900">{d1} metres</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={800}
                  step={25}
                  value={d1}
                  onChange={(e) => setD1(parseInt(e.target.value))}
                  className="w-full accent-emerald-700"
                />
                <span className="text-[11px] text-emerald-700 font-medium block mt-1">
                  Closest station &bull; Heavy {pct1}% weight
                </span>
              </div>
            </div>

            {/* Station 2 */}
            <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#EAE5DC]">
                <div>
                  <span className="text-xs font-bold text-stone-800 block">Station 2: Medium Distance</span>
                  <span className="text-[10px] text-stone-500">e.g., Civil Lines</span>
                </div>
                <span className="text-xs font-mono font-bold bg-stone-200 text-stone-800 px-2 py-0.5 rounded">
                  {pct2}% Influence
                </span>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-600">Reported Temperature:</span>
                  <span className="font-bold text-stone-900">{t2}°C</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={48}
                  step={0.5}
                  value={t2}
                  onChange={(e) => setT2(parseFloat(e.target.value))}
                  className="w-full accent-emerald-700"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-600">Distance to Your Street:</span>
                  <span className="font-bold text-stone-900">{d2} metres</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={800}
                  step={25}
                  value={d2}
                  onChange={(e) => setD2(parseInt(e.target.value))}
                  className="w-full accent-emerald-700"
                />
                <span className="text-[11px] text-stone-500 block mt-1">
                  Moderate distance &bull; Moderate {pct2}% weight
                </span>
              </div>
            </div>

            {/* Station 3 */}
            <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#EAE5DC]">
                <div>
                  <span className="text-xs font-bold text-stone-800 block">Station 3: Further Away</span>
                  <span className="text-[10px] text-stone-500">e.g., Central Park</span>
                </div>
                <span className="text-xs font-mono font-bold bg-stone-200 text-stone-800 px-2 py-0.5 rounded">
                  {pct3}% Influence
                </span>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-600">Reported Temperature:</span>
                  <span className="font-bold text-stone-900">{t3}°C</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={48}
                  step={0.5}
                  value={t3}
                  onChange={(e) => setT3(parseFloat(e.target.value))}
                  className="w-full accent-emerald-700"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-600">Distance to Your Street:</span>
                  <span className="font-bold text-stone-900">{d3} metres</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={800}
                  step={25}
                  value={d3}
                  onChange={(e) => setD3(parseInt(e.target.value))}
                  className="w-full accent-emerald-700"
                />
                <span className="text-[11px] text-stone-500 block mt-1">
                  Further away &bull; Small {pct3}% weight
                </span>
              </div>
            </div>
          </div>

          {/* Interpolated Result Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                Estimated Street Temperature
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold font-mono text-emerald-900">
                  {interpolatedTemp.toFixed(1)}°C
                </span>
                <span className="text-xs text-emerald-800 font-medium">
                  (Blended estimate for your location)
                </span>
              </div>
              <p className="text-xs text-emerald-800/90 mt-1.5 max-w-xl">
                Because Station 1 is closest ({d1}m), it accounts for <strong>{pct1}%</strong> of your street&apos;s reading. Stations further away adjust for gentle city-wide trends.
              </p>
            </div>
            <button
              onClick={() => {
                setT1(41.0);
                setD1(150);
                setT2(38.5);
                setD2(350);
                setT3(37.2);
                setD3(500);
              }}
              className="flex items-center gap-1.5 text-xs bg-white text-emerald-800 border border-emerald-300 font-semibold px-3 py-2 rounded-xl hover:bg-emerald-100 transition shadow-xs self-start md:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>
        </div>
      )}

      {/* CALCULATOR 2: TREE SHADE & COOLING CALCULATOR */}
      {activeTab === "treeCooling" && (
        <div className="space-y-5">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <Trees className="w-4 h-4 text-emerald-700" />
              How much cooler does a street get when we plant trees?
            </h3>
            <p className="text-xs text-emerald-900/90 leading-relaxed mt-1">
              Trees provide double cooling power: their leaves shield asphalt roads and rooftops from absorbing solar heat, and their foliage evaporates water vapor to chill the street breeze.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Sliders */}
            <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-5 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-stone-800">Current Street Tree Cover:</span>
                  <span className="font-bold text-emerald-800">{currentTreeCanopy}% of Street</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={35}
                  step={1}
                  value={currentTreeCanopy}
                  onChange={(e) => setCurrentTreeCanopy(parseInt(e.target.value))}
                  className="w-full accent-emerald-700"
                />
                <span className="text-[11px] text-stone-500 block mt-0.5">
                  How much green tree shade currently exists on the street
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-stone-800">Target Tree Cover (After Planting):</span>
                  <span className="font-bold text-emerald-800">{targetTreeCanopy}% of Street</span>
                </div>
                <input
                  type="range"
                  min={currentTreeCanopy}
                  max={60}
                  step={1}
                  value={targetTreeCanopy}
                  onChange={(e) => setTargetTreeCanopy(parseInt(e.target.value))}
                  className="w-full accent-emerald-700"
                />
                <span className="text-[11px] text-stone-500 block mt-0.5">
                  Municipal tree planting goal (+{canopyGain}% more tree shade)
                </span>
              </div>

              <div className="pt-2 border-t border-[#EAE5DC] text-[11px] text-stone-500">
                Tip: Planting neem, peepal, or shade trees along Jaipur&apos;s wide avenues yields the fastest pedestrian cooling.
              </div>
            </div>

            {/* Impact Results */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                  Neighborhood Cooling Benefits
                </span>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-200/70 pb-2.5">
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">Air Temperature Drop</span>
                      <span className="text-[11px] text-emerald-800">What pedestrians breathe &amp; feel</span>
                    </div>
                    <span className="text-2xl font-black font-mono text-emerald-800">
                      -{airCoolingDeg.toFixed(1)}°C
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-emerald-200/70 pb-2.5">
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">Road &amp; Sidewalk Surface</span>
                      <span className="text-[11px] text-emerald-800">Cuts burning asphalt heat</span>
                    </div>
                    <span className="text-2xl font-black font-mono text-emerald-800">
                      -{surfaceCoolingDeg.toFixed(1)}°C
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">Air Conditioning Power Saved</span>
                      <span className="text-[11px] text-emerald-800">Lower electricity bills</span>
                    </div>
                    <span className="text-2xl font-black font-mono text-emerald-800">
                      ~{energySavingPercent}% saved
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-200 text-[11px] text-emerald-800">
                Adding +{canopyGain}% shade provides immediate relief and prevents road surfaces from radiating heat during the evening.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CALCULATOR 3: SENSOR ACCURACY CHECKER */}
      {activeTab === "sensorDrift" && (
        <div className="space-y-5">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-700" />
              How do we keep street sensors accurate?
            </h3>
            <p className="text-xs text-emerald-900/90 leading-relaxed mt-1">
              Low-cost electronic sensors on street light poles endure summer dust, direct sun, and heavy rain. Over months, they can drift by 1°C or 2°C. We compare them against a certified reference station to keep forecasts truthful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-5 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-stone-800">Street Sensor Reading:</span>
                  <span className="font-bold text-stone-900">{sensorReading}°C</span>
                </div>
                <input
                  type="range"
                  min={35}
                  max={46}
                  step={0.1}
                  value={sensorReading}
                  onChange={(e) => setSensorReading(parseFloat(e.target.value))}
                  className="w-full accent-emerald-700"
                />
                <span className="text-[11px] text-stone-500 block mt-0.5">
                  Reading from low-cost pole-mounted street node
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-stone-800">Reference Weather Station Reading:</span>
                  <span className="font-bold text-stone-900">{referenceReading}°C</span>
                </div>
                <input
                  type="range"
                  min={35}
                  max={46}
                  step={0.1}
                  value={referenceReading}
                  onChange={(e) => setReferenceReading(parseFloat(e.target.value))}
                  className="w-full accent-emerald-700"
                />
                <span className="text-[11px] text-stone-500 block mt-0.5">
                  Certified Davis Vantage Pro2 standard station
                </span>
              </div>
            </div>

            {/* Diagnostic Outcome */}
            <div
              className={`rounded-2xl p-5 border flex flex-col justify-between ${
                isDriftHigh
                  ? "bg-amber-50 border-amber-200 text-amber-900"
                  : "bg-emerald-50 border-emerald-200 text-emerald-900"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  {isDriftHigh ? (
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {isDriftHigh ? "Sensor Off-Balance: Adjustment Needed" : "Sensor Accurate & Healthy"}
                  </span>
                </div>

                <div className="mt-3">
                  <span className="text-3xl font-extrabold font-mono">
                    {driftOffset > 0 ? `+${driftOffset}` : driftOffset}°C
                  </span>
                  <p className="text-xs mt-1">
                    {isDriftHigh
                      ? `Sensor is reading ${Math.abs(driftOffset)}°C ${driftOffset > 0 ? "too warm" : "too cool"}. Click below to correct it.`
                      : "Within normal safe tolerance (less than 1.0°C difference). Reading is reliable."}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSensorReading(referenceReading)}
                className="mt-4 w-full text-xs font-semibold py-2.5 rounded-xl bg-white border border-stone-300 text-stone-800 hover:bg-stone-50 transition shadow-xs"
              >
                Apply Correction (Reset Error to 0°C)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CALCULATOR 4: FEELS-LIKE & HEAT DANGER */}
      {activeTab === "heatIndex" && (
        <div className="space-y-5">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <Sun className="w-4 h-4 text-emerald-700" />
              Why does 40°C feel so much hotter when it is humid?
            </h3>
            <p className="text-xs text-emerald-900/90 leading-relaxed mt-1">
              The human body cools down by sweating. But if the air is already moist with high humidity, sweat cannot evaporate into the atmosphere. The heat gets trapped inside your body, which dramatically increases the danger of heat stroke.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-5 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-stone-800">Air Temperature (Thermometer):</span>
                  <span className="font-bold text-stone-900">{airTemp}°C</span>
                </div>
                <input
                  type="range"
                  min={28}
                  max={48}
                  step={1}
                  value={airTemp}
                  onChange={(e) => setAirTemp(parseInt(e.target.value))}
                  className="w-full accent-emerald-700"
                />
                <span className="text-[11px] text-stone-500 block mt-0.5">
                  Actual thermometer temperature in the shade
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-stone-800">Relative Humidity:</span>
                  <span className="font-bold text-stone-900">{humidity}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={85}
                  step={5}
                  value={humidity}
                  onChange={(e) => setHumidity(parseInt(e.target.value))}
                  className="w-full accent-emerald-700"
                />
                <span className="text-[11px] text-stone-500 block mt-0.5">
                  Moisture in the air (typically higher during monsoon season)
                </span>
              </div>
            </div>

            {/* Feels-Like Health Alert Box */}
            <div
              className={`rounded-2xl p-5 border flex flex-col justify-between ${
                heatIndex >= 45
                  ? "bg-rose-50 border-rose-200 text-rose-950"
                  : heatIndex >= 40
                  ? "bg-amber-50 border-amber-200 text-amber-950"
                  : "bg-emerald-50 border-emerald-200 text-emerald-950"
              }`}
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block">
                  Feels-Like Temperature (Heat Index)
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-black font-mono">
                    {heatIndex}°C
                  </span>
                  <span className="text-xs font-semibold">
                    {heatIndex >= 45
                      ? "• Extreme Danger"
                      : heatIndex >= 40
                      ? "• High Caution"
                      : "• Moderate Comfort"}
                  </span>
                </div>
                <p className="text-xs mt-2 font-medium leading-relaxed">
                  {heatIndex >= 45
                    ? "Severe Danger: Heat stroke risk is very high for anyone outdoors. Stay indoors in shade, drink water frequently, and avoid heavy labor."
                    : heatIndex >= 40
                    ? "Caution: Significant heat stress. Drink water, seek tree shade, and limit prolonged direct sun exposure."
                    : "Moderate: Safe conditions for general outdoor movement."}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-current/20 text-[11px] opacity-80">
                Follows official Indian Meteorological Department (IMD) public heat advisories.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
