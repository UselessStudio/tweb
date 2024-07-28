export function applyVignette(ctx: CanvasRenderingContext2D, value: number) {
  if(value === 0) return;
  const w = ctx.canvas.width, h = ctx.canvas.height;
  ctx.rect(0, 0, w, h);
  value /= 100;

  // create radial gradient
  const outerRadius = w * .5;
  const innerRadius = w * .2;
  const grd = ctx.createRadialGradient(w / 2, h / 2, innerRadius, w / 2, h / 2, outerRadius);
  // light blue
  grd.addColorStop(0, 'rgba(0,0,0,0)');
  // dark blue
  grd.addColorStop(1, 'rgba(0,0,0,' + value + ')');

  ctx.fillStyle = grd;
  ctx.fill();
}
