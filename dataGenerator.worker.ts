// filepath: src/workers/dataGenerator.worker.ts
export const generateData = (count: number) => {
  const out: { timestamp: number; value: number }[] = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) out.push({ timestamp: now + i, value: Math.random() });
  return out;
};
