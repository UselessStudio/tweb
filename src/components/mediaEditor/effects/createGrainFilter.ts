import {Filter} from './applyFilter';

export function createGrainFilter(value: number): Filter {
  if(value === 0) return (a) => a;

  value /= 100;

  return ({r, g, b, a}) => {
    const rand = (Math.random() - 0.5) * 128;
    return {
      r: r + (rand * value),
      g: g + (rand * value),
      b: b + (rand * value),
      a
    }
  }
}
