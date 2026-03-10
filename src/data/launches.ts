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
  color: string; // accent color
  subtitle: string;
  peakMissiles: string;
  peakDrones: string;
  durationTracked: string;
  summaryNote: string;
  entries: DayEntry[];
}

export const iranData: CountryData = {
  country: "Iran",
  flag: "🇮🇷",
  color: "#ef4444", // red
  subtitle: "Since 29 Feb 2026 · Based on reported early-day waves",
  peakMissiles: "~130–170/day",
  peakDrones: "~500–700/day",
  durationTracked: "9 days",
  summaryNote:
    "Rapid degradation observed. Ballistic missile launches fell ~97% from peak within 8 days as launchers were systematically destroyed. Drone reliance increased proportionally as a lower-cost alternative.",
  entries: [
    { date: "29 Feb", missiles: "~120–150", drones: "~500–600", notes: "Opening retaliation waves across Gulf bases", intensity: 100 },
    { date: "1 Mar", missiles: "~130–170", drones: "~500–700", notes: "Largest early salvo; heavy launches toward UAE & regional bases", intensity: 100 },
    { date: "2 Mar", missiles: "~120–150", drones: "~400–500", notes: "Continued large attacks", intensity: 85 },
    { date: "3 Mar", missiles: "~80–120", drones: "~250–350", notes: "Launch rate begins falling", intensity: 65 },
    { date: "4 Mar", missiles: "~40–60", drones: "~150–250", notes: "Launchers increasingly destroyed", intensity: 45 },
    { date: "5 Mar", missiles: "~20–40", drones: "~120–200", notes: "Iran relies more on drones", intensity: 32 },
    { date: "6 Mar", missiles: "~10–20", drones: "~80–150", notes: "Missile use drops sharply", intensity: 22 },
    { date: "7 Mar", missiles: "~5–15", drones: "~50–120", notes: "Mostly drone harassment strikes", intensity: 14 },
    { date: "8–9 Mar", missiles: "~0–10/day", drones: "~30–80/day", notes: "Occasional launches as capacity declines", intensity: 7 },
  ],
};

export const israelData: CountryData = {
  country: "Israel",
  flag: "🇮🇱",
  color: "#3b82f6", // blue
  subtitle: "Since 29 Feb 2026 · IDF operational tempo against Iranian assets",
  peakMissiles: "~200–300/day",
  peakDrones: "~100–150/day",
  durationTracked: "9 days",
  summaryNote:
    "Sustained high-tempo strikes focused on Iranian nuclear sites, missile launchers, and air defense networks. Precision-guided munitions and standoff weapons prioritized. Operational intensity remained high throughout the campaign.",
  entries: [
    { date: "29 Feb", missiles: "~150–200", drones: "~60–80", notes: "Initial strikes on nuclear & air defense sites", intensity: 80 },
    { date: "1 Mar", missiles: "~200–300", drones: "~100–150", notes: "Peak strikes; Natanz, Isfahan, launcher sites targeted", intensity: 100 },
    { date: "2 Mar", missiles: "~200–280", drones: "~100–140", notes: "Continued strikes on hardened targets & C2 nodes", intensity: 95 },
    { date: "3 Mar", missiles: "~180–250", drones: "~80–120", notes: "Shift to mobile launcher hunting & BDA sorties", intensity: 85 },
    { date: "4 Mar", missiles: "~160–220", drones: "~80–110", notes: "SEAD missions; degrading remaining IADS", intensity: 78 },
    { date: "5 Mar", missiles: "~150–200", drones: "~70–100", notes: "Targeting dispersed TELs & underground facilities", intensity: 72 },
    { date: "6 Mar", missiles: "~140–180", drones: "~60–90", notes: "Mop-up strikes on residual launchers", intensity: 65 },
    { date: "7 Mar", missiles: "~120–160", drones: "~50–80", notes: "Reduced tempo; most priority targets struck", intensity: 55 },
    { date: "8–9 Mar", missiles: "~80–120/day", drones: "~40–60/day", notes: "Transition to sustain phase & ISR dominance", intensity: 45 },
  ],
};

export const usaData: CountryData = {
  country: "United States",
  flag: "🇺🇸",
  color: "#f59e0b", // amber
  subtitle: "Since 29 Feb 2026 · CENTCOM operations in support of coalition strikes",
  peakMissiles: "~300–500/day",
  peakDrones: "~50–80/day",
  durationTracked: "9 days",
  summaryNote:
    "Massive opening salvos with Tomahawk cruise missiles and B-2 strikes against Iranian nuclear infrastructure, IADS, and ballistic missile production facilities. Transitioned to sustained precision strikes and ISR overwatch. Carrier-based aviation provided continuous air superiority.",
  entries: [
    { date: "29 Feb", missiles: "~300–500", drones: "~30–50", notes: "Opening Tomahawk salvos & B-2 strikes on nuclear sites", intensity: 100 },
    { date: "1 Mar", missiles: "~250–400", drones: "~50–80", notes: "Carrier strikes; IADS suppression across western Iran", intensity: 95 },
    { date: "2 Mar", missiles: "~200–350", drones: "~40–70", notes: "Continued strikes on missile production & storage", intensity: 88 },
    { date: "3 Mar", missiles: "~180–280", drones: "~40–60", notes: "Focus shifts to mobile launcher sites & C2", intensity: 78 },
    { date: "4 Mar", missiles: "~150–250", drones: "~30–50", notes: "B-2 re-strikes on hardened bunkers; BDA ongoing", intensity: 70 },
    { date: "5 Mar", missiles: "~120–200", drones: "~30–50", notes: "Precision strikes on remaining air defense nodes", intensity: 60 },
    { date: "6 Mar", missiles: "~100–150", drones: "~20–40", notes: "Reduced tempo; shifting to ISR & overwatch", intensity: 48 },
    { date: "7 Mar", missiles: "~60–100", drones: "~20–30", notes: "Sustain phase; sporadic strikes on emerging targets", intensity: 35 },
    { date: "8–9 Mar", missiles: "~30–60/day", drones: "~10–20/day", notes: "Low-rate fires; air superiority maintained", intensity: 22 },
  ],
};

export const allCountries: CountryData[] = [iranData, israelData, usaData];
