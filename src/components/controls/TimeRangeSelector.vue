<template>
  <div class="time-range-selector">
    <div class="selector-header">
      <h3>Time Range</h3>
    </div>
    
    <div class="preset-buttons">
      <button
        v-for="preset in presets"
        :key="preset.value"
        :class="['preset-btn', { active: selectedPreset === preset.value }]"
        @click="selectPreset(preset.value)"
      >
        {{ preset.label }}
      </button>
    </div>

    <div class="custom-range" v-if="selectedPreset === 'custom'">
      <div class="range-group">
        <label>From</label>
        <input
          type="datetime-local"
          v-model="startTime"
          class="datetime-input"
        />
      </div>
      <div class="range-group">
        <label>To</label>
        <input
          type="datetime-local"
          v-model="endTime"
          class="datetime-input"
        />
      </div>
    </div>

    <div class="aggregation-selector">
      <label class="filter-label">Aggregation</label>
      <select v-model="aggregation" class="select-input">
        <option value="raw">Raw Data</option>
        <option value="1min">1 Minute</option>
        <option value="5min">5 Minutes</option>
        <option value="1hour">1 Hour</option>
        <option value="1day">1 Day</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

const emit = defineEmits<{
  (e: 'range-change', range: TimeRange): void;
}>();

interface TimeRange {
  start: number;
  end: number;
  aggregation: string;
}

interface Preset {
  label: string;
  value: string;
  getRange: () => { start: number; end: number };
}

const presets: Preset[] = [
  {
    label: 'Last Hour',
    value: '1h',
    getRange: () => ({
      start: Date.now() - 60 * 60 * 1000,
      end: Date.now(),
    }),
  },
  {
    label: 'Last 6 Hours',
    value: '6h',
    getRange: () => ({
      start: Date.now() - 6 * 60 * 60 * 1000,
      end: Date.now(),
    }),
  },
  {
    label: 'Last 24 Hours',
    value: '24h',
    getRange: () => ({
      start: Date.now() - 24 * 60 * 60 * 1000,
      end: Date.now(),
    }),
  },
  {
    label: 'Last 7 Days',
    value: '7d',
    getRange: () => ({
      start: Date.now() - 7 * 24 * 60 * 60 * 1000,
      end: Date.now(),
    }),
  },
  {
    label: 'Custom',
    value: 'custom',
    getRange: () => ({
      start: new Date(startTime.value).getTime(),
      end: new Date(endTime.value).getTime(),
    }),
  },
];

const selectedPreset = ref('24h');
const aggregation = ref('raw');
const startTime = ref(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
const endTime = ref(new Date().toISOString().slice(0, 16));

const currentRange = computed(() => {
  const preset = presets.find(p => p.value === selectedPreset.value);
  if (preset) {
    return preset.getRange();
  }
  return {
    start: new Date(startTime.value).getTime(),
    end: new Date(endTime.value).getTime(),
  };
});

const selectPreset = (value: string) => {
  selectedPreset.value = value;
  emitRange();
};

const emitRange = () => {
  const range = currentRange.value;
  emit('range-change', {
    start: range.start,
    end: range.end,
    aggregation: aggregation.value,
  });
};

watch([selectedPreset, aggregation, startTime, endTime], () => {
  emitRange();
}, { deep: true });

// Emit initial range
emitRange();
</script>

<style scoped>
.time-range-selector {
  background: var(--dark-surface);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
}

.selector-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.selector-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.preset-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.preset-btn {
  background: var(--dark-bg);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.preset-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-1px);
}

.preset-btn.active {
  background: var(--primary-gradient);
  border-color: transparent;
  color: white;
  box-shadow: var(--shadow-md);
}

.custom-range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--dark-bg);
  border-radius: 8px;
}

.range-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.range-group label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.datetime-input {
  background: var(--dark-surface);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem;
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s;
}

.datetime-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.aggregation-selector {
  margin-top: 1rem;
}

.filter-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.select-input {
  width: 100%;
  background: var(--dark-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem;
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.select-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}
</style>

