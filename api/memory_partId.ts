// POST /api/memory_partId.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { logPartMemory } from '../cadMemoryEngine';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { partId } = req.query;
  const {
    process,
    material,
    ribRatio,
    minWall,
    toleranceUsed,
    overrides,
    score,
    tags
  } = req.body;

  if (!partId || !process || !material) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  logPartMemory({
    partId: partId.toString(),
    process,
    material,
    ribRatio,
    minWall,
    toleranceUsed,
    overrides,
    score,
    tags,
    timestamp: new Date().toISOString()
  });

  return res.status(200).json({ status: "Memory updated" });
}
