import {Filter} from './applyFilter';

export function createShadowsHighlightsFilter(shadows: number, highlights: number): Filter {
  if(shadows === 0 && highlights === 0) return (a) => a;

  shadows = shadows / 100;
  highlights = highlights / 100;

  const lumR = 0.299;
  const lumG = 0.587;
  const lumB = 0.114;

  return ({r, g, b, a}) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const luminance = Math.sqrt( lumR*r*r + lumG*g*g + lumB*b*b);
    const h = highlights * 0.05 * (Math.pow(8, luminance) - 1);
    const s = shadows * 0.05 * (Math.pow(8, 1 - luminance) - 1);
    return {
      r: (r + h + s) * 255,
      b: (b + h + s) * 255,
      g: (g + h + s) * 255,
      a
    }
  }
}
