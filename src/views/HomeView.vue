<template>
  <div class="home-view">
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="main-title">
          <span class="title-icon">📊</span>
          Performance Dashboard
        </h1>
        <p class="subtitle">Real-time monitoring and analytics at 60fps</p>
      </div>
      <div class="performance-stats" v-if="fps">
        <div class="stat-item">
          <span class="stat-label">FPS</span>
          <span class="stat-value" :class="{ 'fps-good': fps >= 55, 'fps-warning': fps < 55 && fps >= 30, 'fps-bad': fps < 30 }">
            {{ fps }}
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Memory</span>
          <span class="stat-value">{{ memory }} MB</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Data Points</span>
          <span class="stat-value">{{ dataPointCount.toLocaleString() }}</span>
        </div>
        <div class="stat-item" v-if="vitals.LCP">
          <span class="stat-label">LCP</span>
          <span class="stat-value">{{ Math.round(vitals.LCP) }}ms</span>
        </div>
      </div>
    </div>

    <div class="controls-section">
      <div class="controls-grid">
        <FilterPanel @filter-change="handleFilterChange" />
        <TimeRangeSelector @range-change="handleRangeChange" />
      </div>
    </div>

    <div class="metrics-grid">
      <MetricCard
        title="Total Requests"
        :value="totalRequests"
        description="Requests processed in selected time range"
        unit="req"
        icon="📈"
        :trend="12"
        color="primary"
      />
      <MetricCard
        title="Response Time"
        :value="avgResponseTime"
        description="Average response time"
        unit="ms"
        icon="⚡"
        :trend="-5"
        color="success"
      />
      <MetricCard
        title="Error Rate"
        :value="errorRate"
        description="Percentage of failed requests"
        unit="%"
        icon="⚠️"
        :trend="-2"
        color="warning"
      />
      <MetricCard
        title="Active Users"
        :value="activeUsers"
        description="Currently active users"
        unit="users"
        icon="👥"
        :trend="8"
        color="secondary"
      />
    </div>

    <div class="charts-section">
      <div class="section-header">
        <h2>Analytics Overview</h2>
        <p class="section-description">Visual representation of your performance metrics</p>
      </div>
      
      <div class="charts-grid">
        <div class="chart-wrapper fade-in">
          <div class="chart-header">
            <h3>Performance Trends</h3>
            <span class="chart-badge">Live</span>
          </div>
          <LineChart :data="aggregatedData" :targetFPS="60" />
        </div>
        
        <div class="chart-wrapper fade-in" style="animation-delay: 0.1s">
          <div class="chart-header">
            <h3>Request Distribution</h3>
            <span class="chart-badge">24h</span>
          </div>
          <BarChart :data="barChartData" />
        </div>
        
        <div class="chart-wrapper fade-in" style="animation-delay: 0.2s">
          <div class="chart-header">
            <h3>Data Correlation</h3>
            <span class="chart-badge">Real-time</span>
          </div>
          <ScatterPlot :data="scatterData" />
        </div>
        
        <div class="chart-wrapper fade-in" style="animation-delay: 0.3s">
          <div class="chart-header">
            <h3>Activity Heatmap</h3>
            <span class="chart-badge">Live</span>
          </div>
          <Heatmap :data="heatmapData" />
        </div>
      </div>
    </div>

    <div class="data-table-section">
      <DataTable
        :data="tableData"
        :columns="tableColumns"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import usePerformanceMonitor from '../composables/usePerformanceMonitor';
import { useDataStream } from '../composables/useDataStream';
import { useWebVitals } from '../composables/useWebVitals';
import { generateScatterData, generateHeatmapData, filterData, aggregateData } from '../utils/dataGenerator';
import LineChart from '../components/charts/LineChart.vue';
import BarChart from '../components/charts/BarChart.vue';
import ScatterPlot from '../components/charts/ScatterPlot.vue';
import Heatmap from '../components/charts/Heatmap.vue';
import MetricCard from '../components/MetricCard.vue';
import FilterPanel from '../components/controls/FilterPanel.vue';
import TimeRangeSelector from '../components/controls/TimeRangeSelector.vue';
import DataTable from '../components/ui/DataTable.vue';

const { fps, memory } = usePerformanceMonitor();
const { data: streamData, dataPointLimit } = useDataStream(10000);
const { vitals } = useWebVitals();

const filters = ref({
  categories: ['All'],
  minValue: 0,
  maxValue: 1000,
  dataPointLimit: 10000,
});

