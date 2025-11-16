export interface DataPoint {
  id: number;
  timestamp: number;
  value: number;
  category: string;
  metadata?: Record<string, any>;
}

export interface ScatterPoint {
  x: number;
  y: number;
  color?: string;
  size?: number;
}

export interface HeatmapData {
  x: number;
  y: number;
  intensity: number;
}

let dataIdCounter = 0;

export function generateDataPoint(
  timestamp: number = Date.now(),
  baseValue: number = 50,
  variance: number = 20
): DataPoint {
  const value = baseValue + (Math.random() * 2 - 1) * variance;
  const categories = ['API', 'Database', 'Cache', 'Queue'];
  const category = categories[Math.floor(Math.random() * categories.length)];
  
  return {
    id: dataIdCounter++,
    timestamp,
    value: Math.max(0, value),
    category,
    metadata: {
      region: ['US', 'EU', 'ASIA'][Math.floor(Math.random() * 3)],
      status: Math.random() > 0.9 ? 'error' : 'success',
    },
  };
}

export function generateTimeSeriesData(
  count: number,
  startTime: number = Date.now() - 24 * 60 * 60 * 1000,
  interval: number = 1000
): DataPoint[] {
  const data: DataPoint[] = [];
  const baseValue = 50;
  let currentValue = baseValue;
  
  for (let i = 0; i < count; i++) {
    const timestamp = startTime + i * interval;
    // Random walk for realistic time series
    currentValue += (Math.random() * 2 - 1) * 5;
    currentValue = Math.max(10, Math.min(100, currentValue));
    
    data.push(generateDataPoint(timestamp, currentValue, 10));
  }
  
  return data;
}

export function generateScatterData(count: number): ScatterPoint[] {
  const data: ScatterPoint[] = [];
  const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];
  
  for (let i = 0; i < count; i++) {
    data.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 3 + Math.random() * 4,
    });
  }
  
  return data;
}

export function generateHeatmapData(
  width: number = 50,
  height: number = 30
): HeatmapData[] {
  const data: HeatmapData[] = [];
  
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      // Create interesting patterns
      const intensity = 
        (Math.sin(x / 5) * 0.3 + 0.5) +
        (Math.cos(y / 5) * 0.3 + 0.5) +
        Math.random() * 0.2;
      
      data.push({
        x,
        y,
        intensity: Math.max(0, Math.min(1, intensity)),
      });
    }
  }
  
  return data;
}

export function aggregateData(
  data: DataPoint[],
  interval: '1min' | '5min' | '1hour' | '1day' | 'raw'
): DataPoint[] {
  if (interval === 'raw') return data;
  
  const intervalMs: Record<string, number> = {
    '1min': 60 * 1000,
    '5min': 5 * 60 * 1000,
    '1hour': 60 * 60 * 1000,
    '1day': 24 * 60 * 60 * 1000,
  };
  
  const intervalSize = intervalMs[interval];
  const buckets = new Map<number, DataPoint[]>();
  
  // Group data into time buckets
  data.forEach(point => {
    const bucketTime = Math.floor(point.timestamp / intervalSize) * intervalSize;
    if (!buckets.has(bucketTime)) {
      buckets.set(bucketTime, []);
    }
    buckets.get(bucketTime)!.push(point);
  });
  
  // Aggregate each bucket
  const aggregated: DataPoint[] = [];
  buckets.forEach((points, bucketTime) => {
    const avgValue = points.reduce((sum, p) => sum + p.value, 0) / points.length;
    aggregated.push({
      id: bucketTime,
      timestamp: bucketTime,
      value: avgValue,
      category: points[0].category,
      metadata: {
        count: points.length,
      },
    });
  });
  
  return aggregated.sort((a, b) => a.timestamp - b.timestamp);
}

export function filterData(
  data: DataPoint[],
  filters: {
    categories?: string[];
    minValue?: number;
    maxValue?: number;
    limit?: number;
  }
): DataPoint[] {
  let filtered = [...data];
  
  if (filters.categories && filters.categories.length > 0 && !filters.categories.includes('All')) {
    filtered = filtered.filter(p => filters.categories!.includes(p.category));
  }
  
  if (filters.minValue !== undefined) {
    filtered = filtered.filter(p => p.value >= filters.minValue!);
  }
  
  if (filters.maxValue !== undefined) {
    filtered = filtered.filter(p => p.value <= filters.maxValue!);
  }
  
  if (filters.limit) {
    filtered = filtered.slice(-filters.limit);
  }
  
  return filtered;
}

