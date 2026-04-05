import React from 'react';
import { SizePreset } from '../../types/profile';
import { cn } from '../../lib/utils';

interface SizeSelectorProps {
  currentPreset: SizePreset;
  width: number;
  height: number;
  onSelect: (preset: SizePreset, w?: number, h?: number) => void;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({ currentPreset, width, height, onSelect }) => {
  const presets: { id: SizePreset; label: string; w: number; h: number }[] = [
    { id: 'a4', label: 'A4 Portrait', w: 794, h: 1123 },
    { id: 'long', label: 'Long Image', w: 1080, h: 1920 },
    { id: 'custom', label: 'Custom', w: width, h: height },
  ];

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Canvas Size</label>
      <div className="grid grid-cols-2 gap-3">
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id, p.w, p.h)}
            className={cn(
              "flex flex-col items-start p-4 rounded-2xl border transition-all duration-300 gap-3",
              currentPreset === p.id
                ? "border-black bg-gray-50 shadow-sm"
                : "border-gray-100 bg-white hover:border-gray-300"
            )}
          >
            <div className={cn(
              "w-8 rounded-sm border-2 transition-colors",
              currentPreset === p.id ? "border-black" : "border-gray-200",
              p.id === 'a4' ? "h-10" : "h-14"
            )} />
            <div className="flex flex-col items-start">
              <span className="text-xs font-bold">{p.label}</span>
              <span className="text-[10px] text-gray-400 font-mono">{p.w} × {p.h}</span>
            </div>
          </button>
        ))}
      </div>
      
      {currentPreset === 'custom' && (
        <div className="flex gap-3 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Width</label>
            <input
              type="number"
              value={width}
              onChange={(e) => onSelect('custom', parseInt(e.target.value) || 0, height)}
              className="w-full px-4 py-2 text-xs border border-gray-100 rounded-xl focus:border-black outline-none transition-all"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Height</label>
            <input
              type="number"
              value={height}
              onChange={(e) => onSelect('custom', width, parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 text-xs border border-gray-100 rounded-xl focus:border-black outline-none transition-all"
            />
          </div>
        </div>
      )}
    </div>
  );
};
