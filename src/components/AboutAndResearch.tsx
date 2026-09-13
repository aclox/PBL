import React from "react";
import {
  GraduationCap,
  Layers,
  Satellite,
  Radio,
  Trees,
  CheckCircle2,
  Building,
  ThermometerSun,
  BookOpen,
} from "lucide-react";

export function AboutAndResearch() {
  return (
    <div id="about-research-page" className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl p-6 shadow-xs text-stone-800 space-y-6">
      {/* Header */}
      <div className="pb-5 border-b border-[#EFECE6]">
        <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs tracking-wider uppercase mb-1">
          <BookOpen className="w-4 h-4 text-emerald-700" />
          Field Guide &amp; Research Documentation
        </div>
        <h2 className="text-xl font-bold text-stone-900">
          About the Jaipur Urban Heat Forecasting System
        </h2>
        <p className="text-xs text-stone-500 mt-1 max-w-3xl leading-relaxed">
          A multi-modal deep learning platform developed at Manipal University Jaipur to forecast street-level temperatures 1 to 48 hours in advance at 100-metre resolution.
        </p>
      </div>

      {/* 3 Simple Pillars Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-stone-900">
            100-Metre Precision
          </h3>
          <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
            Traditional weather forecasts cover 25 km² areas. Our system divides the city into 40,000 neighborhood tiles of 100m × 100m, revealing microclimates between tree-lined streets and concrete corridors.
          </p>
        </div>

        <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
            <Satellite className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-stone-900">
            Fused Multi-Source Data
          </h3>
          <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
            We harmonize thermal infrared readings from NASA/USGS Landsat satellites with European Copernicus atmospheric models, street-view tree photos, and 150 ground weather stations.
          </p>
        </div>

        <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
            <ThermometerSun className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-stone-900">
            31% Error Reduction
          </h3>
          <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
            Our spatio-temporal AI reduces 24-hour prediction error to 1.38°C (compared to 2.01°C for standard statistical models), providing vital early warnings for municipal heat emergencies.
          </p>
        </div>
      </div>

      {/* Pilot Testbed Zone Summary */}
      <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-stone-900">
          The Jaipur Pilot Testbed (400 km²)
        </h3>
        <p className="text-xs text-stone-600 leading-relaxed">
          Jaipur, Rajasthan experiences extreme arid summer heat exceeding 45°C. Dense historic architecture, narrow street canyons, and rapid urban expansion make it a prime candidate for hyperlocal heat island mitigation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="bg-white p-3 rounded-xl border border-[#E5DFD5]">
            <span className="text-xs font-bold text-stone-900 block">Walled City Core</span>
            <span className="text-[11px] text-stone-500 mt-0.5 block">Johari &amp; Bapu Bazaar</span>
            <span className="text-xs font-semibold text-rose-700 mt-1 block">Peak Heat: 44.5°C</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#E5DFD5]">
            <span className="text-xs font-bold text-stone-900 block">Civil Lines</span>
            <span className="text-[11px] text-stone-500 mt-0.5 block">Shaded Residential Ward</span>
            <span className="text-xs font-semibold text-emerald-700 mt-1 block">Peak Heat: 39.8°C</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#E5DFD5]">
            <span className="text-xs font-bold text-stone-900 block">VKIA Industrial</span>
            <span className="text-[11px] text-stone-500 mt-0.5 block">Metal &amp; Concrete Roofs</span>
            <span className="text-xs font-semibold text-rose-700 mt-1 block">Peak Heat: 45.2°C</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#E5DFD5]">
            <span className="text-xs font-bold text-stone-900 block">Jawahar Circle Park</span>
            <span className="text-[11px] text-stone-500 mt-0.5 block">Urban Forest Oasis</span>
            <span className="text-xs font-semibold text-emerald-700 mt-1 block">Peak Heat: 37.6°C</span>
          </div>
        </div>
      </div>

      {/* Academic Credits & Citation */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
            <GraduationCap className="w-4 h-4 text-emerald-700" />
            <span>Manipal University Jaipur &bull; Department of Computer Science &amp; Engineering</span>
          </div>
          <p className="text-xs text-emerald-800 mt-1">
            Research authors: Akshit Goel, Swaraj Roy, Dr. Sandeep Chaurasia (DSE2170, Nov 2025).
          </p>
        </div>
        <div className="text-xs text-emerald-800 font-mono bg-white px-3 py-1.5 rounded-lg border border-emerald-300 self-start md:self-auto">
          Landsat 8/9 &bull; Copernicus ERA5 &bull; 150 IoT
        </div>
      </div>
    </div>
  );
}
