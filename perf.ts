import { ref, onMounted, onBeforeUnmount } from 'vue';

export function usePerformanceMonitor() {
    const fps = ref(0);
    const frameCount = ref(0);
    const lastTime = ref(performance.now());

    const updateFPS = () => {
        const now = performance.now();
        frameCount.value++;
        const delta = now - lastTime.value;

        if (delta >= 1000) {
            fps.value = frameCount.value;
            frameCount.value = 0;
            lastTime.value = now;
        }
    };

    const startMonitoring = () => {
        const loop = () => {
            updateFPS();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    };

    onMounted(() => {
        startMonitoring();
    });

    onBeforeUnmount(() => {
        frameCount.value = 0;
        lastTime.value = performance.now();
    });

    return {
        fps,
    };
}