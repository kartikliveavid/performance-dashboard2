<template>
  <div style="display: flex; gap: 12px; padding: 8px; margin-bottom: 24px;">
    <div><strong>FPS:</strong> {{ fps }}</div>
    <div><strong>Memory:</strong> {{ memory }} MB</div>
    <div><strong>Render:</strong> {{ render }} ms</div>
  </div>
</template>

<script setup lang="ts">
import usePerformanceMonitor from "../../composables/usePerformanceMonitor";

const { fps, memory, render } = usePerformanceMonitor();
</script>
