<template>
  <div class="filter-panel">
    <div class="filter-header">
      <h3>Filters</h3>
      <button class="clear-btn" @click="clearFilters" v-if="hasActiveFilters">
        Clear All
      </button>
    </div>
    
    <div class="filter-group">
      <label class="filter-label">Category</label>
      <div class="filter-options">
        <button
          v-for="category in categories"
          :key="category"
          :class="['filter-chip', { active: selectedCategories.includes(category) }]"
          @click="toggleCategory(category)"
        >
          {{ category }}
        </button>
      </div>
    </div>

    <div class="filter-group">
      <label class="filter-label">Value Range</label>
      <div class="range-inputs">
        <input
          type="number"
          v-model.number="minValue"
          :min="0"
          :max="maxValue"
          class="range-input"
          placeholder="Min"
        />
        <span class="range-separator">-</span>
        <input
          type="number"
          v-model.number="maxValue"
          :min="minValue"
          class="range-input"
          placeholder="Max"
        />
      </div>
    </div>

    <div class="filter-group">
      <label class="filter-label">Data Points</label>
      <div class="slider-container">
        <input
          type="range"
          v-model.number="dataPointLimit"
          :min="1000"
          :max="50000"
          :step="1000"
          class="slider"
        />
        <div class="slider-value">{{ dataPointLimit.toLocaleString() }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const emit = defineEmits<{
  (e: 'filter-change', filters: FilterState): void;
}>();

interface FilterState {
  categories: string[];
  minValue: number;
  maxValue: number;
  dataPointLimit: number;
}

const categories = ref(['All', 'API', 'Database', 'Cache', 'Queue']);
const selectedCategories = ref<string[]>(['All']);
const minValue = ref(0);
const maxValue = ref(1000);
const dataPointLimit = ref(10000);

const hasActiveFilters = computed(() => {
  return selectedCategories.value.length > 0 && 
         selectedCategories.value[0] !== 'All' ||
         minValue.value > 0 ||
         maxValue.value < 1000;
});

const toggleCategory = (category: string) => {
  if (category === 'All') {
    selectedCategories.value = ['All'];
  } else {
    selectedCategories.value = selectedCategories.value.filter(c => c !== 'All');
    if (selectedCategories.value.includes(category)) {
      selectedCategories.value = selectedCategories.value.filter(c => c !== category);
    } else {
      selectedCategories.value.push(category);
    }
    if (selectedCategories.value.length === 0) {
      selectedCategories.value = ['All'];
    }
  }
  emitFilters();
};

const clearFilters = () => {
  selectedCategories.value = ['All'];
  minValue.value = 0;
  maxValue.value = 1000;
  emitFilters();
};

const emitFilters = () => {
  emit('filter-change', {
    categories: selectedCategories.value,
    minValue: minValue.value,
    maxValue: maxValue.value,
    dataPointLimit: dataPointLimit.value,
  });
};

watch([minValue, maxValue, dataPointLimit], () => {
  emitFilters();
});

defineExpose({ emitFilters });
</script>

<style scoped>
.filter-panel {
  background: var(--dark-surface);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.filter-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.clear-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-1px);
}

.filter-group {
  margin-bottom: 1.5rem;
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

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-chip {
  background: var(--dark-bg);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-chip:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.filter-chip.active {
  background: var(--primary-gradient);
  border-color: transparent;
  color: white;
  box-shadow: var(--shadow-md);
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.range-input {
  flex: 1;
  background: var(--dark-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem;
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s;
}

.range-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.range-separator {
  color: var(--text-secondary);
  font-weight: 600;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.slider {
  flex: 1;
  height: 6px;
  background: var(--dark-bg);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: var(--primary-gradient);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: var(--shadow-md);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: var(--primary-gradient);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: var(--shadow-md);
}

.slider-value {
  min-width: 80px;
  text-align: right;
  font-weight: 600;
  color: var(--accent);
  font-size: 0.875rem;
}
</style>

