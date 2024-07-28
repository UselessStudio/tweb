import {Filter} from './applyFilter';
import {hsvToRgb, rgbToHsv} from '../../../helpers/color';

export function createEnhanceFilter(value: number): Filter {
  if(value === 0) return (a) => a;

  value = value / 100;

  return ({r, g, b, a}) => {
    let [h, s, v] = rgbToHsv(r, g, b);
    // s = s * (1-value) + Math.min(s, s*1.2) * value;
    v *= 1 + value * (1 - v);
    const [r_, g_, b_] = hsvToRgb(h, s, v);
    return {
      r: r_,
      g: g_,
      b: b_,
      a
    }
  }
}
