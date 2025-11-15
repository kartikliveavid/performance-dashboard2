<template>
  <div style="padding: 24px">
    <h1>Performance Dashboard (Vue)</h1>
    <div v-if="fps" style="margin-bottom: 24px">
      <div>FPS: <strong>{{ fps }}</strong></div>
      <div>Memory: <strong>{{ memory }}</strong> MB</div>
    </div>
    <LineChart />
    <BarChart />
    <p>App running — add more components under src/components</p>
  </div>
</template>

<script setup lang="ts">
import usePerformanceMonitor from '../composables/usePerformanceMonitor';
import LineChart from '../components/charts/LineChart.vue';
import BarChart from '../components/charts/BarChart.vue';

const { fps, memory, render } = usePerformanceMonitor();
</script>