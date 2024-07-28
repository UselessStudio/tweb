export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export type Filter = (i: RGBA) => RGBA;

export function applyFilters(ctx: CanvasRenderingContext2D, filters: Filter[]) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const data = ctx.getImageData(0, 0, w, h);
  const pixels = data.data;

  for(let i = 0; i < pixels.length; i += 4) {
    let pixel = {r: pixels[i], g: pixels[i + 1], b: pixels[i + 2], a: pixels[i + 3]};
    for(const filter of filters) {
      pixel = filter(pixel);
    }
    pixels[i] = pixel.r;
    pixels[i + 1] = pixel.g;
    pixels[i + 2] = pixel.b;
    pixels[i + 3] = pixel.a;
  }

  ctx.putImageData(data, 0, 0);
}
