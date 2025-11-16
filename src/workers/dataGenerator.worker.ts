// Web Worker for data generation
let intervalId: number | null = null;

self.onmessage = function(e: MessageEvent) {
  const { action } = e.data;
  
  if (action === 'start') {
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    intervalId = setInterval(() => {
      const data = generateData(100);
      self.postMessage({
        action: 'update',
        payload: data,
      });
    }, 100) as unknown as number;
  } else if (action === 'stop') {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
};

function generateData(count: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    out.push(50 + Math.random() * 50);
  }
  return out;
}
