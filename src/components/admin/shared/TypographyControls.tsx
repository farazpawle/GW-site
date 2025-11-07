'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { TextStyle, FONT_FAMILIES, FONT_WEIGHTS, FONT_SIZE_PRESETS, FontSizePreset } from '@/types/typography';
import { isValidHexColor } from '@/lib/utils/typography';

interface TypographyControlsProps {
  label: string;
  value?: TextStyle;
  onChange: (value: TextStyle | undefined) => void;
  defaultOpen?: boolean;
}

export default function TypographyControls({ label, value, onChange, defaultOpen = false }: TypographyControlsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [customSize, setCustomSize] = useState(value?.fontSize || '');

  const hasStyles = !!(value?.fontFamily || value?.fontSize || value?.color || value?.fontWeight || value?.lineHeight);

  const handleChange = (updates: Partial<TextStyle>) => {
    const newValue = { ...value, ...updates };
    // Remove undefined values
    Object.keys(newValue).forEach(key => {
      if (newValue[key as keyof TextStyle] === undefined) {
        delete newValue[key as keyof TextStyle];
      }
    });
    onChange(Object.keys(newValue).length > 0 ? newValue : undefined);
  };

  const handleReset = () => {
    onChange(undefined);
    setCustomSize('');
  };

  const handleFontSizePreset = (preset: FontSizePreset) => {
    const size = FONT_SIZE_PRESETS[preset];
    setCustomSize(size);
    handleChange({ fontSize: size });
  };

  const handleCustomFontSize = (size: string) => {
    setCustomSize(size);
    if (size.trim()) {
      handleChange({ fontSize: size.trim() });
    } else {
      const { fontSize, ...rest } = value || {};
      onChange(Object.keys(rest).length > 0 ? rest : undefined);
    }
  };

  return (
    <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-[#0a0a0a] hover:bg-[#141414] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">Aa</span>
          <span className="text-sm font-medium text-gray-300">{label}</span>
          {hasStyles && (
            <span className="text-xs bg-brand-maroon/20 text-brand-maroon px-2 py-0.5 rounded">
              Styled
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Controls */}
      {isOpen && (
        <div className="p-4 space-y-4 bg-[#0a0a0a]">
          {/* Font Family */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Font Family
            </label>
            <select
              value={value?.fontFamily || ''}
              onChange={(e) => handleChange({ fontFamily: e.target.value as any || undefined })}
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:ring-2 focus:ring-brand-maroon focus:border-transparent"
            >
              <option value="">Default</option>
              {FONT_FAMILIES.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size Presets */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Font Size (Presets)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(FONT_SIZE_PRESETS) as FontSizePreset[]).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleFontSizePreset(preset)}
                  className={`px-2 py-1 text-xs rounded border ${
                    customSize === FONT_SIZE_PRESETS[preset]
                      ? 'bg-brand-maroon/20 border-brand-maroon text-brand-maroon'
                      : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Font Size */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Custom Size (px, rem, em)
            </label>
            <input
              type="text"
              value={customSize}
              onChange={(e) => handleCustomFontSize(e.target.value)}
              placeholder="e.g., 16px, 1.5rem"
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:ring-2 focus:ring-brand-maroon focus:border-transparent"
            />
          </div>

          {/* Font Weight */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Font Weight
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FONT_WEIGHTS.map((weight) => (
                <button
                  key={weight}
                  type="button"
                  onClick={() => handleChange({ fontWeight: weight })}
                  className={`px-2 py-1 text-xs rounded border ${
                    value?.fontWeight === weight
                      ? 'bg-brand-maroon/20 border-brand-maroon text-brand-maroon'
                      : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-300 hover:border-gray-500'
                  }`}
                  style={{ fontWeight: weight }}
                >
                  {weight === '300' && 'Light'}
                  {weight === '400' && 'Regular'}
                  {weight === '500' && 'Medium'}
                  {weight === '600' && 'Semi-bold'}
                  {weight === '700' && 'Bold'}
                  {weight === '800' && 'Extra-bold'}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Text Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={value?.color || '#ffffff'}
                onChange={(e) => handleChange({ color: e.target.value })}
                className="w-12 h-10 rounded border border-[#2a2a2a] bg-[#1a1a1a] cursor-pointer"
              />
              <input
                type="text"
                value={value?.color || ''}
                onChange={(e) => {
                  const color = e.target.value;
                  if (!color || isValidHexColor(color)) {
                    handleChange({ color: color || undefined });
                  }
                }}
                placeholder="#ffffff"
                className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:ring-2 focus:ring-brand-maroon focus:border-transparent font-mono"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Enter hex color code (e.g., #6e0000)</p>
          </div>

          {/* Line Height */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Line Height
            </label>
            <input
              type="text"
              value={value?.lineHeight || ''}
              onChange={(e) => handleChange({ lineHeight: e.target.value || undefined })}
              placeholder="e.g., 1.5, 1.75, 2"
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:ring-2 focus:ring-brand-maroon focus:border-transparent"
            />
          </div>

          {/* Reset Button */}
          {hasStyles && (
            <button
              type="button"
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg transition-colors text-sm"
            >
              <RotateCcw size={14} />
              Reset to Default
            </button>
          )}
        </div>
      )}
    </div>
  );
}
