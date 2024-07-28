export function applySharpness(ctx: CanvasRenderingContext2D, value: number) {
  if(value === 0) return;
  const w = ctx.canvas.width, h = ctx.canvas.height;
  value = value / 100;
  let x, sx, sy, r, g, b, a, dstOff, srcOff, wt, cx, cy, scy, scx;
  const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
  const katet = Math.round(Math.sqrt(weights.length));
  const half = (katet * 0.5) | 0;
  const dstData = ctx.createImageData(w, h);
  const dstBuff = dstData.data;
  const srcBuff = ctx.getImageData(0, 0, w, h).data;
  let y = h;

  while(y--) {
    x = w;
    while(x--) {
      sy = y;
      sx = x;
      dstOff = (y * w + x) * 4;
      r = 0;
      g = 0;
      b = 0;
      a = 0;

      for(cy = 0; cy < katet; cy++) {
        for(cx = 0; cx < katet; cx++) {
          scy = sy + cy - half;
          scx = sx + cx - half;

          if(scy >= 0 && scy < h && scx >= 0 && scx < w) {
            srcOff = (scy * w + scx) * 4;
            wt = weights[cy * katet + cx];

            r += srcBuff[srcOff] * wt;
            g += srcBuff[srcOff + 1] * wt;
            b += srcBuff[srcOff + 2] * wt;
            a += srcBuff[srcOff + 3] * wt;
          }
        }
      }

      dstBuff[dstOff] = r * value + srcBuff[dstOff] * (1 - value);
      dstBuff[dstOff + 1] = g * value + srcBuff[dstOff + 1] * (1 - value);
      dstBuff[dstOff + 2] = b * value + srcBuff[dstOff + 2] * (1 - value);
      dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
    }
  }

  ctx.putImageData(dstData, 0, 0);
}
