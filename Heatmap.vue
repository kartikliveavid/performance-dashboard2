<template>
  <div class="heatmap-container">
    <canvas ref="canvasRef" :width="width" :height="height"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

interface HeatmapData {
  x: number;
  y: number;
  intensity: number;
}

const props = defineProps<{
  data: HeatmapData[];
  width?: number;
  height?: number;
  cellSize?: number;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const width = ref(props.width || 800);
const height = ref(props.height || 400);
let animationFrameId: number | null = null;

const getHeatmapColor = (intensity: number): string => {
  const clampedIntensity = Math.max(0, Math.min(1, intensity));
  if (clampedIntensity < 0.2) return '#3b82f6';
  if (clampedIntensity < 0.4) return '#10b981';
  if (clampedIntensity < 0.6) return '#f59e0b';
  if (clampedIntensity < 0.8) return '#f97316';
  return '#ef4444';
};

const render = () => {
  if (!canvasRef.value) return;
  
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width.value, height.value);

  if (props.data.length === 0) return;

  const padding = 40;
  const cellSize = props.cellSize || 20;

  // Draw heatmap cells
  props.data.forEach((point) => {
    const x = padding + point.x * cellSize;
    const y = padding + point.y * cellSize;

    ctx.fillStyle = getHeatmapColor(point.intensity);
    ctx.fillRect(x, y, cellSize, cellSize);
  });

  animationFrameId = requestAnimationFrame(render);
};

onMounted(() => {
  render();
});

onBeforeUnmount(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});

watch(() => props.data, () => {}, { deep: true });
</script>

<style scoped>
.heatmap-container {
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
  padding: 10px;
}
</style>