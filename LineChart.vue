<template>
  <div style="margin: 24px 0; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
    <h2>Line Chart</h2>
    <canvas ref="canvas" width="800" height="300"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const canvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  if (!canvas.value) return;
  const ctx = canvas.value.getContext('2d');
  if (!ctx) return;
  
  ctx.strokeStyle = 'blue';
  ctx.beginPath();
  ctx.moveTo(0, 150);
  for (let i = 0; i < 800; i += 10) {
    ctx.lineTo(i, 150 + Math.sin(i / 100) * 50);
  }
  ctx.stroke();
});
</script>