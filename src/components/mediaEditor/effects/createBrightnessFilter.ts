import {Filter} from './applyFilter';

export function createBrightnessFilter(brightness: number): Filter {
  brightness = (brightness / 100) * 255;

  if(brightness === 0) return (a) => a;

  return ({r, g, b, a}) => {
    return {
      r: r + brightness,
      g: g + brightness,
      b: b + brightness,
      a
    }
  }
}
