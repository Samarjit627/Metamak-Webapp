// vendorFinderEngine.ts
export type VendorQuery = {
  process: string;
  region?: string;
  partComplexity?: string;
  quantity?: number;
};

export type VendorResult = {
  name: string;
  region: string;
  processes: string[];
  minQty: number;
  notes?: string;
  url?: string;
};

// Dummy vendor DB for illustration
const vendorDB: VendorResult[] = [
  {
    name: "ProtoMFG",
    region: "US",
    processes: ["CNC Machining", "3D Printing"],
    minQty: 1,
    notes: "Rapid prototyping and low-volume production",
    url: "https://protomfg.com"
  },
  {
    name: "AsiaPlasticParts",
    region: "Asia",
    processes: ["Injection Molding", "Blow Molding"],
    minQty: 500,
    notes: "Tier 2/3 molder, good for consumer plastics",
    url: "https://asiaplasticparts.example"
  },
  {
    name: "EuroMetalFab",
    region: "Europe",
    processes: ["Sheet Metal", "Die Casting"],
    minQty: 50,
    notes: "Sheet metal and casting specialist",
    url: "https://eurometalfab.eu"
  }
];

export function findVendors(query: VendorQuery): VendorResult[] {
  return vendorDB.filter(v =>
    (!query.region || v.region === query.region) &&
    (!query.process || v.processes.includes(query.process)) &&
    (!query.quantity || v.minQty <= query.quantity)
  );
}
