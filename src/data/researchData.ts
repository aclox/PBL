import { UrbanZone, HorizonMetric, BaselineModel, AblationEntry } from "../types";

export const PILOT_ZONES: UrbanZone[] = [
  {
    id: "zone-core",
    name: "Johari Bazaar (Dense Urban Core)",
    type: "dense_core",
    gridCellsCount: 6200,
    mae24h: 0.96,
    rmse24h: 1.28,
    primaryErrorSource: "Consistent thermal mass; sparse tree canopy (<5%)",
    avgNDVI: 0.08,
    avgGVI: 0.07,
    avgBuiltDensity: 0.88,
    avgImpervious: 0.89,
    baseLST: 46.8,
    coords: { lat: 26.9239, lng: 75.8267 },
  },
  {
    id: "zone-suburban",
    name: "Mansarovar & Vaishali (Suburban)",
    type: "suburban",
    gridCellsCount: 14800,
    mae24h: 1.14,
    rmse24h: 1.51,
    primaryErrorSource: "Intra-zone heterogeneity; mixed residential tree cover",
    avgNDVI: 0.28,
    avgGVI: 0.22,
    avgBuiltDensity: 0.58,
    avgImpervious: 0.64,
    baseLST: 41.5,
    coords: { lat: 26.8665, lng: 75.7645 },
  },
  {
    id: "zone-industrial",
    name: "Sitapura & VKI (Industrial)",
    type: "industrial",
    gridCellsCount: 4400,
    mae24h: 1.25,
    rmse24h: 1.65,
    primaryErrorSource: "Variable waste-heat emissions; metal rooftop thermal spikes",
    avgNDVI: 0.05,
    avgGVI: 0.04,
    avgBuiltDensity: 0.79,
    avgImpervious: 0.92,
    baseLST: 48.9,
    coords: { lat: 26.7824, lng: 75.8281 },
  },
  {
    id: "zone-parks",
    name: "Central Park & Smriti Van (Green)",
    type: "parks",
    gridCellsCount: 8200,
    mae24h: 1.29,
    rmse24h: 1.72,
    primaryErrorSource: "Canopy microclimate variability; evapotranspiration shifts",
    avgNDVI: 0.62,
    avgGVI: 0.58,
    avgBuiltDensity: 0.12,
    avgImpervious: 0.15,
    baseLST: 35.2,
    coords: { lat: 26.9015, lng: 75.8078 },
  },
  {
    id: "zone-waterfront",
    name: "Jal Mahal Lake (Waterfront)",
    type: "waterfront",
    gridCellsCount: 3200,
    mae24h: 1.38,
    rmse24h: 1.84,
    primaryErrorSource: "Lake microclimate boundary layer interactions",
    avgNDVI: 0.38,
    avgGVI: 0.31,
    avgBuiltDensity: 0.30,
    avgImpervious: 0.24,
    baseLST: 36.4,
    coords: { lat: 26.9534, lng: 75.8462 },
  },
  {
    id: "zone-periurban",
    name: "Amer Transitional Fringe (Peri-urban)",
    type: "peri_urban",
    gridCellsCount: 3200,
    mae24h: 1.32,
    rmse24h: 1.76,
    primaryErrorSource: "Sparse sensor coverage (500–800m spacing); dry soil albedo",
    avgNDVI: 0.19,
    avgGVI: 0.14,
    avgBuiltDensity: 0.35,
    avgImpervious: 0.38,
    baseLST: 43.1,
    coords: { lat: 26.9855, lng: 75.8507 },
  },
];

export const HORIZON_METRICS: HorizonMetric[] = [
  { horizon: "1-hour ahead (Nowcast)", mae: 0.58, rmse: 0.81, r2: 0.97, skillScore: "78.4%" },
  { horizon: "6-hour ahead (Afternoon)", mae: 0.89, rmse: 1.18, r2: 0.93, skillScore: "68.9%" },
  { horizon: "24-hour ahead (Peak Heat)", mae: 1.18, rmse: 1.54, r2: 0.91, skillScore: "58.6%" },
  { horizon: "48-hour ahead (Outlook)", mae: 1.62, rmse: 2.14, r2: 0.84, skillScore: "44.5%" },
];

