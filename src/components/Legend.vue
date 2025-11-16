<template>
  <div class="legend">
    <h3>Legend</h3>
    <ul>
      <li v-for="(item, index) in legendItems" :key="index">
        <span :style="{ backgroundColor: item.color }" class="legend-color-box"></span>
        {{ item.label }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

interface LegendItem {
  label: string;
  color: string;
}

export default defineComponent({
  name: 'Legend',
  props: {
    legendItems: {
      type: Array as PropType<LegendItem[]>,
      required: true,
    },
  },
});
</script>

<style scoped>
.legend {
  padding: 10px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.legend-color-box {
  display: inline-block;
  width: 15px;
  height: 15px;
  margin-right: 5px;
  border-radius: 3px;
}
</style>