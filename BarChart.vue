<template>
  <div class="bar-chart-container">
    <canvas ref="canvasRef" :width="width" :height="height"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

interface DataPoint {
  label: string;
  value: number;
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
  
  const ctx = canvasRef.current.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width.value, height.value);

  if (props.data.length === 0) return;

  const padding = 40;
  const chartWidth = width.value - 2 * padding;
  const chartHeight = height.value - 2 * padding;
  const barWidth = chartWidth / props.data.length * 0.8;
  const spacing = chartWidth / props.data.length * 0.2;

  const maxValue = Math.max(...props.data.map(d => d.value)) || 1;

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

  // Draw bars
  props.data.forEach((point, index) => {
    const x = padding + (index / props.data.length) * chartWidth + spacing / 2;
    const barHeight = (point.value / maxValue) * chartHeight;
    const y = height.value - padding - barHeight;

    ctx.fillStyle = '#10b981';
    ctx.fillRect(x, y, barWidth, barHeight);

    // Draw label
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(point.label, x + barWidth / 2, height.value - padding + 20);
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
.bar-chart-container {
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
  padding: 10px;
}
</style>