export const BASELINE_MODELS: BaselineModel[] = [
  { model: "Climatology (historical mean)", mae: 2.92, rmse: 3.65, r2: 0.31, improvementOverPrev: "—" },
  { model: "Persistence (last observed)", mae: 2.41, rmse: 3.04, r2: 0.52, improvementOverPrev: "-17.5% MAE" },
  { model: "Raw ERA5 Downscaling (Uncorrected)", mae: 2.14, rmse: 2.78, r2: 0.59, improvementOverPrev: "-11.2% MAE" },
  { model: "IDW Spatial Interpolation Alone", mae: 2.02, rmse: 2.62, r2: 0.62, improvementOverPrev: "-5.6% MAE" },
  { model: "SARIMAX + meteo covariates", mae: 1.78, rmse: 2.34, r2: 0.72, improvementOverPrev: "-11.9% MAE" },
  { model: "Standard CNN+LSTM (statistical)", mae: 1.38, rmse: 1.90, r2: 0.86, improvementOverPrev: "-22.5% MAE" },
  { model: "SEB Physics + CNN-LSTM + IoT Kriging (Our Engine)", mae: 1.18, rmse: 1.54, r2: 0.91, improvementOverPrev: "-14.5% MAE (-33.7% vs SARIMAX)" },
];

export const ABLATION_STUDY: AblationEntry[] = [
  { config: "Full Model (SEB Physics + Satellite LST + IoT Kriging + Street GVI/SVF)", mae: 1.18, deltaVsFull: "Baseline (Engine)", notes: "Optimal biophysical coupling of SEB physics, satellite thermal skin, 150-node ground kriging, and street canopy features" },
  { config: "w/o Physical SEB & Elevation Lapse (Pure statistical ML)", mae: 1.38, deltaVsFull: "+16.9%", notes: "Lack of aerodynamic resistance and adiabatic lapse induces errors across variable terrain" },
  { config: "w/o Street-level imagery & GVI shade (-64-D PCA)", mae: 1.39, deltaVsFull: "+17.8%", notes: "Loss of street canyon geometry (SVF) and pedestrian tree shade microclimate" },
  { config: "w/o Satellite Thermal LST (IoT + ERA5 only)", mae: 1.52, deltaVsFull: "+28.8%", notes: "Misses rooftop thermal mass and industrial hotspot radiation" },
  { config: "w/o IoT sensors (satellite + ERA5 only)", mae: 1.64, deltaVsFull: "+39.0%", notes: "Ground sensors provide the essential real-time empirical calibration anchoring" },
  { config: "Raw ERA5 Macro Weather (No hyperlocal downscaling)", mae: 2.14, deltaVsFull: "+81.4%", notes: "Standard 25km grid completely misses urban heat islands and canyon trapping" },
];

export const FEATURE_VECTOR_GROUPS = [
  { name: "Satellite LST (Landsat 8/9 + MODIS)", dims: 2, description: "Fused surface temperature from Landsat (high res) and MODIS (daily)" },
  { name: "IoT Air Temperature (Interpolated)", dims: 1, description: "IDW-interpolated screen-level temperature from nearest sensors" },
  { name: "Street Imagery Embedding (PCA)", dims: 64, description: "ResNet-50 global pooling features compressed to 64-D via PCA (32x compression)" },
  { name: "Semantic Indices (GVI, SVF, Density)", dims: 3, description: "DeepLab v3 green view, sky view, and built density fractions" },
  { name: "ERA5 Meteorological Context", dims: 4, description: "2m temperature, wind speed (u, v components), downwelling solar radiation" },
  { name: "Cyclic Temporal Encodings", dims: 4, description: "sin/cos hour-of-day, sin/cos day-of-year" },
  { name: "Static Covariates", dims: 4, description: "Impervious fraction, land-use 1-hot (x2), NDVI static summer mean" },
];

