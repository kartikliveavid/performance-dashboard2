<template>
  <div class="heatmap-container">
    <canvas ref="canvasRef" :width="width" :height="height"></canvas>
    <div class="heatmap-legend">
      <span class="legend-label">Low</span>
      <div class="legend-gradient"></div>
      <span class="legend-label">High</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';

interface HeatmapData {
  x: number;
  y: number;
  intensity: number;
}

const props = withDefaults(defineProps<{
  data: HeatmapData[];
  width?: number;
  height?: number;
  cellSize?: number;
}>(), {
  width: 800,
  height: 400,
  cellSize: 20
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
const width = ref(props.width);
const height = ref(props.height);
let animationFrameId: number | null = null;

const maxIntensity = computed(() => {
  if (props.data.length === 0) return 1;
  return Math.max(...props.data.map(d => d.intensity), 1);
});

const getHeatmapColor = (intensity: number): string => {
  const normalized = intensity / maxIntensity.value;
  const clamped = Math.max(0, Math.min(1, normalized));
  
  // Blue to Red gradient
  if (clamped < 0.25) {
    const t = clamped / 0.25;
    const r = Math.floor(59 + (16 - 59) * t);
    const g = Math.floor(130 + (185 - 130) * t);
    const b = Math.floor(246 + (129 - 246) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (clamped < 0.5) {
    const t = (clamped - 0.25) / 0.25;
    const r = Math.floor(16 + (245 - 16) * t);
    const g = Math.floor(185 + (158 - 185) * t);
    const b = Math.floor(129 + (66 - 129) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (clamped < 0.75) {
    const t = (clamped - 0.5) / 0.25;
    const r = Math.floor(245 + (249 - 245) * t);
    const g = Math.floor(158 + (115 - 158) * t);
    const b = Math.floor(66 + (22 - 66) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const t = (clamped - 0.75) / 0.25;
    const r = Math.floor(249 + (239 - 249) * t);
    const g = Math.floor(115 + (68 - 115) * t);
    const b = Math.floor(22 + (68 - 22) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
};

const render = () => {
  if (!canvasRef.value) return;
  
  const canvas = canvasRef.value;
  const rect = canvas.parentElement?.getBoundingClientRect();
  if (rect) {
    width.value = rect.width - 32;
    height.value = 300;
    canvas.width = width.value;
    canvas.height = height.value;
  }
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear with dark background
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, width.value, height.value);

  if (props.data.length === 0) {
    animationFrameId = requestAnimationFrame(render);
    return;
  }

  const padding = 20;
  const cellSize = props.cellSize;
  const cols = Math.floor((width.value - 2 * padding) / cellSize);
  const rows = Math.floor((height.value - 2 * padding) / cellSize);

  // Draw heatmap cells
  props.data.forEach((point) => {
    const x = padding + (point.x % cols) * cellSize;
    const y = padding + Math.floor(point.x / cols) * cellSize;
    
    if (x < width.value - padding && y < height.value - padding) {
      const color = getHeatmapColor(point.intensity);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
      
      // Add subtle glow for high intensity
      if (point.intensity / maxIntensity.value > 0.8) {
        ctx.shadowBlur = 5;
        ctx.shadowColor = color;
        ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
        ctx.shadowBlur = 0;
      }
    }
  });

  animationFrameId = requestAnimationFrame(render);
};

watch(() => props.data, () => {}, { deep: true });

onMounted(() => {
  render();
});

onBeforeUnmount(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style scoped>
.heatmap-container {
  width: 100%;
  height: 300px;
  position: relative;
}

canvas {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.heatmap-legend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  justify-content: center;
}

.legend-gradient {
  width: 200px;
  height: 20px;
  background: linear-gradient(to right, #3b82f6, #10b981, #f59e0b, #f97316, #ef4444);
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.legend-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}
</style>
