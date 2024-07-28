import {hsvToRgb, rgbToHsv} from '../../../helpers/color';
import {Filter} from './applyFilter';

function colorTemperatureToRgb(temp: number) {
  const m = window.Math;
  temp /= 100;
  let r, g, b;

  if(temp <= 66) {
    r = 255;
    g = m.min(m.max(99.4708025861 * m.log(temp) - 161.1195681661, 0), 255);
  } else {
    r = m.min(m.max(329.698727446 * m.pow(temp - 60, -0.1332047592), 0), 255);
    g = m.min(m.max(288.1221695283 * m.pow(temp - 60, -0.0755148492), 0), 255);
  }

  if(temp >= 66) {
    b = 255;
  } else if(temp <= 19) {
    b = 0;
  } else {
    b = temp - 10;
    b = m.min(m.max(138.5177312231 * m.log(b) - 305.0447927307, 0), 255);
  }

  return {
    r: r,
    g: g,
    b: b
  }
}

export function createWarmthFilter(value: number): Filter {
  if(value === 0) return (a) => a;
  value = 6600 + (value / 200) * 5000;
  const tint = colorTemperatureToRgb(value);

  return ({r, g, b, a}) => {
    return {
      r: r * (255 / tint.r),
      g: g * (255 / tint.g),
      b: b * (255 / tint.b),
      a
    }
  }
}
