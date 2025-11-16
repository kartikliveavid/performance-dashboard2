/**
 * Canvas utility functions for high-performance rendering
 */

export interface CanvasConfig {
  width: number;
  height: number;
  dpr?: number;
  alpha?: boolean;
  desynchronized?: boolean;
}

/**
 * Get optimized canvas context with performance settings
 */
export function getOptimizedContext(
  canvas: HTMLCanvasElement,
  config: CanvasConfig
): CanvasRenderingContext2D | null {
  const ctx = canvas.getContext('2d', {
    alpha: config.alpha ?? false,
    desynchronized: config.desynchronized ?? true,
    willReadFrequently: false,
  });

  if (!ctx) return null;

  // Set device pixel ratio for crisp rendering
  const dpr = config.dpr ?? window.devicePixelRatio ?? 1;
  canvas.width = config.width * dpr;
  canvas.height = config.height * dpr;
  canvas.style.width = `${config.width}px`;
  canvas.style.height = `${config.height}px`;
  ctx.scale(dpr, dpr);

  // Optimize context settings
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  return ctx;
}

/**
 * Create offscreen canvas for static elements
 */
export function createOffscreenCanvas(
  width: number,
  height: number
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D | null } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  return { canvas, ctx };
}

/**
 * Efficiently clear canvas
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);
}

/**
 * Draw grid lines efficiently
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  padding: number,
  rows: number = 5,
  cols: number = 5,
  color: string = 'rgba(148, 163, 184, 0.1)'
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  // Draw horizontal lines
  const chartHeight = height - 2 * padding;
  for (let i = 0; i <= rows; i++) {
    const y = padding + (chartHeight / rows) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  // Draw vertical lines
  const chartWidth = width - 2 * padding;
  for (let i = 0; i <= cols; i++) {
    const x = padding + (chartWidth / cols) * i;
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, height - padding);
    ctx.stroke();
  }
}

/**
 * Calculate min/max values efficiently
 */
export function calculateBounds<T>(
  data: T[],
  getValue: (item: T) => number
): { min: number; max: number } {
  if (data.length === 0) return { min: 0, max: 100 };

  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < data.length; i++) {
    const value = getValue(data[i]);
    if (value < min) min = value;
    if (value > max) max = value;
  }

  const padding = (max - min) * 0.1 || 10;
  return { min: min - padding, max: max + padding };
}

/**
 * Frame rate limiter for consistent FPS
 */
export class FrameRateLimiter {
  private lastFrameTime = 0;
  private targetFrameTime: number;

  constructor(targetFPS: number = 60) {
    this.targetFrameTime = 1000 / targetFPS;
  }

  shouldRender(): boolean {
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;

    if (deltaTime >= this.targetFrameTime) {
      this.lastFrameTime = now;
      return true;
    }
    return false;
  }

  reset(): void {
    this.lastFrameTime = performance.now();
  }
}

/**
 * Batch canvas operations for better performance
 */
export class CanvasBatch {
  private operations: Array<() => void> = [];

  add(operation: () => void): void {
    this.operations.push(operation);
  }

  execute(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const op of this.operations) {
      op();
    }
    ctx.restore();
    this.operations = [];
  }
}

/**
 * Efficient path builder for line charts
 */
export class PathBuilder {
  private path: string = '';
  private firstPoint = true;

  moveTo(x: number, y: number): void {
    this.path += `M${x},${y}`;
    this.firstPoint = false;
  }

  lineTo(x: number, y: number): void {
    if (this.firstPoint) {
      this.moveTo(x, y);
      return;
    }
    this.path += `L${x},${y}`;
  }

  build(): string {
    return this.path;
  }

  reset(): void {
    this.path = '';
    this.firstPoint = true;
  }
}




