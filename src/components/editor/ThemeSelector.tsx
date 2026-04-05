import React from 'react';
import { ThemeType, ThemeTokens } from '../../types/profile';
import { THEMES } from '../../lib/themes';
import { cn } from '../../lib/utils';

interface ThemeSelectorProps {
  currentThemeId: ThemeType;
  onSelect: (id: ThemeType) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentThemeId, onSelect }) => {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Visual Theme</label>
      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(THEMES) as ThemeType[]).map((themeId) => {
          const theme = THEMES[themeId];
          return (
            <button
              key={themeId}
              onClick={() => onSelect(themeId)}
              className={cn(
                "group relative flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300",
                currentThemeId === themeId
                  ? "border-black bg-gray-50 shadow-sm"
                  : "border-gray-100 bg-white hover:border-gray-300"
              )}
            >
              <div 
                className="w-10 h-10 rounded-xl shadow-inner flex-shrink-0"
                style={{ background: theme.gradient || theme.background }}
              />
              <div className="flex flex-col items-start overflow-hidden">
                <span className="text-[10px] font-bold truncate w-full">{theme.label}</span>
                <div className="flex gap-1 mt-1">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primary }} />
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.secondary }} />
                </div>
              </div>
              {currentThemeId === themeId && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                   <div className="w-1 h-1 bg-white rounded-full" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
