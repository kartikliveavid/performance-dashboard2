<template>
  <div class="scatter-plot-container">
    <canvas ref="canvasRef" :width="width" :height="height"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

interface DataPoint {
  x: number;
  y: number;
  color?: string;
  size?: number;
}

const props = defineProps<{
  data: DataPoint[];
  width?: number;
  height?: number;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const width = ref(props.width || 800);
const height = ref(props.height || 400);
let animationFrameId: number | null = null;

const render = () => {
  if (!canvasRef.value) return;
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width.value, height.value);

  if (!props.data || props.data.length === 0) return;

  const padding = 40;
  const chartWidth = width.value - 2 * padding;
  const chartHeight = height.value - 2 * padding;

  const xValues = props.data.map(d => d.x);
  const yValues = props.data.map(d => d.y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues) || 1;
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues) || 1;

  // Draw grid
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 10; i++) {
    const y = padding + (chartHeight / 10) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width.value - padding, y);
    ctx.stroke();
  }

  // Draw points
  props.data.forEach((point) => {
    const x = padding + ((point.x - minX) / (maxX - minX || 1)) * chartWidth;
    const y = padding + chartHeight - ((point.y - minY) / (maxY - minY || 1)) * chartHeight;
    const size = point.size || 5;

    ctx.fillStyle = point.color || '#f59e0b';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  });

  animationFrameId = requestAnimationFrame(render);
};

onMounted(() => {
  render();
});

onBeforeUnmount(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
});

watch(() => props.data, () => {
  // re-render handled by loop
}, { deep: true });
</script>

<style scoped>
.scatter-plot-container {
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
  padding: 10px;
}
</style>