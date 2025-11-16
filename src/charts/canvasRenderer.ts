import type { Ref } from "vue";

export function useCanvasRenderer(canvasRef: Ref<HTMLCanvasElement | null>, data: Ref<number[]>) {
  let ctx: CanvasRenderingContext2D | null = null;
  let raf: number | null = null;

  const render = () => {
    if (!canvasRef.value) return;
    if (!ctx) ctx = canvasRef.value.getContext("2d");
    if (!ctx) return;

    const w = canvasRef.value.width;
    const h = canvasRef.value.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "blue";

    const context = ctx; // non-null local alias for TS
    data.value.forEach((point: number, index: number) => {
      const x = index % w;
      const y = Math.min(h - 1, Math.max(0, Math.round(h - (point || 0))));
      context.fillRect(x, y, 2, 2);
    });

    raf = requestAnimationFrame(render);
  };

  return {
    start: () => { if (raf == null) render(); },
    stop: () => { if (raf != null) { cancelAnimationFrame(raf); raf = null; } }
  };
}
