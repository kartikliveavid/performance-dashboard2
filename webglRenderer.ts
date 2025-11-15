import type { Ref } from "vue";

export class WebGLRenderer {
  private gl: WebGLRenderingContext | null = null;
  private animationFrameId: number | null = null;

  constructor(private canvas: HTMLCanvasElement | null) {
    if (!canvas) return;
    this.gl = canvas.getContext("webgl");
    if (!this.gl) return;
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
  }

  start() {
    if (!this.gl) return;
    const loop = () => {
      if (!this.gl) return;
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    if (this.animationFrameId != null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}

export function useWebGLRenderer(canvasRef: Ref<HTMLCanvasElement | null>) {
  let renderer: WebGLRenderer | null = null;
  return {
    start: () => {
      if (!canvasRef.value) return;
      if (!renderer) renderer = new WebGLRenderer(canvasRef.value);
      renderer.start();
    },
    stop: () => renderer?.stop()
  };
}
