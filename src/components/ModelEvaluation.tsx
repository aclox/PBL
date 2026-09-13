import React, { useState } from "react";
import {
  HORIZON_METRICS,
  BASELINE_MODELS,
  ABLATION_STUDY,
} from "../data/researchData";
import {
  Activity,
  Award,
  HelpCircle,
  TrendingDown,
  Gauge,
  Sparkles,
} from "lucide-react";
import { HoverTile } from "./HoverDescription";

export function ModelEvaluation() {
  const [activeTab, setActiveTab] = useState<"horizons" | "baselines" | "ablation">("horizons");

  return (
    <div id="model-evaluation-page" className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl p-6 shadow-xs text-stone-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#EFECE6]">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs tracking-wider uppercase mb-1">
            <Activity className="w-4 h-4 text-emerald-700" />
            Accuracy &amp; Benchmark Lab
          </div>
          <h2 className="text-xl font-bold text-stone-900">
            Model Performance &amp; Evaluation
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Re-evaluated against 5,520 hourly timesteps from the Jaipur metropolitan study area with the biophysical Surface Energy Balance &amp; IoT kriging downscaling engine.
          </p>
        </div>

        {/* Tab Buttons with Subtitles */}
        <div className="flex flex-wrap gap-2">
          <button
            id="eval-tab-horizons"
            onClick={() => setActiveTab("horizons")}
            className={`px-3.5 py-2 rounded-xl text-left border transition cursor-pointer ${
              activeTab === "horizons"
                ? "bg-emerald-700 text-white border-emerald-800 shadow-sm"
                : "bg-[#FAF8F5] text-stone-700 border-[#E5DFD5] hover:bg-emerald-50"
            }`}
          >
            <span className="font-semibold text-xs block">Forecast Timeframes</span>
            <span className={`text-[10px] block ${activeTab === "horizons" ? "text-emerald-100" : "text-stone-500"}`}>
              1h to 48h accuracy
            </span>
          </button>

          <button
            id="eval-tab-baselines"
            onClick={() => setActiveTab("baselines")}
            className={`px-3.5 py-2 rounded-xl text-left border transition cursor-pointer ${
              activeTab === "baselines"
                ? "bg-emerald-700 text-white border-emerald-800 shadow-sm"
                : "bg-[#FAF8F5] text-stone-700 border-[#E5DFD5] hover:bg-emerald-50"
            }`}
          >
            <span className="font-semibold text-xs block">Model Comparison</span>
            <span className={`text-[10px] block ${activeTab === "baselines" ? "text-emerald-100" : "text-stone-500"}`}>
              Physics AI vs Baselines
            </span>
          </button>

          <button
            id="eval-tab-ablation"
            onClick={() => setActiveTab("ablation")}
            className={`px-3.5 py-2 rounded-xl text-left border transition cursor-pointer ${
              activeTab === "ablation"
                ? "bg-emerald-700 text-white border-emerald-800 shadow-sm"
                : "bg-[#FAF8F5] text-stone-700 border-[#E5DFD5] hover:bg-emerald-50"
            }`}
          >
            <span className="font-semibold text-xs block">Data Importance</span>
            <span className={`text-[10px] block ${activeTab === "ablation" ? "text-emerald-100" : "text-stone-500"}`}>
              Modality ablation impact
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: FORECAST HORIZONS */}
      {activeTab === "horizons" && (
        <div className="space-y-6">
          {/* 3 Main Number Cards with Hover Descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: 1-Hour Nowcast */}
            <HoverTile
              content={{
                title: "1-Hour Nowcast",
                badge: "MAE: ±0.58°C",
                summary: "Immediate next-hour microclimate prediction at 100m street resolution.",
                details: "150 IoT sensor feeds + hourly ERA5 forcing",
              }}
              position="bottom"
              align="start"
              className="cursor-pointer"
            >
              <div className="bg-[#FAF8F5] hover:bg-emerald-50/40 border border-[#EAE5DC] hover:border-emerald-300 rounded-2xl p-4 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-600 block">
                    1-Hour Nowcast Error
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium">Hover for details</span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold font-mono text-emerald-800">
                    ±0.58°C
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    R² = 0.97
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2.5 pt-2 border-t border-[#EAE5DC]">
                  <span>Skill Score: <strong className="text-stone-800 font-mono">78.4%</strong></span>
                  <span className="text-emerald-700 font-medium">Hyper-precise</span>
                </div>
              </div>
            </HoverTile>

            {/* Card 2: 24-Hour Peak Forecast */}
            <HoverTile
              content={{
                title: "24-Hour Peak Heat",
                badge: "MAE: ±1.18°C",
                summary: "Next-day afternoon heat peak prediction during maximum solar radiation.",
                details: "Surface Energy Balance + CNN-LSTM model",
              }}
              position="bottom"
              align="center"
              className="cursor-pointer"
            >
              <div className="bg-[#FAF8F5] hover:bg-emerald-50/40 border border-[#EAE5DC] hover:border-emerald-300 rounded-2xl p-4 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-600 block">
                    24-Hour Peak Forecast
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium">Hover for details</span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold font-mono text-emerald-800">
                    ±1.18°C
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    R² = 0.91
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2.5 pt-2 border-t border-[#EAE5DC]">
                  <span>Skill Score: <strong className="text-stone-800 font-mono">58.6%</strong></span>
                  <span className="text-emerald-700 font-medium">-33.7% vs SARIMAX</span>
                </div>
              </div>
            </HoverTile>

            {/* Card 3: 48-Hour Heatwave Horizon */}
            <HoverTile
              content={{
                title: "48-Hour Heatwave Outlook",
                badge: "MAE: ±1.62°C",
                summary: "Two-day urban heat outlook tracking thermal mass retention in masonry buildings.",
                details: "Multi-day forecast + building density",
              }}
              position="bottom"
              align="end"
              className="cursor-pointer"
            >
              <div className="bg-[#FAF8F5] hover:bg-emerald-50/40 border border-[#EAE5DC] hover:border-emerald-300 rounded-2xl p-4 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-600 block">
                    48-Hour Heatwave Horizon
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium">Hover for details</span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold font-mono text-emerald-800">
                    ±1.62°C
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    R² = 0.84
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2.5 pt-2 border-t border-[#EAE5DC]">
                  <span>Skill Score: <strong className="text-stone-800 font-mono">44.5%</strong></span>
                  <span className="text-emerald-700 font-medium">Early warning ready</span>
                </div>
              </div>
            </HoverTile>
          </div>

          {/* Table / Visual Bar Progress */}
          <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  Error Breakdown by Forecast Horizon
                </h3>
                <p className="text-xs text-stone-500">
                  Hover over any horizon row to inspect biophysical mechanics and skill score details.
                </p>
              </div>
              <span className="text-xs font-semibold bg-emerald-100/70 text-emerald-800 px-2.5 py-1 rounded-lg">
                Engine Calibrated
              </span>
            </div>

            <div className="space-y-3">
              {HORIZON_METRICS.map((h) => {
                const barWidth = Math.min(100, Math.round((h.mae / 2.0) * 100));
                return (
                  <HoverTile
                    key={h.horizon}
                    content={{
                      title: `${h.horizon} Verification`,
                      badge: `Score: ${h.skillScore}`,
                      summary: `MAE: ±${h.mae}°C, RMSE: ${h.rmse}°C, and ${Math.round(h.r2 * 100)}% variance explained across 5,520 test hours.`,
                      details: "Tested across all 6 Jaipur urban zones",
                    }}
                    position="top"
                    align="center"
                    className="cursor-pointer"
                  >
                    <div className="bg-white p-3.5 rounded-xl border border-[#E5DFD5] hover:border-emerald-300 hover:shadow-xs transition">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-stone-800">
                          {h.horizon}
                        </span>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-stone-600">
                            MAE: <strong className="text-emerald-800">±{h.mae}°C</strong>
                          </span>
                          <span className="text-stone-400">|</span>
                          <span className="text-stone-600">
                            RMSE: <strong className="text-stone-700">{h.rmse}°C</strong>
                          </span>
                          <span className="text-stone-400">|</span>
                          <span className="text-stone-500">
                            R²: <strong className="text-stone-800">{Math.round(h.r2 * 100)}%</strong>
                          </span>
                        </div>
                      </div>
                      {/* Visual Bar */}
                      <div className="w-full bg-[#EAE5DC] h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-700 h-full rounded-full transition-all duration-500"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  </HoverTile>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MODEL COMPARISON */}
      {activeTab === "baselines" && (
        <div className="space-y-6">
          <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-5">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs mb-1">
              <Award className="w-4 h-4 text-emerald-700" />
              <span>Tested on the Same Jaipur 2023–2025 Summer Dataset (24-Hour Horizon)</span>
            </div>
            <h3 className="text-sm font-bold text-stone-900 mb-1">
              Why Does the Physics-Informed Engine Outperform Traditional Models?
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Standard meteorological models like SARIMAX, raw NWP, or IDW interpolation treat the city as uniform or rely strictly on historical time-series lags. Our system combines physical Surface Energy Balance equations, Landsat thermal skin maps, street greenery views, and 150 live ground sensors — achieving a <strong>33.7% reduction in error vs SARIMAX</strong> and <strong>44.9% vs raw ERA5</strong>. Hover over any model to inspect its architecture.
            </p>
          </div>

          <div className="space-y-3">
            {BASELINE_MODELS.map((m, idx) => {
              const isBest = idx === BASELINE_MODELS.length - 1;
              return (
                <HoverTile
                  key={m.model}
                  content={{
                    title: m.model,
                    badge: isBest ? "Top Model" : `MAE: ±${m.mae}°C`,
                    summary: isBest
                      ? "Combines biophysical surface heat conservation with neural layers and real-time residual kriging."
                      : `Standard meteorological baseline with ±${m.mae}°C error and ${Math.round(m.r2 * 100)}% R².`,
                    details: isBest ? "SEB + Satellite LST + IoT mesh + Trees" : "Benchmark model for 24h horizon",
                  }}
                  position="top"
                  align="center"
                  className="cursor-pointer"
                >
                  <div
                    className={`p-4 rounded-2xl border transition ${
                      isBest
                        ? "bg-emerald-50/80 border-emerald-300 shadow-xs"
                        : "bg-[#FAF8F5] border-[#EAE5DC] hover:border-stone-300"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-stone-900">{m.model}</h4>
                          {isBest && (
                            <span className="text-[11px] bg-emerald-700 text-white font-semibold px-2.5 py-0.5 rounded-full">
                              ★ Top Performer (Our Engine)
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-500 mt-0.5 inline-block font-mono">
                          {m.improvementOverPrev}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono self-start sm:self-auto">
                        <div className="text-right">
                          <span className="text-[10px] text-stone-500 block">Prediction Error (MAE)</span>
                          <span
                            className={`text-base font-bold ${
                              isBest ? "text-emerald-800" : "text-stone-800"
                            }`}
                          >
                            ±{m.mae}°C
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-stone-500 block">Variance (R²)</span>
                          <span className="text-base font-bold text-stone-800">
                            {Math.round(m.r2 * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </HoverTile>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DATA IMPORTANCE (ABLATION) */}
      {activeTab === "ablation" && (
        <div className="space-y-6">
          <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-stone-900 mb-1">
              Modality Ablation Analysis: Which Data Sources Matter Most?
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              We scientifically trained and tested configurations with individual data streams omitted. Hover over any tile to view why that specific stream produces its observed error delta.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ABLATION_STUDY.map((item) => (
              <HoverTile
                key={item.config}
                content={{
                  title: item.config,
                  badge: `MAE: ±${item.mae}°C`,
                  summary: item.notes,
                  details: `Impact vs full model: ${item.deltaVsFull}`,
                }}
                position="top"
                align="center"
                className="cursor-pointer"
              >
                <div className="bg-[#FAF8F5] hover:bg-emerald-50/40 border border-[#EAE5DC] hover:border-emerald-300 rounded-2xl p-4 space-y-2 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">
                      {item.config}
                    </span>
                    <span className="text-xs font-bold font-mono text-emerald-800">
                      ±{item.mae}°C
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-[#EAE5DC]">
                    <span>Performance Impact:</span>
                    <span
                      className={`font-semibold ${
                        item.deltaVsFull.includes("Baseline") ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      {item.deltaVsFull}
                    </span>
                  </div>
                </div>
              </HoverTile>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
