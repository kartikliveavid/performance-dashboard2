<template>
  <div class="scatter-plot-container">
    <canvas ref="canvasRef" :width="width" :height="height"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { useChartRenderer } from '../../composables/useChartRenderer';
import { getOptimizedContext, createOffscreenCanvas, drawGrid, calculateBounds } from '../../utils/canvasUtils';

interface DataPoint {
  x: number;
  y: number;
  color?: string;
  size?: number;
}

const props = withDefaults(defineProps<{
  data: DataPoint[];
  width?: number;
  height?: number;
  targetFPS?: number;
}>(), {
  width: 800,
  height: 400,
  targetFPS: 60,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
const width = ref(props.width);
const height = ref(props.height);

// Offscreen canvas for static elements
let staticCanvas: HTMLCanvasElement | null = null;
let staticCtx: CanvasRenderingContext2D | null = null;
let staticDirty = true;

const bounds = computed(() => {
  if (!props.data || props.data.length === 0) {
    return { minX: 0, maxX: 100, minY: 0, maxY: 100 };
  }
  const xBounds = calculateBounds(props.data, d => d.x);
  const yBounds = calculateBounds(props.data, d => d.y);
  return {
    minX: xBounds.min,
    maxX: xBounds.max || 1,
    minY: yBounds.min,
    maxY: yBounds.max || 1
  };
});

const drawStatic = () => {
  if (!staticCanvas || !staticCtx) {
    const result = createOffscreenCanvas(width.value, height.value);
    staticCanvas = result.canvas;
    staticCtx = result.ctx;
    if (!staticCtx) return;
  }

  if (staticCanvas.width !== width.value || staticCanvas.height !== height.value) {
    staticCanvas.width = width.value;
    staticCanvas.height = height.value;
    staticDirty = true;
  }

  if (!staticDirty) return;

  const padding = 50;
  
  // Clear static canvas
  staticCtx.clearRect(0, 0, width.value, height.value);

  // Draw gradient background
  const bgGradient = staticCtx.createLinearGradient(0, 0, 0, height.value);
  bgGradient.addColorStop(0, 'rgba(16, 185, 129, 0.05)');
  bgGradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
  staticCtx.fillStyle = bgGradient;
  staticCtx.fillRect(0, 0, width.value, height.value);

  // Draw grid
  drawGrid(staticCtx, width.value, height.value, padding, 5, 5);

  staticDirty = false;
};

const render = () => {
  if (!canvasRef.value) return;
  
  const canvas = canvasRef.value;
  const rect = canvas.parentElement?.getBoundingClientRect();
  if (rect) {
    const newWidth = Math.floor(rect.width - 32);
    const newHeight = 300;
    
    if (width.value !== newWidth || height.value !== newHeight) {
      width.value = newWidth;
      height.value = newHeight;
      canvas.width = width.value;
      canvas.height = height.value;
      staticDirty = true;
    }
  }
  
  const ctx = getOptimizedContext(canvas, {
    width: width.value,
    height: height.value,
    alpha: false,
    desynchronized: true,
  });
  if (!ctx) return;

  if (!props.data || props.data.length === 0) return;

  // Draw static elements
  drawStatic();
  if (staticCanvas) {
    ctx.drawImage(staticCanvas, 0, 0);
  }

  const padding = 50;
  const chartWidth = width.value - 2 * padding;
  const chartHeight = height.value - 2 * padding;
  const { minX, maxX, minY, maxY } = bounds.value;
  const xRange = maxX - minX || 1;
  const yRange = maxY - minY || 1;

  // Draw points - optimized loop, no shadows for performance
  ctx.shadowBlur = 0;
  for (let i = 0; i < props.data.length; i++) {
    const point = props.data[i];
    const x = padding + ((point.x - minX) / xRange) * chartWidth;
    const y = height.value - padding - ((point.y - minY) / yRange) * chartHeight;
    const size = point.size || 4;
    const color = point.color || '#f59e0b';

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw axes labels (only update occasionally)
  ctx.fillStyle = 'rgba(203, 213, 225, 0.6)';
  ctx.font = '11px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('X', width.value / 2, height.value - 10);
  ctx.textAlign = 'right';
  ctx.save();
  ctx.translate(15, height.value / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Y', 0, 0);
  ctx.restore();
};

const { start, stop } = useChartRenderer(canvasRef, {
  targetFPS: props.targetFPS,
  enablePerformanceMonitoring: false,
});

watch(() => props.data, () => {
  staticDirty = true;
}, { deep: true });

onMounted(() => {
  start(render);
});

onBeforeUnmount(() => {
  stop();
  staticCanvas = null;
  staticCtx = null;
});
</script>

<style scoped>
.scatter-plot-container {
  width: 100%;
  height: 300px;
  position: relative;
}

canvas {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}
</style>
