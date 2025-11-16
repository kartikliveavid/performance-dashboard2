<template>
  <div class="line-chart-container">
    <canvas ref="canvas" :width="width" :height="height"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import type { DataPoint } from '../../utils/dataGenerator';

interface Props {
  data?: DataPoint[];
  targetFPS?: number;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  targetFPS: 60,
});

const canvas = ref<HTMLCanvasElement | null>(null);
const width = ref(800);
const height = ref(400);
let animationFrameId: number | null = null;
let lastFrameTime = 0;
let frameCount = 0;

// Offscreen canvas for static elements (grid, background)
let staticCanvas: HTMLCanvasElement | null = null;
let staticCtx: CanvasRenderingContext2D | null = null;
let staticDirty = true;

// Cache for min/max values
let cachedMinMax: { min: number; max: number } | null = null;
let cachedDataLength = 0;

// Data decimation - reduce points based on screen width for performance
const decimatedData = computed(() => {
  const data = props.data || [];
  if (data.length === 0) return [];
  
  // Maximum points to render (2x screen width for smooth lines)
  const maxPoints = Math.max(width.value * 2, 2000);
  
  if (data.length <= maxPoints) {
    return data;
  }
  
  // Use LTTB (Largest-Triangle-Three-Buckets) algorithm for efficient downsampling
  return downsampleLTTB(data, maxPoints);
});

// LTTB downsampling algorithm for preserving visual features
function downsampleLTTB(data: DataPoint[], threshold: number): DataPoint[] {
  if (data.length <= threshold) return data;
  
  const dataLength = data.length;
  if (threshold >= dataLength || threshold === 0) return data;
  
  const sampled: DataPoint[] = [];
  const every = (dataLength - 2) / (threshold - 2);
  let a = 0;
  
  sampled.push(data[a]);
  
  for (let i = 0; i < threshold - 2; i++) {
    const rangeStart = Math.floor((i + 1) * every) + 1;
    const rangeEnd = Math.min(Math.floor((i + 2) * every) + 1, dataLength);
    const avgRangeStart = Math.floor((i + 0) * every) + 1;
    const avgRangeEnd = Math.min(Math.floor((i + 1) * every) + 1, dataLength);
    
    let avgX = 0;
    let avgY = 0;
    let avgRangeLength = 0;
    
    for (let j = avgRangeStart; j < avgRangeEnd; j++) {
      avgX += data[j].timestamp;
      avgY += data[j].value;
      avgRangeLength++;
    }
    avgX /= avgRangeLength;
    avgY /= avgRangeLength;
    
    let rangeArea = -1;
    let maxAreaPoint = rangeStart;
    
    for (let j = rangeStart; j < rangeEnd; j++) {
      const area = Math.abs(
        (data[a].timestamp - avgX) * (data[j].value - data[a].value) -
        (data[a].timestamp - data[j].timestamp) * (avgY - data[a].value)
      ) * 0.5;
      
      if (area > rangeArea) {
        rangeArea = area;
        maxAreaPoint = j;
      }
    }
    
    sampled.push(data[maxAreaPoint]);
    a = maxAreaPoint;
  }
  
  sampled.push(data[dataLength - 1]);
  return sampled;
}

// Calculate min/max values efficiently
function calculateMinMax(data: DataPoint[]): { min: number; max: number } {
  if (data.length === 0) return { min: 0, max: 100 };
  
  // Only recalculate if data changed
  if (cachedMinMax && cachedDataLength === data.length) {
    return cachedMinMax;
  }
  
  let min = Infinity;
  let max = -Infinity;
  
  // Use efficient loop instead of Math.min/max spread
  for (let i = 0; i < data.length; i++) {
    const value = data[i].value;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  
  const padding = (max - min) * 0.1 || 10;
  cachedMinMax = { min: min - padding, max: max + padding };
  cachedDataLength = data.length;
  
  return cachedMinMax;
}

// Draw static elements (grid, background) to offscreen canvas
function drawStatic(ctx: CanvasRenderingContext2D) {
  if (!staticCanvas || !staticCtx) {
    staticCanvas = document.createElement('canvas');
    staticCanvas.width = width.value;
    staticCanvas.height = height.value;
    staticCtx = staticCanvas.getContext('2d', { alpha: false });
    if (!staticCtx) return;
  }
  
  if (staticCanvas.width !== width.value || staticCanvas.height !== height.value) {
    staticCanvas.width = width.value;
    staticCanvas.height = height.value;
    staticDirty = true;
  }
  
  if (!staticDirty) return;
  
  const padding = 40;
  const chartWidth = width.value - 2 * padding;
  const chartHeight = height.value - 2 * padding;
  
  // Clear static canvas
  staticCtx.clearRect(0, 0, width.value, height.value);
  
  // Draw gradient background
  const bgGradient = staticCtx.createLinearGradient(0, 0, 0, height.value);
  bgGradient.addColorStop(0, 'rgba(102, 126, 234, 0.05)');
  bgGradient.addColorStop(1, 'rgba(118, 75, 162, 0.05)');
  staticCtx.fillStyle = bgGradient;
  staticCtx.fillRect(0, 0, width.value, height.value);
  
  // Draw grid lines
  staticCtx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
  staticCtx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = padding + (chartHeight / 5) * i;
    staticCtx.beginPath();
    staticCtx.moveTo(padding, y);
    staticCtx.lineTo(width.value - padding, y);
    staticCtx.stroke();
  }
  
  staticDirty = false;
}

