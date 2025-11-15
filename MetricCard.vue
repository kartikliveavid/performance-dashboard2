<template>
  <div class="metric-card">
    <h3 class="metric-title">{{ title }}</h3>
    <p class="metric-value">{{ value }}</p>
    <p class="metric-description">{{ description }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'MetricCard',
  props: {
    title: {
      type: String as PropType<string>,
      required: true
    },
    value: {
      type: [String, Number] as PropType<string | number>,
      required: true
    },
    description: {
      type: String as PropType<string>,
      required: false,
      default: ''
    }
  }
});
</script>

<style scoped>
.metric-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.metric-title {
  font-size: 1.2em;
  margin: 0 0 8px;
}

.metric-value {
  font-size: 2em;
  font-weight: bold;
  margin: 0 0 4px;
}

.metric-description {
  font-size: 0.9em;
  color: #666;
}
</style>