<template>
  <div class="data-table-container">
    <div class="table-header">
      <h3>Data Points</h3>
      <div class="table-info">
        Showing {{ startIndex + 1 }}-{{ Math.min(endIndex, data.length) }} of {{ data.length }} items
      </div>
    </div>
    
    <div 
      class="table-wrapper" 
      ref="containerRef" 
      @scroll="handleScroll"
      :style="{ height: `${containerHeight}px` }"
    >
      <div :style="{ height: `${totalHeight}px`, position: 'relative' }">
        <table class="data-table" :style="{ transform: `translateY(${offsetY}px)` }">
          <thead class="table-head">
            <tr>
              <th v-for="column in columns" :key="column.key" class="table-header-cell">
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody class="table-body">
            <tr
              v-for="(item, index) in visibleItems"
              :key="getItemKey(item, startIndex + index)"
              class="table-row"
            >
              <td v-for="column in columns" :key="column.key" class="table-cell">
                {{ formatCellValue(item[column.key], column) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useVirtualization } from '../../composables/useVirtualization';
import { throttle } from '../../utils/performanceUtils';

interface Column {
  key: string;
  label: string;
  formatter?: (value: any) => string;
}

const props = withDefaults(defineProps<{
  data: Record<string, any>[];
  columns: Column[];
  itemHeight?: number;
  containerHeight?: number;
}>(), {
  itemHeight: 40,
  containerHeight: 500,
});

const {
  containerRef,
  scrollTop,
  startIndex,
  endIndex,
  visibleItems,
  offsetY,
  totalHeight,
  handleScroll: baseHandleScroll,
} = useVirtualization(props.data, {
  itemHeight: props.itemHeight,
  containerHeight: props.containerHeight,
  overscan: 3,
  buffer: 5,
});

// Throttle scroll handler for performance
const handleScroll = throttle((event: Event) => {
  baseHandleScroll(event);
}, 16); // ~60fps

const formatCellValue = (value: any, column: Column): string => {
  if (column.formatter) {
    return column.formatter(value);
  }
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  if (value instanceof Date) {
    return value.toLocaleString();
  }
  return String(value ?? '');
};

const getItemKey = (item: Record<string, any>, index: number): string | number => {
  return item.id ?? item.key ?? index;
};
</script>

<style scoped>
.data-table-container {
  background: var(--dark-surface);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.table-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.table-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.table-wrapper {
  max-height: 500px;
  overflow-y: auto;
  border-radius: 8px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.table-head {
  position: sticky;
  top: 0;
  background: var(--dark-surface);
  z-index: 10;
}

.table-header-cell {
  padding: 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid var(--border-color);
}

.table-row {
  transition: background-color 0.2s;
  border-bottom: 1px solid var(--border-color);
}

.table-row:hover {
  background: var(--dark-surface-hover);
}

.table-cell {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: var(--text-primary);
}

/* Scrollbar styling */
.table-wrapper::-webkit-scrollbar {
  width: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: var(--dark-bg);
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: var(--dark-surface-hover);
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: var(--accent);
}
</style>



