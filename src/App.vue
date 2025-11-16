<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import './styles/main.css';
</script>

<style>
#app {
  min-height: 100vh;
  background: var(--dark-bg);
}
</style>
