export interface Corridor {
  id: string;
  name: string;
  from: { lat: number; lon: number };
  to: { lat: number; lon: number };
  junctions: Array<{ name: string; lat: number; lon: number }>;
}

export const CORRIDORS: Corridor[] = [
  {
    id: "weh",
    name: "Western Express Highway",
    from: { lat: 19.01, lon: 72.83 },
    to: { lat: 19.21, lon: 72.855 },
    junctions: [
      { name: "Bandra", lat: 19.0544, lon: 72.8402 },
      { name: "Andheri", lat: 19.1197, lon: 72.8464 },
      { name: "Goregaon", lat: 19.166, lon: 72.852 },
    ],
  },
  {
    id: "sv",
    name: "S.V. Road",
    from: { lat: 19.01, lon: 72.823 },
    to: { lat: 19.205, lon: 72.843 },
    junctions: [
      { name: "Santacruz", lat: 19.081, lon: 72.841 },
      { name: "Vile Parle", lat: 19.096, lon: 72.844 },
    ],
  },
  {
    id: "lbs",
    name: "LBS Marg",
    from: { lat: 19.02, lon: 72.852 },
    to: { lat: 19.175, lon: 72.878 },
    junctions: [
      { name: "Kurla", lat: 19.08, lon: 72.88 },
      { name: "Ghatkopar", lat: 19.09, lon: 72.9 },
    ],
  },
  {
    id: "eeh",
    name: "Eastern Express Highway",
    from: { lat: 19.02, lon: 72.872 },
    to: { lat: 19.18, lon: 72.908 },
    junctions: [
      { name: "Thane West", lat: 19.19, lon: 72.97 },
      { name: "Mulund", lat: 19.17, lon: 72.93 },
    ],
  },
];
