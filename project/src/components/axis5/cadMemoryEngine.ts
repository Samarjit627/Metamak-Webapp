// cadMemoryEngine.ts

export type CADMemoryEntry = {
  partId: string;
  process: string;
  material: string;
  ribRatio?: number;             // avg rib thickness / wall thickness
  minWall?: number;
  toleranceUsed?: number[];
  overrides?: string[];          // e.g., ["accepted undercut", "tight tolerance accepted"]
  score?: number;
  tags?: string[];               // e.g., ["battery lid", "frame", "prototype"]
  timestamp: string;
};

let cadMemoryStore: CADMemoryEntry[] = [];

export function logPartMemory(entry: CADMemoryEntry) {
  // overwrite if part already exists
  cadMemoryStore = cadMemoryStore.filter(e => e.partId !== entry.partId);
  cadMemoryStore.push(entry);
}

export function getPastParts(process?: string, material?: string): CADMemoryEntry[] {
  return cadMemoryStore.filter(p => {
    return (!process || p.process === process) &&
           (!material || p.material === material);
  });
}

export function summarizePatterns(process?: string, material?: string) {
  const entries = getPastParts(process, material);
  if (!entries.length) return null;

  const ribs = entries.map(e => e.ribRatio).filter(n => typeof n === 'number') as number[];
  const walls = entries.map(e => e.minWall).filter(n => typeof n === 'number') as number[];
  const tolerances = entries.flatMap(e => e.toleranceUsed || []);

  return {
    avgRibRatio: ribs.length ? (ribs.reduce((a, b) => a + b, 0) / ribs.length) : undefined,
    minWallRange: walls.length ? { min: Math.min(...walls), max: Math.max(...walls) } : undefined,
    commonTolerances: [...new Set(tolerances.map(t => t.toFixed(2)))].slice(0, 5),
    partCount: entries.length
  };
}
