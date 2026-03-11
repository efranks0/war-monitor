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
  lastUpdated?: string;
}
