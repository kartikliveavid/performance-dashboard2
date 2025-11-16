<template>
  <div class="dashboard">
    <h1>Performance Dashboard</h1>
    <MetricCard v-for="metric in metrics" :key="metric.id" :metric="metric" />
    <ChartCanvas :data="chartData" />
    <Legend :data="chartData" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import MetricCard from './MetricCard.vue';
import ChartCanvas from './ChartCanvas.vue';
import Legend from './Legend.vue';
import { useRealtimeData } from '../composables/useRealtimeData';

export default defineComponent({
  name: 'Dashboard',
  components: {
    MetricCard,
    ChartCanvas,
    Legend,
  },
  setup() {
    const { metrics, chartData } = useRealtimeData();

    return {
      metrics,
      chartData,
    };
  },
});
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>