// Draw the line chart efficiently
function draw() {
  const now = performance.now();
  const deltaTime = now - lastFrameTime;
  const targetFrameTime = 1000 / props.targetFPS;
  
  // Frame rate limiting
  if (deltaTime < targetFrameTime) {
    animationFrameId = requestAnimationFrame(draw);
    return;
  }
  
  lastFrameTime = now;
  frameCount++;
  
  if (!canvas.value) {
    animationFrameId = requestAnimationFrame(draw);
    return;
  }
  
  const ctx = canvas.value.getContext('2d', { alpha: false, desynchronized: true });
  if (!ctx) {
    animationFrameId = requestAnimationFrame(draw);
    return;
  }
  
  // Set canvas size
  const rect = canvas.value.parentElement?.getBoundingClientRect();
  if (rect) {
    const newWidth = Math.floor(rect.width - 32);
    const newHeight = 300;
    
    if (width.value !== newWidth || height.value !== newHeight) {
      width.value = newWidth;
      height.value = newHeight;
      canvas.value.width = width.value;
      canvas.value.height = height.value;
      staticDirty = true;
    }
  }
  
  const data = decimatedData.value;
  
  if (data.length < 2) {
    ctx.clearRect(0, 0, width.value, height.value);
    animationFrameId = requestAnimationFrame(draw);
    return;
  }
  
  // Draw static elements from cache
  drawStatic(ctx);
  if (staticCanvas) {
    ctx.drawImage(staticCanvas, 0, 0);
  }
  
  const padding = 40;
  const chartWidth = width.value - 2 * padding;
  const chartHeight = height.value - 2 * padding;
  
  const { min: minValue, max: maxValue } = calculateMinMax(data);
  const valueRange = maxValue - minValue || 1;
  
  // Draw line path - optimized for performance
  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowBlur = 0; // Disable shadow for performance
  
  ctx.beginPath();
  const dataLength = data.length;
  for (let i = 0; i < dataLength; i++) {
    const x = padding + (i / (dataLength - 1)) * chartWidth;
    const y = height.value - padding - ((data[i].value - minValue) / valueRange) * chartHeight;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
  
  // Draw gradient fill - only if data points are reasonable
  if (data.length < 5000) {
    const gradient = ctx.createLinearGradient(0, padding, 0, height.value - padding);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(padding, height.value - padding);
    for (let i = 0; i < dataLength; i++) {
      const x = padding + (i / (dataLength - 1)) * chartWidth;
      const y = height.value - padding - ((data[i].value - minValue) / valueRange) * chartHeight;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width.value - padding, height.value - padding);
    ctx.closePath();
    ctx.fill();
  }
  
  // Draw labels (only update every second for performance)
  if (frameCount === 0 || frameCount % props.targetFPS === 0) {
    ctx.fillStyle = 'rgba(203, 213, 225, 0.6)';
    ctx.font = '12px Inter';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = minValue + (valueRange / 5) * (5 - i);
      const y = padding + (chartHeight / 5) * i;
      ctx.fillText(Math.round(value).toString(), padding - 10, y + 4);
    }
  }
  
  animationFrameId = requestAnimationFrame(draw);
}

// Watch for data changes to invalidate cache
watch(() => props.data, () => {
  cachedMinMax = null;
  cachedDataLength = 0;
  staticDirty = true;
}, { deep: true });

onMounted(() => {
  draw();
});

onBeforeUnmount(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  staticCanvas = null;
  staticCtx = null;
});
</script>

<style scoped>
.line-chart-container {
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