const timeRange = ref({
  start: Date.now() - 24 * 60 * 60 * 1000,
  end: Date.now(),
  aggregation: 'raw',
});

const barChartData = ref([
  { label: 'Mon', value: 65 },
  { label: 'Tue', value: 78 },
  { label: 'Wed', value: 90 },
  { label: 'Thu', value: 81 },
  { label: 'Fri', value: 95 },
  { label: 'Sat', value: 72 },
  { label: 'Sun', value: 68 },
]);

const scatterData = ref(generateScatterData(1000));
const heatmapData = ref(generateHeatmapData(50, 30));

const filteredStreamData = computed(() => {
  return filterData(streamData.value, {
    categories: filters.value.categories.includes('All') ? undefined : filters.value.categories,
    minValue: filters.value.minValue,
    maxValue: filters.value.maxValue,
    limit: filters.value.dataPointLimit,
  });
});

const aggregatedData = computed(() => {
  return aggregateData(filteredStreamData.value, timeRange.value.aggregation as any);
});

const dataPointCount = computed(() => aggregatedData.value.length);

const totalRequests = computed(() => {
  return aggregatedData.value.length;
});

const avgResponseTime = computed(() => {
  if (aggregatedData.value.length === 0) return 0;
  const sum = aggregatedData.value.reduce((acc, p) => acc + p.value, 0);
  return Math.round(sum / aggregatedData.value.length);
});

const errorRate = computed(() => {
  if (aggregatedData.value.length === 0) return 0;
  const errors = aggregatedData.value.filter(p => p.metadata?.status === 'error').length;
  return ((errors / aggregatedData.value.length) * 100).toFixed(2);
});

const activeUsers = computed(() => {
  return Math.floor(aggregatedData.value.length / 10) + 500;
});

const tableData = computed(() => {
  return aggregatedData.value.slice(-100).map((point, index) => ({
    id: point.id,
    timestamp: new Date(point.timestamp),
    value: point.value.toFixed(2),
    category: point.category,
    status: point.metadata?.status || 'success',
  }));
});

const tableColumns = [
  { key: 'id', label: 'ID' },
  { key: 'timestamp', label: 'Timestamp', formatter: (val: Date) => val.toLocaleString() },
  { key: 'value', label: 'Value' },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status' },
];

const handleFilterChange = (newFilters: any) => {
  filters.value = { ...filters.value, ...newFilters };
};

const handleRangeChange = (newRange: any) => {
  timeRange.value = { ...timeRange.value, ...newRange };
};

onMounted(() => {
  // Update bar chart data periodically
  setInterval(() => {
    barChartData.value = barChartData.value.map(item => ({
      ...item,
      value: Math.max(50, Math.min(100, item.value + Math.floor(Math.random() * 10 - 5)))
    }));
  }, 3000);

  // Update scatter data
  setInterval(() => {
    scatterData.value = generateScatterData(1000);
  }, 5000);

  // Update heatmap data
  setInterval(() => {
    heatmapData.value = generateHeatmapData(50, 30);
  }, 4000);
});
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: var(--dark-bg);
  padding: 2rem;
  animation: fadeIn 0.6s ease-out;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: var(--dark-surface);
  border-radius: 20px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg);
  flex-wrap: wrap;
  gap: 1.5rem;
}

.header-content {
  flex: 1;
  min-width: 300px;
}

.main-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0;
}

.performance-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  min-width: 100px;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent);
}

.stat-value.fps-good {
  color: #10b981;
}

.stat-value.fps-warning {
  color: #f59e0b;
}

.stat-value.fps-bad {
  color: #ef4444;
}

.controls-section {
  margin-bottom: 2rem;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.charts-section {
  margin-top: 3rem;
}

.section-header {
  margin-bottom: 2rem;
  text-align: center;
}

.section-header h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-description {
  color: var(--text-secondary);
  font-size: 1rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
}

.chart-wrapper {
  background: var(--dark-surface);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
}

.chart-wrapper:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
  border-color: var(--accent);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.chart-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.chart-badge {
  padding: 0.25rem 0.75rem;
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.data-table-section {
  margin-top: 3rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}

@media (max-width: 768px) {
  .home-view {
    padding: 1rem;
  }
  
  .dashboard-header {
    flex-direction: column;
    text-align: center;
  }
  
  .performance-stats {
    width: 100%;
    justify-content: center;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .controls-grid {
    grid-template-columns: 1fr;
  }
  
  .main-title {
    font-size: 2rem;
  }
}
</style>
