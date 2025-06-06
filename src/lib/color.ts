import { Color } from 'color';

export function createColor(color: string): Color {
  return new Color(color);
}

export function toOklch(color: Color): [number, number, number] {
  const [l, c, h] = color.oklch();
  return [l, c, h];
}

export function fromOklch(l: number, c: number, h: number): Color {
  return new Color({ l, c, h, mode: 'oklch' });
}

export function toString(color: Color): string {
  return color.hex();
} 