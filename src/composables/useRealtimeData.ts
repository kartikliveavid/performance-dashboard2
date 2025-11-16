import { ref, onMounted, onUnmounted } from 'vue';

export function useRealtimeData() {
  const dataPoints = ref<number[]>([]);
  const isRunning = ref<boolean>(false);
  const dataGeneratorWorker = new Worker(new URL('../workers/dataGenerator.worker.ts', import.meta.url));

  const startGeneratingData = () => {
    isRunning.value = true;
    dataGeneratorWorker.postMessage({ action: 'start' });
  };

  const stopGeneratingData = () => {
    isRunning.value = false;
    dataGeneratorWorker.postMessage({ action: 'stop' });
  };

  dataGeneratorWorker.onmessage = (event) => {
    if (event.data.action === 'update') {
      dataPoints.value = event.data.payload;
    }
  };

  onMounted(() => {
    startGeneratingData();
  });

  onUnmounted(() => {
    stopGeneratingData();
    dataGeneratorWorker.terminate();
  });

  return {
    dataPoints,
    isRunning,
    startGeneratingData,
    stopGeneratingData,
  };
}