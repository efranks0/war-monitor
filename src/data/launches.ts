export interface DayEntry {
  date: string;
  missiles: string;
  drones: string;
  notes: string;
  intensity: number; // 0-100
}

export interface CountryData {
  country: string;
  flag: string;
  color: string;
  subtitle: string;
  peakMissiles: string;
  peakDrones: string;
  durationTracked: string;
  summaryNote: string;
  entries: DayEntry[];
}

export interface LaunchesResponse {
  iran: CountryData;
  israel: CountryData;
  usa: CountryData;
  lastUpdated: string;
}
