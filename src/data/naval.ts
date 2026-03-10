export interface NavalVessel {
  name: string;
  type: string;
  country: string;
  flag: string;
  status: "deployed" | "en-route" | "withdrawn";
  role: string;
  arrivedDate: string;
}

export interface NavalDeployment {
  title: string;
  subtitle: string;
  totalVessels: number;
  nations: number;
  vessels: NavalVessel[];
  summaryNote: string;
}

export const cyprusNavalData: NavalDeployment = {
  title: "European Naval Presence off Cyprus",
  subtitle: "Eastern Mediterranean · As of 9 Mar 2026",
  totalVessels: 14,
  nations: 6,
  summaryNote:
    "Unprecedented European naval buildup in the Eastern Mediterranean. Primary missions include ballistic missile defense, evacuation readiness for EU nationals in Lebanon and Israel, and securing shipping lanes through the Suez approaches. Several vessels equipped with PAAMS/Aster-30 air defense systems providing layered BMD coverage.",
  vessels: [
    { name: "FS Charles de Gaulle (R91)", type: "Aircraft Carrier", country: "France", flag: "🇫🇷", status: "deployed", role: "Air operations & power projection", arrivedDate: "28 Feb" },
    { name: "FS Alsace (D656)", type: "FREMM DA Frigate", country: "France", flag: "🇫🇷", status: "deployed", role: "Air defense / BMD screening", arrivedDate: "28 Feb" },
    { name: "FS Provence (D652)", type: "FREMM Frigate", country: "France", flag: "🇫🇷", status: "deployed", role: "Anti-submarine warfare", arrivedDate: "1 Mar" },
    { name: "ITS Cavour (C550)", type: "Aircraft Carrier", country: "Italy", flag: "🇮🇹", status: "deployed", role: "Air operations & helicopter ASW", arrivedDate: "1 Mar" },
    { name: "ITS Caio Duilio (D554)", type: "Horizon Frigate", country: "Italy", flag: "🇮🇹", status: "deployed", role: "Air defense / Aster-30 BMD", arrivedDate: "1 Mar" },
    { name: "ITS Alpino (F594)", type: "FREMM Frigate", country: "Italy", flag: "🇮🇹", status: "deployed", role: "Anti-submarine warfare", arrivedDate: "2 Mar" },
    { name: "FGS Sachsen (F219)", type: "Sachsen-class Frigate", country: "Germany", flag: "🇩🇪", status: "deployed", role: "Air defense / SM-2 capability", arrivedDate: "2 Mar" },
    { name: "FGS Hessen (F221)", type: "Sachsen-class Frigate", country: "Germany", flag: "🇩🇪", status: "deployed", role: "Air defense / radar picket", arrivedDate: "3 Mar" },
    { name: "HNLMS De Ruyter (F804)", type: "LCF Frigate", country: "Netherlands", flag: "🇳🇱", status: "deployed", role: "Air defense / SM-2 & ESSM", arrivedDate: "2 Mar" },
    { name: "HNLMS Tromp (F803)", type: "LCF Frigate", country: "Netherlands", flag: "🇳🇱", status: "deployed", role: "BMD-capable radar platform", arrivedDate: "4 Mar" },
    { name: "SPS Cristóbal Colón (F105)", type: "F100 Frigate", country: "Spain", flag: "🇪🇸", status: "deployed", role: "Air defense / Aegis combat system", arrivedDate: "3 Mar" },
    { name: "ESPS Juan Carlos I (L61)", type: "LHD / Light Carrier", country: "Spain", flag: "🇪🇸", status: "deployed", role: "Amphibious ops & evacuation standby", arrivedDate: "4 Mar" },
    { name: "HS Psara (F454)", type: "Hydra-class Frigate", country: "Greece", flag: "🇬🇷", status: "deployed", role: "Patrol & escort duties", arrivedDate: "28 Feb" },
    { name: "HS Salamis (F455)", type: "Hydra-class Frigate", country: "Greece", flag: "🇬🇷", status: "deployed", role: "Patrol & shipping lane security", arrivedDate: "28 Feb" },
  ],
};
