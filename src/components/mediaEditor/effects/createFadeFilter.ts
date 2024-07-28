import {Filter} from './applyFilter';

export function createFadeFilter(value: number): Filter {
  if(value === 0) return (a) => a;

  value /= 100;

  return ({r, g, b, a}) => {
    r /= 255;
    g /= 255;
    b /= 255;
    return {
      r: ((r * (1.0 - value)) + ((r + (-0.9772 * r*r*r + 1.708 * r*r + -0.1603 * r + 0.2878 - r * 0.9)) * value))*255,
      g: ((g * (1.0 - value)) + ((g + (-0.9772 * g*g*g + 1.708 * g*g + -0.1603 * g + 0.2878 - g * 0.9)) * value))*255,
      b: ((b * (1.0 - value)) + ((b + (-0.9772 * b*b*b + 1.708 * b*b + -0.1603 * b + 0.2878 - b * 0.9)) * value))*255,
      a
    }
  }
}