export const COST_BREAKDOWN_PILOT = [
  { item: "Sensors: 150 low-cost DHT22/SHT31 nodes", oneTime: 2500, annual: 0, notes: "$15–20 per node incl. weather-proof enclosure, pole mounts" },
  { item: "Reference Stations: 3 × Davis Vantage Pro2", oneTime: 2100, annual: 0, notes: "Met-grade calibration & QC reference nodes" },
  { item: "Gateways / LoRaWAN connectivity (5-8 units)", oneTime: 1500, annual: 0, notes: "Full 400 km² urban mesh coverage" },
  { item: "Cloud Storage (1 TB AWS S3 / GCS)", oneTime: 0, annual: 300, notes: "Raw rasters, processed features, model outputs" },
  { item: "GPU Training Compute (Spot instances)", oneTime: 0, annual: 1500, notes: "~50 hours/year of V100 spot time for monthly retraining" },
  { item: "API Serving & Monitoring (t3.medium VMs)", oneTime: 0, annual: 600, notes: "FastAPI inference service & TimescaleDB backend" },
  { item: "Personnel: Data Engineer (0.2 FTE)", oneTime: 0, annual: 8000, notes: "Pipeline maintenance, QC, calibration routines" },
  { item: "Personnel: ML Engineer (0.2 FTE)", oneTime: 0, annual: 4000, notes: "Model updates, drift monitoring, retuning" },
];

// Diurnal 48-Hour Curve Data (Figure 5 from paper)
export const DIURNAL_48H_DATA = [
  { hour: "00:00", rural: 25.2, urbanObserved: 28.5, urbanForecast: 28.7, uhiIntensity: 3.3 },
  { hour: "03:00", rural: 24.1, urbanObserved: 27.6, urbanForecast: 27.4, uhiIntensity: 3.5 },
  { hour: "06:00", rural: 23.5, urbanObserved: 26.2, urbanForecast: 26.0, uhiIntensity: 2.7 },
  { hour: "09:00", rural: 27.8, urbanObserved: 29.5, urbanForecast: 29.3, uhiIntensity: 1.7 },
  { hour: "12:00", rural: 33.2, urbanObserved: 34.8, urbanForecast: 34.9, uhiIntensity: 1.6 },
  { hour: "15:00", rural: 36.4, urbanObserved: 38.6, urbanForecast: 38.4, uhiIntensity: 2.2 },
  { hour: "18:00", rural: 34.1, urbanObserved: 37.5, urbanForecast: 37.8, uhiIntensity: 3.4 },
  { hour: "21:00", rural: 29.5, urbanObserved: 33.6, urbanForecast: 33.8, uhiIntensity: 4.1 },
  { hour: "00:00 (D2)", rural: 25.8, urbanObserved: 29.4, urbanForecast: 29.2, uhiIntensity: 3.6 },
  { hour: "03:00 (D2)", rural: 24.5, urbanObserved: 28.1, urbanForecast: 28.0, uhiIntensity: 3.6 },
  { hour: "06:00 (D2)", rural: 23.9, urbanObserved: 26.8, urbanForecast: 26.9, uhiIntensity: 2.9 },
  { hour: "09:00 (D2)", rural: 28.2, urbanObserved: 30.1, urbanForecast: 30.0, uhiIntensity: 1.9 },
  { hour: "12:00 (D2)", rural: 33.9, urbanObserved: 35.6, urbanForecast: 35.4, uhiIntensity: 1.7 },
  { hour: "15:00 (D2)", rural: 37.1, urbanObserved: 39.5, urbanForecast: 39.2, uhiIntensity: 2.4 },
  { hour: "18:00 (D2)", rural: 34.8, urbanObserved: 38.4, urbanForecast: 38.6, uhiIntensity: 3.6 },
  { hour: "21:00 (D2)", rural: 30.1, urbanObserved: 34.5, urbanForecast: 34.7, uhiIntensity: 4.4 },
];

