<template>
  <canvas ref="canvas" class="chart-canvas"></canvas>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRenderLoop } from '../composables/useRenderLoop';
import { renderChart } from '../charts/canvasRenderer';

export default defineComponent({
  name: 'ChartCanvas',
  setup() {
    const canvas = ref<HTMLCanvasElement | null>(null);
    const { startRenderLoop, stopRenderLoop } = useRenderLoop();

    const updateChart = () => {
      if (canvas.value) {
        renderChart(canvas.value);
      }
    };

    onMounted(() => {
      startRenderLoop(updateChart);
    });

    onBeforeUnmount(() => {
      stopRenderLoop();
    });

    return {
      canvas,
    };
  },
});
</script>

<style scoped>
.chart-canvas {
  width: 100%;
  height: 100%;
}
</style>