"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HexColorPicker } from 'react-colorful';
import Color from 'colorjs.io';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const TAILWIND_SCALE = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

interface HistoryState {
  colors: string[];
  hueValues: number[];
  lightnessValues: number[];
  chromaValues: number[];
}

export function ColorScale() {
  const [inputColor, setInputColor] = useState('#3b82f6');
  const [colorScale, setColorScale] = useState<{ colors: string[]; labels: number[] }>({
    colors: [],
    labels: TAILWIND_SCALE,
  });
  const [hueValues, setHueValues] = useState<number[]>(Array(TAILWIND_SCALE.length).fill(0));
  const [lightnessValues, setLightnessValues] = useState<number[]>(Array(TAILWIND_SCALE.length).fill(0));
  const [chromaValues, setChromaValues] = useState<number[]>(Array(TAILWIND_SCALE.length).fill(0));
  const [currentColors, setCurrentColors] = useState<string[]>([]);
  
  // Input color OKLCH values
  const [inputOklch, setInputOklch] = useState({ l: 0.5, c: 0.1, h: 0 });
  
  // History management
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const pendingUpdateRef = useRef<HistoryState | null>(null);

  const pushToHistory = useCallback((state: HistoryState) => {
    // Clear any pending updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    if (pendingUpdateRef.current) {
      pendingUpdateRef.current = state;
      return;
    }

    // Set pending update
    pendingUpdateRef.current = state;

    // Schedule the actual history update
    updateTimeoutRef.current = setTimeout(() => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(pendingUpdateRef.current!);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      pendingUpdateRef.current = null;
    }, 500); // Wait 500ms before committing to history
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      setCurrentColors(state.colors);
      setHueValues(state.hueValues);
      setLightnessValues(state.lightnessValues);
      setChromaValues(state.chromaValues);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      setCurrentColors(state.colors);
      setHueValues(state.hueValues);
      setLightnessValues(state.lightnessValues);
      setChromaValues(state.chromaValues);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  const updateColors = useCallback(() => {
    try {
      const newColors = colorScale.colors.map((color, index) => {
        const baseColor = new Color(color);
        const oklch = baseColor.to('oklch');
        
        const newLightness = Math.max(0, Math.min(1, oklch.coords[0] + lightnessValues[index] / 100));
        const newChroma = Math.max(0, Math.min(0.4, oklch.coords[1] + chromaValues[index] / 100));
        const newHue = (oklch.coords[2] + hueValues[index]) % 360;
        
        const newColor = new Color('oklch', [newLightness, newChroma, newHue]);
        return newColor.toString({ format: 'hex' });
      });

      setCurrentColors(newColors);
      
      // Add to history
      pushToHistory({
        colors: newColors,
        hueValues: [...hueValues],
        lightnessValues: [...lightnessValues],
        chromaValues: [...chromaValues],
      });
    } catch (e) {
      console.error('Error updating colors:', e);
    }
  }, [colorScale.colors, hueValues, lightnessValues, chromaValues, pushToHistory]);

  const resetSliders = useCallback((type: 'hue' | 'lightness' | 'chroma') => {
    const zeroArray = Array(TAILWIND_SCALE.length).fill(0);
    if (type === 'hue') {
      setHueValues(zeroArray);
    } else if (type === 'lightness') {
      setLightnessValues(zeroArray);
    } else {
      setChromaValues(zeroArray);
    }
    updateColors();
  }, [updateColors]);

  useEffect(() => {
    try {
      const color = new Color(inputColor);
      const oklch = color.to('oklch');
      
      // Generate colors based on the base color
      const colors = TAILWIND_SCALE.map((label) => {
        const lightness = oklch.coords[0];
        const chroma = oklch.coords[1];
        const hue = oklch.coords[2];
        
        // Calculate new lightness based on the scale
        let newLightness = lightness;
        if (label < 500) {
          // Lighter colors (50 to 400)
          const factor = (500 - label) / 450; // 450 is the range from 50 to 500
          newLightness = lightness + (0.95 - lightness) * factor;
        } else if (label > 500) {
          // Darker colors (600 to 950)
          const factor = (label - 500) / 450; // 450 is the range from 500 to 950
          newLightness = lightness * (1 - factor * 0.8); // 0.8 to keep some lightness at 950
        }
        
        const newColor = new Color('oklch', [newLightness, chroma, hue]);
        return newColor.toString({ format: 'hex' });
      });

      setColorScale({ colors, labels: TAILWIND_SCALE });
      setCurrentColors(colors);
      
      // Reset history when input color changes
      setHistory([{
        colors,
        hueValues: Array(TAILWIND_SCALE.length).fill(0),
        lightnessValues: Array(TAILWIND_SCALE.length).fill(0),
        chromaValues: Array(TAILWIND_SCALE.length).fill(0),
      }]);
      setHistoryIndex(0);
    } catch (e) {
      console.error('Invalid color:', e);
    }
  }, [inputColor]);

  // Update input OKLCH values when input color changes
  useEffect(() => {
    try {
      const color = new Color(inputColor);
      const oklch = color.to('oklch');
      setInputOklch({
        l: oklch.coords[0],
        c: oklch.coords[1],
        h: oklch.coords[2]
      });
    } catch (e) {
      console.error('Error converting color:', e);
    }
  }, [inputColor]);

  // Update input color when OKLCH values change
  const updateInputFromOklch = useCallback((l: number, c: number, h: number) => {
    try {
      const color = new Color('oklch', [l, c, h]);
      setInputColor(color.toString({ format: 'hex' }));
    } catch (e) {
      console.error('Error converting OKLCH:', e);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputColor(e.target.value);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.startsWith('#')) {
      setInputColor(pastedText);
    }
  };

  const resetAllSliders = () => {
    const zeroArray = Array(TAILWIND_SCALE.length).fill(0);
    setHueValues(zeroArray);
    setLightnessValues(zeroArray);
    setChromaValues(zeroArray);
    setCurrentColors(colorScale.colors);
    
    // Add to history
    pushToHistory({
      colors: colorScale.colors,
      hueValues: zeroArray,
      lightnessValues: zeroArray,
      chromaValues: zeroArray,
    });
  };

  const handleSliderChange = (
    index: number,
    value: number,
    type: 'hue' | 'lightness' | 'chroma'
  ) => {
    const change = value - (type === 'hue' ? hueValues[index] : type === 'lightness' ? lightnessValues[index] : chromaValues[index]);
    
    // Create new values array
    const newValues = type === 'hue' ? [...hueValues] : type === 'lightness' ? [...lightnessValues] : [...chromaValues];
    
    // Update the main slider
    newValues[index] = value;
    
    // Equalizer-like effect: affect neighboring sliders with decreasing influence
    const factors = [0.8, 0.6, 0.4, 0.2]; // Stronger influence on immediate neighbors
    
    factors.forEach((factor, i) => {
      // Update left neighbors
      const leftIndex = index - (i + 1);
      if (leftIndex >= 0) {
        const leftChange = change * factor;
        if (type === 'hue') {
          newValues[leftIndex] = Math.max(-30, Math.min(30, newValues[leftIndex] + leftChange));
        } else {
          newValues[leftIndex] = Math.max(-20, Math.min(20, newValues[leftIndex] + leftChange));
        }
      }
      
      // Update right neighbors
      const rightIndex = index + (i + 1);
      if (rightIndex < newValues.length) {
        const rightChange = change * factor;
        if (type === 'hue') {
          newValues[rightIndex] = Math.max(-30, Math.min(30, newValues[rightIndex] + rightChange));
        } else {
          newValues[rightIndex] = Math.max(-20, Math.min(20, newValues[rightIndex] + rightChange));
        }
      }
    });

    // Update the appropriate state
    if (type === 'hue') {
      setHueValues(newValues);
    } else if (type === 'lightness') {
      setLightnessValues(newValues);
    } else {
      setChromaValues(newValues);
    }
    
    // Update colors after state changes
    setTimeout(updateColors, 0);
  };

  return (
    <div className="max-w-[1000px] mx-auto p-4 space-y-4 font-['Barlow_Condensed']">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <div 
                className="w-8 h-8 rounded border cursor-pointer"
                style={{ backgroundColor: inputColor }}
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3">
              <HexColorPicker color={inputColor} onChange={setInputColor} />
            </PopoverContent>
          </Popover>
          <Input
            value={inputColor}
            onChange={handleInputChange}
            onPaste={handlePaste}
            className="font-mono w-24"
            placeholder="#000000"
          />
          <span className="text-sm font-mono">{inputColor}</span>
        </div>

        <div className="flex-1 flex gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">L</span>
              <span className="text-xs font-mono">{(inputOklch.l * 100).toFixed(1)}%</span>
            </div>
            <Slider
              value={[inputOklch.l * 100]}
              onValueChange={([value]) => updateInputFromOklch(value / 100, inputOklch.c, inputOklch.h)}
              min={0}
              max={100}
              step={1}
              className="h-2"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">C</span>
              <span className="text-xs font-mono">{(inputOklch.c * 100).toFixed(1)}%</span>
            </div>
            <Slider
              value={[inputOklch.c * 100]}
              onValueChange={([value]) => updateInputFromOklch(inputOklch.l, value / 100, inputOklch.h)}
              min={0}
              max={40}
              step={1}
              className="h-2"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">H</span>
              <span className="text-xs font-mono">{inputOklch.h.toFixed(1)}°</span>
            </div>
            <Slider
              value={[inputOklch.h]}
              onValueChange={([value]) => updateInputFromOklch(inputOklch.l, inputOklch.c, value)}
              min={0}
              max={360}
              step={1}
              className="h-2"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={undo} 
          variant="outline"
          disabled={historyIndex <= 0}
        >
          Undo
        </Button>
        <Button 
          onClick={redo} 
          variant="outline"
          disabled={historyIndex >= history.length - 1}
        >
          Redo
        </Button>
        <Button onClick={resetAllSliders} variant="outline">
          Reset All
        </Button>
      </div>

      <div className="grid grid-cols-11 gap-1">
        {currentColors.map((color, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className="w-full h-16 rounded-t"
              style={{ backgroundColor: color }}
            />
            <div className="text-xs font-mono mt-1">
              {colorScale.labels[index]}
            </div>
            <div className="text-xs font-mono text-gray-500">
              {color}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 justify-center">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-center">Hue</h4>
            <Button
              onClick={() => resetSliders('hue')} 
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
            >
              Reset
            </Button>
          </div>
          <div className="flex gap-0.5 justify-center">
            {hueValues.map((value, index) => (
              <div key={index} className="w-6">
                <Slider
                  orientation="vertical"
                  min={-60}
                  max={60}
                  step={0.1}
                  value={[value]}
                  onValueChange={([newValue]) => handleSliderChange(index, newValue, 'hue')}
                  className="h-48"
                  style={{
                    '--slider-thumb-color': currentColors[index],
                  } as React.CSSProperties}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-center">Lightness</h4>
            <Button
              onClick={() => resetSliders('lightness')} 
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
            >
              Reset
            </Button>
          </div>
          <div className="flex gap-0.5 justify-center">
            {lightnessValues.map((value, index) => (
              <div key={index} className="w-6">
                <Slider
                  orientation="vertical"
                  min={-40}
                  max={40}
                  step={0.1}
                  value={[value]}
                  onValueChange={([newValue]) => handleSliderChange(index, newValue, 'lightness')}
                  className="h-48"
                  style={{
                    '--slider-thumb-color': currentColors[index],
                  } as React.CSSProperties}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-center">Chroma</h4>
            <Button
              onClick={() => resetSliders('chroma')} 
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
            >
              Reset
            </Button>
          </div>
          <div className="flex gap-0.5 justify-center">
            {chromaValues.map((value, index) => (
              <div key={index} className="w-6">
                <Slider
                  orientation="vertical"
                  min={-40}
                  max={40}
                  step={0.1}
                  value={[value]}
                  onValueChange={([newValue]) => handleSliderChange(index, newValue, 'chroma')}
                  className="h-48"
                  style={{
                    '--slider-thumb-color': currentColors[index],
                  } as React.CSSProperties}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 