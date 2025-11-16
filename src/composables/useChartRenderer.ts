import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue';
import { FrameRateLimiter } from '../utils/canvasUtils';
import { PerformanceMonitor } from '../utils/performanceUtils';

export interface ChartRendererOptions {
  targetFPS?: number;
  enablePerformanceMonitoring?: boolean;
}

export function useChartRenderer(
  canvasRef: Ref<HTMLCanvasElement | null>,
  options: ChartRendererOptions = {}
) {
  const {
    targetFPS = 60,
    enablePerformanceMonitoring = false,
  } = options;

  const isRendering = ref(false);
  let animationFrameId: number | null = null;
  const frameLimiter = new FrameRateLimiter(targetFPS);
  const performanceMonitor = enablePerformanceMonitoring
    ? new PerformanceMonitor()
    : null;

  let renderCallback: (() => void) | null = null;

  const render = () => {
    if (!canvasRef.value || !renderCallback) {
      animationFrameId = requestAnimationFrame(render);
      return;
    }

    if (!frameLimiter.shouldRender()) {
      animationFrameId = requestAnimationFrame(render);
      return;
    }

    const startTime = performance.now();

    try {
      renderCallback();
    } catch (error) {
      console.error('Render error:', error);
    }

    if (performanceMonitor) {
      const renderTime = performance.now() - startTime;
      performanceMonitor.recordRenderTime(renderTime);
      performanceMonitor.update();
    }

    animationFrameId = requestAnimationFrame(render);
  };

  const start = (callback: () => void) => {
    if (isRendering.value) return;
    renderCallback = callback;
    isRendering.value = true;
    frameLimiter.reset();
    render();
  };

  const stop = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    isRendering.value = false;
    renderCallback = null;
  };

  onBeforeUnmount(() => {
    stop();
  });

  return {
    start,
    stop,
    isRendering,
    getMetrics: () => performanceMonitor?.getMetrics() || null,
  };
}





