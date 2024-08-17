function interpolateColor(color1: number[], color2: number[], factor: number): number[] {
  const result = color1.slice();
  for (let i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (color2[i] - result[i]));
  }
  return result;
}

export function hexToRgb(hex: string): RGB {
  const bigint = parseInt(hex.slice(1), 16);
  return [bigint >> 16 & 255, bigint >> 8 & 255, bigint & 255];
}

export function rgbToHex(rgb: number[]): string {
  return `#${((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1).toUpperCase()}`;
}

type RGB = [number, number, number];

type GradientStop = {
  from: number;
  color: RGB;
}

type Gradient = GradientStop[];

export function getColorFromGradient(percentage: number, gradient: Gradient): string {
  let i = 1;
  while (i < gradient.length && percentage > gradient[i].from) {
    i++;
  }
  const lower = gradient[i - 1];
  const upper = gradient[i];
  if (!upper) return rgbToHex(gradient[gradient.length - 1].color);
  const factor = (percentage - lower.from) / (upper.from - lower.from);
  return rgbToHex(interpolateColor(lower.color, upper.color, factor));
}
