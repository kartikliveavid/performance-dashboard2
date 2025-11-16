<template>
  <div class="metric-card" :class="{ 'fade-in': isVisible }">
    <div class="metric-header">
      <h3 class="metric-title">{{ title }}</h3>
      <div class="metric-icon" v-if="icon">
        <span>{{ icon }}</span>
      </div>
    </div>
    <div class="metric-value-wrapper">
      <p class="metric-value" :class="valueClass">{{ formattedValue }}</p>
      <span class="metric-unit" v-if="unit">{{ unit }}</span>
    </div>
    <p class="metric-description" v-if="description">{{ description }}</p>
    <div class="metric-trend" v-if="trend">
      <span :class="['trend-indicator', trend > 0 ? 'trend-up' : 'trend-down']">
        {{ trend > 0 ? '↑' : '↓' }} {{ Math.abs(trend) }}%
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface Props {
  title: string;
  value: string | number;
  description?: string;
  unit?: string;
  icon?: string;
  trend?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  unit: '',
  icon: '',
  trend: undefined,
  color: 'primary'
});

const isVisible = ref(false);

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true;
  }, 100);
});

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString();
  }
  return props.value;
});

const valueClass = computed(() => {
  return `value-${props.color}`;
});
</script>

<style scoped>
.metric-card {
  background: var(--dark-surface);
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary-gradient);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.metric-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: var(--shadow-xl);
  border-color: var(--accent);
}

.metric-card:hover::before {
  transform: scaleX(1);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.metric-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: var(--shadow-md);
  transition: transform 0.3s ease;
}

.metric-card:hover .metric-icon {
  transform: rotate(5deg) scale(1.1);
}

.metric-value-wrapper {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  transition: all 0.3s ease;
}

.metric-card:hover .metric-value {
  transform: scale(1.05);
}

.value-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.value-secondary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.value-success {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.value-warning {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.value-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.metric-unit {
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.metric-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.5rem 0 0 0;
  line-height: 1.5;
}

.metric-trend {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
}

.trend-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  background: rgba(139, 92, 246, 0.1);
}

.trend-up {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.trend-down {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
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
</style>
