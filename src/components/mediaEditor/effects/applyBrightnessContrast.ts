export function applyBrightnessContrast(ctx: CanvasRenderingContext2D, brightness: number, contrast: number) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const data = ctx.getImageData(0, 0, w, h);
  const pixels = data.data;
  contrast = (100 + contrast) / 100;
  brightness = (brightness / 100) * 255;

  for(let i = 0; i < pixels.length; i += 4) {
    for(let j = 0; j < 3; j++) {
      pixels[i + j] = pixels[i+j] * contrast + brightness;
    }
  }

  ctx.putImageData(data, 0, 0);
}
