/**
 * Performance monitoring and optimization utilities
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  renderTime: number;
  dataProcessingTime: number;
  timestamp: number;
}

export class PerformanceMonitor {
  private frameCount = 0;
  private lastFPSUpdate = performance.now();
  private frameTimes: number[] = [];
  private maxFrameTimeHistory = 60;
  private renderTimes: number[] = [];
  private dataProcessingTimes: number[] = [];

  private fps = 0;
  private frameTime = 0;
  private memoryUsage = 0;
  private renderTime = 0;
  private dataProcessingTime = 0;

  update(): void {
    const now = performance.now();
    this.frameCount++;

    // Update FPS every second
    if (now - this.lastFPSUpdate >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFPSUpdate = now;

      // Calculate average frame time
      if (this.frameTimes.length > 0) {
        this.frameTime =
          this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
        this.frameTimes = [];
      }

      // Calculate average render time
      if (this.renderTimes.length > 0) {
        this.renderTime =
          this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length;
        this.renderTimes = [];
      }

      // Calculate average data processing time
      if (this.dataProcessingTimes.length > 0) {
        this.dataProcessingTime =
          this.dataProcessingTimes.reduce((a, b) => a + b, 0) /
          this.dataProcessingTimes.length;
        this.dataProcessingTimes = [];
      }

      // Get memory usage if available
      if ((performance as any).memory) {
        this.memoryUsage = Math.round(
          ((performance as any).memory.usedJSHeapSize || 0) / 1048576
        );
      }
    }
  }

  recordFrameTime(time: number): void {
    this.frameTimes.push(time);
    if (this.frameTimes.length > this.maxFrameTimeHistory) {
      this.frameTimes.shift();
    }
  }

  recordRenderTime(time: number): void {
    this.renderTimes.push(time);
    if (this.renderTimes.length > this.maxFrameTimeHistory) {
      this.renderTimes.shift();
    }
  }

  recordDataProcessingTime(time: number): void {
    this.dataProcessingTimes.push(time);
    if (this.dataProcessingTimes.length > this.maxFrameTimeHistory) {
      this.dataProcessingTimes.shift();
    }
  }

  getMetrics(): PerformanceMetrics {
    return {
      fps: this.fps,
      frameTime: this.frameTime,
      memoryUsage: this.memoryUsage,
      renderTime: this.renderTime,
      dataProcessingTime: this.dataProcessingTime,
      timestamp: performance.now(),
    };
  }

  reset(): void {
    this.frameCount = 0;
    this.lastFPSUpdate = performance.now();
    this.frameTimes = [];
    this.renderTimes = [];
    this.dataProcessingTimes = [];
  }
}

/**
 * Measure execution time of a function
 */
export function measureTime<T>(fn: () => T): { result: T; time: number } {
  const start = performance.now();
  const result = fn();
  const time = performance.now() - start;
  return { result, time };
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Check if performance is acceptable
 */
export function isPerformanceAcceptable(metrics: PerformanceMetrics): boolean {
  return metrics.fps >= 55 && metrics.frameTime < 20;
}

/**
 * Get performance warning level
 */
export function getPerformanceWarning(
  metrics: PerformanceMetrics
): 'good' | 'warning' | 'critical' {
  if (metrics.fps >= 55 && metrics.frameTime < 16) {
    return 'good';
  } else if (metrics.fps >= 30 && metrics.frameTime < 33) {
    return 'warning';
  } else {
    return 'critical';
  }
}




