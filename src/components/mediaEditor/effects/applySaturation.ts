import {hsvToRgb, rgbToHsv} from '../../../helpers/color';

export function applySaturation(ctx: CanvasRenderingContext2D, value: number) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const data = ctx.getImageData(0, 0, w, h);
  const pixels = data.data;
  value = (100 + value) / 100;

  for(let i = 0; i < pixels.length; i += 4) {
    let [h, s, v] = rgbToHsv(pixels[i], pixels[i + 1], pixels[i + 2]);
    s *= value;
    const [r, g, b] = hsvToRgb(h, s, v);
    pixels[i] = r;
    pixels[i + 1] = g;
    pixels[i + 2] = b;
  }

  ctx.putImageData(data, 0, 0);
}
