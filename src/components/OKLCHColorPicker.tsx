"use client";

import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import Color from 'colorjs.io';

interface OKLCHColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function OKLCHColorPicker({ value, onChange }: OKLCHColorPickerProps) {
  const [l, setL] = useState(0.5);
  const [c, setC] = useState(0.2);
  const [h, setH] = useState(0);

  useEffect(() => {
    try {
      const color = new Color(value);
      const oklch = color.to('oklch');
      setL(oklch.coords[0]);
      setC(oklch.coords[1]);
      setH(oklch.coords[2]);
    } catch (e) {
      // Invalid color, keep current values
    }
  }, [value]);

  const updateColor = (newL: number, newC: number, newH: number) => {
    try {
      const color = new Color('oklch', [newL, newC, newH]);
      onChange(colorToHex(color));
    } catch (e) {
      // Invalid color combination, ignore
    }
  };

  // Generate hue gradient stops
  const hueStops = Array.from({ length: 37 }, (_, i) => {
    const hue = i * 10;
    const color = new Color('oklch', [l, c, hue]);
    return `${colorToHex(color)} ${(hue / 360) * 100}%`;
  }).join(', ');

  // Generate chroma gradient stops
  const chromaStops = Array.from({ length: 41 }, (_, i) => {
    const chroma = i * 0.1;
    const color = new Color('oklch', [l, chroma, h]);
    return `${colorToHex(color)} ${(chroma / 0.4) * 100}%`;
  }).join(', ');

  // Generate lightness gradient stops
  const lightnessStops = Array.from({ length: 11 }, (_, i) => {
    const lightness = i * 0.1;
    const color = new Color('oklch', [lightness, c, h]);
    return `${colorToHex(color)} ${lightness * 100}%`;
  }).join(', ');

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg w-[400px]">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-sm w-20">Lightness</span>
          <div className="flex-1 relative">
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(to right, ${lightnessStops})`,
                height: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
            <Slider
              value={[l * 100]}
              min={0}
              max={100}
              step={0.1}
              onValueChange={([value]) => {
                const newL = value / 100;
                setL(newL);
                updateColor(newL, c, h);
              }}
              className="relative z-10 [&>span]:bg-transparent [&>span]:border-2 [&>span]:border-white [&>span]:shadow-lg [&>div]:bg-transparent [&>div]:border-0"
            />
          </div>
          <span className="text-sm w-16 text-right font-mono">{l.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm w-20">Chroma</span>
          <div className="flex-1 relative">
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(to right, ${chromaStops})`,
                height: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
            <Slider
              value={[c * 100]}
              min={0}
              max={40}
              step={0.1}
              onValueChange={([value]) => {
                const newC = value / 100;
                setC(newC);
                updateColor(l, newC, h);
              }}
              className="relative z-10 [&>span]:bg-transparent [&>span]:border-2 [&>span]:border-white [&>span]:shadow-lg [&>div]:bg-transparent [&>div]:border-0"
            />
          </div>
          <span className="text-sm w-16 text-right font-mono">{c.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm w-20">Hue</span>
          <div className="flex-1 relative">
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(to right, ${hueStops})`,
                height: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
            <Slider
              value={[h]}
              min={0}
              max={360}
              step={0.1}
              onValueChange={([value]) => {
                setH(value);
                updateColor(l, c, value);
              }}
              className="relative z-10 [&>span]:bg-transparent [&>span]:border-2 [&>span]:border-white [&>span]:shadow-lg [&>div]:bg-transparent [&>div]:border-0"
            />
          </div>
          <span className="text-sm w-16 text-right font-mono">{h.toFixed(1)}°</span>
        </div>
      </div>
    </div>
  );
}

function colorToHex(color: Color): string {
  return color.toString({ format: 'hex' });
} 