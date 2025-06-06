// api/memory_[partId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { initMemory, updateMemory, getMemory } from './memoryStore';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { partId } = req.query;
  if (typeof partId !== 'string') {
    return res.status(400).json({ error: 'Invalid partId' });
  }

  if (req.method === 'POST') {
    const memory = initMemory(partId);
    return res.status(200).json(memory);
  }

  if (req.method === 'PATCH') {
    const update = req.body;
    const updated = updateMemory(partId, update);
    if (!updated) return res.status(404).json({ error: 'Part not found' });
    return res.status(200).json(updated);
  }

  if (req.method === 'GET') {
    const memory = getMemory(partId);
    if (!memory) return res.status(404).json({ error: 'Part not found' });
    return res.status(200).json(memory);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
