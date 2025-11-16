<template>
  <div class="bar-chart-container">
    <canvas ref="canvasRef" :width="width" :height="height"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { useChartRenderer } from '../../composables/useChartRenderer';
import { getOptimizedContext, createOffscreenCanvas, drawGrid } from '../../utils/canvasUtils';

interface DataPoint {
  label: string;
  value: number;
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
let animationProgress = ref(0);

// Offscreen canvas for static elements
let staticCanvas: HTMLCanvasElement | null = null;
let staticCtx: CanvasRenderingContext2D | null = null;
let staticDirty = true;

const maxValue = computed(() => {
  if (props.data.length === 0) return 1;
  // Use efficient calculation
  let max = 0;
  for (let i = 0; i < props.data.length; i++) {
    if (props.data[i].value > max) max = props.data[i].value;
  }
  return max || 1;
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
  bgGradient.addColorStop(0, 'rgba(102, 126, 234, 0.05)');
  bgGradient.addColorStop(1, 'rgba(118, 75, 162, 0.05)');
  staticCtx.fillStyle = bgGradient;
  staticCtx.fillRect(0, 0, width.value, height.value);

  // Draw grid
  drawGrid(staticCtx, width.value, height.value, padding, 5, 0);

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

  if (props.data.length === 0) return;

  // Draw static elements
  drawStatic();
  if (staticCanvas) {
    ctx.drawImage(staticCanvas, 0, 0);
  }

  const padding = 50;
  const chartWidth = width.value - 2 * padding;
  const chartHeight = height.value - 2 * padding;
  const barWidth = (chartWidth / props.data.length) * 0.7;
  const spacing = (chartWidth / props.data.length) * 0.3;

  // Draw bars with animation - optimized loop
  ctx.shadowBlur = 0; // Disable shadow for performance
  for (let i = 0; i < props.data.length; i++) {
    const point = props.data[i];
    const x = padding + (i / props.data.length) * chartWidth + spacing / 2;
    const targetHeight = (point.value / maxValue.value) * chartHeight;
    const animatedHeight = targetHeight * animationProgress.value;
    const y = height.value - padding - animatedHeight;

    // Create gradient for each bar
    const barGradient = ctx.createLinearGradient(x, y, x, height.value - padding);
    barGradient.addColorStop(0, '#8b5cf6');
    barGradient.addColorStop(1, '#667eea');
    
    ctx.fillStyle = barGradient;
    ctx.fillRect(x, y, barWidth, animatedHeight);

    // Draw value on top of bar (only if visible)
    if (animatedHeight > 20) {
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(
        Math.round(point.value).toString(),
        x + barWidth / 2,
        y - 5
      );
    }

    // Draw label
    ctx.fillStyle = 'rgba(203, 213, 225, 0.8)';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(
      point.label,
      x + barWidth / 2,
      height.value - padding + 20
    );
  }

  // Animate progress
  if (animationProgress.value < 1) {
    animationProgress.value = Math.min(1, animationProgress.value + 0.05);
  }
};

const { start, stop } = useChartRenderer(canvasRef, {
  targetFPS: props.targetFPS,
  enablePerformanceMonitoring: false,
});

watch(() => props.data, () => {
  animationProgress.value = 0;
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
.bar-chart-container {
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