// Training Dynamics (Figure 7: 60 epochs, early stopping epoch 52)
export const TRAINING_LOSS_HISTORY = Array.from({ length: 60 }).map((_, i) => {
  const epoch = i + 1;
  const trainLoss = Number((0.26 + 4.2 * Math.exp(-epoch / 11) + 0.04 * Math.sin(epoch)).toFixed(3));
  const valLoss = Number((0.34 + 4.4 * Math.exp(-epoch / 11.5) + 0.05 * Math.cos(epoch / 2) + (epoch > 52 ? 0.015 * (epoch - 52) : 0)).toFixed(3));
  return { epoch, trainLoss, valLoss };
});

// Representative 100m grid cells sample for map interactive renderer (16x16 grid = 256 interactive cells)
export function generateInteractiveGridCells(urbanZones: UrbanZone[]) {
  const cells = [];
  const rows = 16;
  const cols = 16;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Determine zone by position
      let zoneIndex = 1; // default suburban
      const distFromCenter = Math.hypot(r - 7.5, c - 7.5);
      if (distFromCenter < 3.2) {
        zoneIndex = 0; // dense core
      } else if (r >= 11 && c >= 10) {
        zoneIndex = 2; // industrial
      } else if (r <= 4 && c >= 10) {
        zoneIndex = 4; // waterfront / lake
      } else if (r >= 6 && r <= 9 && c >= 2 && c <= 5) {
        zoneIndex = 3; // central park / greens
      } else if (r >= 13 || c <= 2) {
        zoneIndex = 5; // peri-urban fringe
      }

      const zone = urbanZones[zoneIndex];
      const noise = Math.sin(r * 3.4 + c * 2.1) * 0.8;
      const baseLST = zone.baseLST + noise;
      const ndvi = Math.max(0.02, Math.min(0.85, zone.avgNDVI - noise * 0.08));
      const gvi = Math.max(0.01, Math.min(0.70, zone.avgGVI - noise * 0.06));
      const builtDensity = Math.max(0.1, Math.min(0.95, zone.avgBuiltDensity + noise * 0.05));
      const impervious = Math.max(0.08, Math.min(0.98, zone.avgImpervious + noise * 0.04));

      // Rural baseline is ~33.5°C during daytime
      const ruralBase = 33.5;
      const f1 = baseLST - 3.8 + noise * 0.2;
      const f6 = baseLST - 3.2 + noise * 0.3;
      const f24 = baseLST - 2.9 + noise * 0.4;
      const f48 = baseLST - 2.5 + noise * 0.5;
      const observed = f24 + (noise > 0 ? zone.mae24h * 0.8 : -zone.mae24h * 0.8);

      cells.push({
        id: `cell-${r}-${c}`,
        zoneId: zone.id,
        zoneName: zone.name,
        row: r,
        col: c,
        lat: Number((zone.coords.lat + (r - 7.5) * 0.007).toFixed(5)),
        lng: Number((zone.coords.lng + (c - 7.5) * 0.007).toFixed(5)),
        satelliteLST: Number(baseLST.toFixed(1)),
        iotAirTemp: Number((baseLST - 4.2).toFixed(1)),
        forecast1h: Number(f1.toFixed(1)),
        forecast6h: Number(f6.toFixed(1)),
        forecast24h: Number(f24.toFixed(1)),
        forecast48h: Number(f48.toFixed(1)),
        observed24h: Number(observed.toFixed(1)),
        uhiIntensity: Number((f24 - ruralBase).toFixed(1)),
        ndvi: Number(ndvi.toFixed(2)),
        gvi: Number(gvi.toFixed(2)),
        svfProxy: Number((zone.avgBuiltDensity > 0.6 ? 0.24 : 0.48).toFixed(2)),
        builtDensity: Number(builtDensity.toFixed(2)),
        imperviousFraction: Number(impervious.toFixed(2)),
        vulnerabilityScore: Number((impervious * 0.6 + (1 - gvi) * 0.4).toFixed(2)),
      });
    }
  }
  return cells;
}
