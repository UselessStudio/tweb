import {Filter} from './applyFilter';

export function createContrastFilter(contrast: number): Filter {
  contrast = (100 + contrast) / 100;
  const intercept = 128 * (1 - contrast);

  if(contrast === 1) return (a) => a;

  return ({r, g, b, a}) => {
    return {
      r: r * contrast + intercept,
      g: g * contrast + intercept,
      b: b * contrast + intercept,
      a
    }
  }
}
