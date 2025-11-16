import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { generateDataPoint, generateTimeSeriesData, filterData, aggregateData, type DataPoint } from '../utils/dataGenerator';

export function useDataStream(initialCount: number = 10000) {
  const data = ref<DataPoint[]>([]);
  const isStreaming = ref(false);
  const dataPointLimit = ref(initialCount);
  const updateInterval = ref(100); // 100ms updates
  
  let intervalId: number | null = null;
  let rafId: number | null = null;
  
  const generateInitialData = () => {
    const now = Date.now();
    const startTime = now - 24 * 60 * 60 * 1000; // Last 24 hours
    data.value = generateTimeSeriesData(
      dataPointLimit.value,
      startTime,
      (24 * 60 * 60 * 1000) / dataPointLimit.value
    );
  };
  
  const streamData = () => {
    if (!isStreaming.value) return;
    
    // Add new data point
    const newPoint = generateDataPoint();
    data.value.push(newPoint);
    
    // Keep only the last N points to prevent memory issues
    if (data.value.length > dataPointLimit.value * 1.5) {
      data.value = data.value.slice(-dataPointLimit.value);
    }
    
    rafId = requestAnimationFrame(() => {
      if (intervalId) {
        clearTimeout(intervalId);
      }
      intervalId = window.setTimeout(streamData, updateInterval.value);
    });
  };
  
  const startStream = () => {
    if (isStreaming.value) return;
    isStreaming.value = true;
    streamData();
  };
  
  const stopStream = () => {
    isStreaming.value = false;
    if (intervalId) {
      clearTimeout(intervalId);
    }
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  };
  
  const setDataPointLimit = (limit: number) => {
    dataPointLimit.value = limit;
    if (data.value.length > limit) {
      data.value = data.value.slice(-limit);
    }
  };
  
  const setUpdateInterval = (interval: number) => {
    updateInterval.value = interval;
  };
  
  // Computed properties for filtered/aggregated data
  const filteredData = computed(() => {
    return (filters: {
      categories?: string[];
      minValue?: number;
      maxValue?: number;
    }) => {
      return filterData(data.value, { ...filters, limit: dataPointLimit.value });
    };
  });
  
  const aggregatedData = computed(() => {
    return (interval: '1min' | '5min' | '1hour' | '1day' | 'raw') => {
      return aggregateData(data.value, interval);
    };
  });
  
  onMounted(() => {
    generateInitialData();
    startStream();
  });
  
  onBeforeUnmount(() => {
    stopStream();
  });
  
  return {
    data,
    isStreaming,
    dataPointLimit,
    updateInterval,
    startStream,
    stopStream,
    setDataPointLimit,
    setUpdateInterval,
    filteredData,
    aggregatedData,
  };
}









