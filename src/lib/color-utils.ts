import Color from 'colorjs.io';

export interface ColorScale {
  colors: Color[];
  baseColor: Color;
}

// Tailwind color scale values
const TAILWIND_SCALE = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

// Convert Tailwind scale to lightness values (0-1)
const getLightnessFromScale = (scale: number): number => {
  // Invert the scale so 50 is lightest (highest lightness) and 950 is darkest (lowest lightness)
  const invertedScale = 1000 - scale;
  // Convert to 0-1 range
  return invertedScale / 1000;
};

export const createColorScale = (baseColor: string, steps: number = 11): ColorScale => {
  const color = new Color(baseColor);
  const colors: Color[] = [];
  
  // Convert to OKLCH if not already
  const oklch = color.to('oklch');
  
  // Create steps using Tailwind scale
  for (let i = 0; i < steps; i++) {
    const scale = TAILWIND_SCALE[i];
    const lightness = getLightnessFromScale(scale);
    const newColor = new Color('oklch', [
      lightness, // L: 0-1
      oklch.coords[1], // C: chroma
      oklch.coords[2], // H: hue
    ]);
    colors.push(newColor);
  }
  
  return {
    colors,
    baseColor: color,
  };
};

export const adjustHue = (
  colors: Color[],
  index: number,
  hueShift: number,
  influence: number = 0.9
): Color[] => {
  return colors.map((color, i) => {
    const distance = Math.abs(i - index);
    const influenceFactor = Math.pow(influence, distance);
    const adjustedHue = (color.to('oklch').coords[2] + hueShift * influenceFactor) % 360;
    
    const oklch = color.to('oklch');
    return new Color('oklch', [
      oklch.coords[0],
      oklch.coords[1],
      adjustedHue,
    ]);
  });
};

export const colorToHex = (color: Color): string => {
  return color.to('srgb').toString({ format: 'hex' });
};

export const isValidColor = (color: string): boolean => {
  try {
    new Color(color);
    return true;
  } catch {
    return false;
  }
}; 