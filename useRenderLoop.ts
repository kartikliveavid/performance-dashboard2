import { ref, onMounted, onBeforeUnmount } from 'vue';

export function useRenderLoop(callback: () => void) {
    const isRunning = ref(false);
    let animationFrameId: number;

    const render = () => {
        callback();
        animationFrameId = requestAnimationFrame(render);
    };

    const start = () => {
        if (!isRunning.value) {
            isRunning.value = true;
            render();
        }
    };

    const stop = () => {
        if (isRunning.value) {
            isRunning.value = false;
            cancelAnimationFrame(animationFrameId);
        }
    };

    onMounted(start);
    onBeforeUnmount(stop);

    return { start, stop };
}