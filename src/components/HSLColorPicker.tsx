"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import Color from 'colorjs.io';

interface HSLColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function HSLColorPicker({ value, onChange }: HSLColorPickerProps) {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);

  useEffect(() => {
    try {
      const color = new Color(value);
      const hsl = color.to('hsl');
      setHue(hsl.coords[0]);
      setSaturation(hsl.coords[1]);
      setLightness(hsl.coords[2]);
    } catch (e) {
      // Invalid color, keep current values
    }
  }, [value]);

  const handleHueChange = (value: number) => {
    setHue(value);
    updateColor(value, saturation, lightness);
  };

  const handleSaturationChange = (value: number) => {
    setSaturation(value);
    updateColor(hue, value, lightness);
  };

  const handleLightnessChange = (value: number) => {
    setLightness(value);
    updateColor(hue, saturation, value);
  };

  const updateColor = (h: number, s: number, l: number) => {
    const color = new Color('hsl', [h, s, l]);
    onChange(color.to('srgb').toString({ format: 'hex' }));
  };

  return (
    <Card className="p-4 w-64">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Hue</label>
          <div className="relative h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 via-magenta-500 to-red-500 rounded-full">
            <Slider
              value={[hue]}
              min={0}
              max={360}
              step={1}
              onValueChange={([value]) => handleHueChange(value)}
              className="absolute inset-0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Saturation</label>
          <div className="relative h-2 bg-gradient-to-r from-gray-300 to-[hsl(var(--hue),100%,50%)] rounded-full">
            <Slider
              value={[saturation]}
              min={0}
              max={100}
              step={1}
              onValueChange={([value]) => handleSaturationChange(value)}
              className="absolute inset-0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Lightness</label>
          <div className="relative h-2 bg-gradient-to-r from-black via-[hsl(var(--hue),100%,50%)] to-white rounded-full">
            <Slider
              value={[lightness]}
              min={0}
              max={100}
              step={1}
              onValueChange={([value]) => handleLightnessChange(value)}
              className="absolute inset-0"
            />
          </div>
        </div>
      </div>
    </Card>
  );
} 