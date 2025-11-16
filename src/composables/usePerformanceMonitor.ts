 // filepath: src/composables/usePerformanceMonitor.ts
 import { ref, onMounted, onBeforeUnmount } from "vue";

 export default function usePerformanceMonitor() {
   const fps = ref(0);
   const memory = ref(0);
   const render = ref(0);

   let frames = 0;
   let last = performance.now();
   let raf = 0;

   onMounted(() => {
     const loop = () => {
       frames++;
       const now = performance.now();
       if (now - last >= 1000) {
         fps.value = frames;
         frames = 0;
         last = now;
         if ((performance as any).memory) {
           memory.value = Math.round(((performance as any).memory.usedJSHeapSize || 0) / 1048576);
         }
       }
       raf = requestAnimationFrame(loop);
     };
     raf = requestAnimationFrame(loop);
   });

   onBeforeUnmount(() => {
     if (raf) cancelAnimationFrame(raf);
   });

   return { fps, memory, render };
 }
