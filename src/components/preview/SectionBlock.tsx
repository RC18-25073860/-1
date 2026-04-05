import React from 'react';
import { ThemeTokens } from '../../types/profile';

interface SectionBlockProps {
  title: string;
  theme: ThemeTokens;
  children: React.ReactNode;
  className?: string;
}

export const SectionBlock: React.FC<SectionBlockProps> = ({ title, theme, children, className }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full" style={{ backgroundColor: theme.accent }} />
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: theme.primary }}>
          {title}
        </h3>
      </div>
      <div className="text-xs leading-relaxed" style={{ color: theme.text }}>
        {children}
      </div>
    </div>
  );
};
