export interface UrbanZone {
  id: string;
  name: string;
  type: "dense_core" | "suburban" | "industrial" | "parks" | "waterfront" | "peri_urban";
  gridCellsCount: number;
  mae24h: number;
  rmse24h: number;
  primaryErrorSource: string;
  avgNDVI: number;
  avgGVI: number;
  avgBuiltDensity: number;
  avgImpervious: number;
  baseLST: number;
  coords: { lat: number; lng: number };
}

export interface SensorNode {
  id: string;
  nodeCode: string;
  name: string;
  type: "DHT22" | "SHT31" | "Davis_Vantage_Reference";
  zoneId: string;
  lat: number;
  lng: number;
  elevation: number;
  temperature: number;
  humidity: number;
  batteryVolt: number;
  rssi: number;
  lastSeenMinutesAgo: number;
  driftEst: number;
  needsRecalibration: boolean;
  status: "online" | "warning" | "offline";
}

export interface MeteorologicalContext {
  source: string;
  location: {
    city: string;
    lat: number;
    lng: number;
    elevation: number;
    timezone: string;
  };
  currentConditions: {
    temperature2m: number;
    relativeHumidity: number;
    windSpeedMs: number;
    windDirectionDeg: number;
    windU: number;
    windV: number;
    solarRadiationWm2: number;
    timestamp: string;
  };
  hourlySeries: Array<{
    time: string;
    temperature2m: number;
    relativeHumidity: number;
    windSpeedMs: number;
    windU: number;
    windV: number;
    solarRadiationWm2: number;
  }>;
  pipelineNotes: {
    resolutionNative: string;
    downscalingTarget: string;
    updateCycle: string;
  };
}

export interface HorizonMetric {
  horizon: string;
  mae: number;
  rmse: number;
  r2: number;
  skillScore: string;
}

export interface BaselineModel {
  model: string;
  mae: number;
  rmse: number;
  r2: number;
  improvementOverPrev: string;
}

export interface AblationEntry {
  config: string;
  mae: number;
  deltaVsFull: string;
  notes: string;
}

export interface GridCellFeature {
  id: string;
  zoneId: string;
  zoneName: string;
  col: number;
  row: number;
  lat: number;
  lng: number;
  satelliteLST: number;
  iotAirTemp: number;
  forecast1h: number;
  forecast6h: number;
  forecast24h: number;
  forecast48h: number;
  observed24h: number;
  uhiIntensity: number; // Forecast - rural baseline
  ndvi: number;
  gvi: number;
  svfProxy: number;
  builtDensity: number;
  imperviousFraction: number;
  vulnerabilityScore: number; // 0 to 1
}
