import {Filter} from './applyFilter';

export function createSaturationFilter(value: number): Filter {
  if(value === 0) return (a) => a;
  value = (100 + value) / 100;

  return ({r, g, b, a}) => {
    const gray = 0.2989*r + 0.5870*g + 0.1140*b;

    return {
      r: r * value + gray * (1 - value),
      g: g * value + gray * (1 - value),
      b: b * value + gray * (1 - value),
      a
    }
  }
}
