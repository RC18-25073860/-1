import React, { useRef, useEffect, useState } from 'react';
import { ProfileData, NormalizedProfileData, LayoutPlan } from '../../types/profile';
import { THEMES } from '../../lib/themes';
import { ProfileCardRenderer } from './ProfileCardRenderer';

interface PreviewFrameProps {
  data: ProfileData;
  normalizedData: NormalizedProfileData;
  layoutPlan: LayoutPlan;
  activeSection: string | null;
  onSectionSelect: (id: string) => void;
  onUpdateField: (id: string, value: any) => void;
  onDragChange?: (id: string, position: { x: number; y: number }) => void;
  onReorder?: (newOrder: string[]) => void;
  onToggleCollapse?: (id: string) => void;
}

export const PreviewFrame: React.FC<PreviewFrameProps> = ({ 
  data, 
  normalizedData, 
  layoutPlan,
  activeSection,
  onSectionSelect,
  onUpdateField,
  onDragChange,
  onReorder,
  onToggleCollapse
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const theme = THEMES[data.themeId];

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.clientWidth - 96; // padding
        const containerHeight = containerRef.current.clientHeight - 96;
        
        // Use actual content height if it's larger than the preset
        const contentHeight = Math.max(data.size.height, contentRef.current.scrollHeight);
        const contentWidth = data.size.width;

        const scaleW = containerWidth / contentWidth;
        const scaleH = containerHeight / contentHeight;
        
        // Scale down if content exceeds viewport, but don't scale up beyond 1
        const newScale = Math.min(scaleW, scaleH, 1);
        setScale(newScale);
      }
    };

    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    if (contentRef.current) observer.observe(contentRef.current);

    updateScale();
    return () => observer.disconnect();
  }, [data.size, normalizedData]);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center overflow-y-auto overflow-x-hidden p-12 custom-scrollbar">
      <div 
        ref={contentRef}
        id="profile-canvas"
        className="bg-white paper-shadow origin-top transition-all duration-500 ease-out relative"
        style={{ 
          width: data.size.width, 
          minHeight: data.size.height,
          height: 'auto',
          transform: `scale(${scale})`,
          flexShrink: 0,
          marginBottom: `${(1 - scale) * -100}%` // Offset the height reduction from scaling
        }}
      >
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")' }} />
        
        <ProfileCardRenderer 
          data={data} 
          normalizedData={normalizedData} 
          layoutPlan={layoutPlan} 
          theme={theme} 
          activeSection={activeSection}
          onSectionSelect={onSectionSelect}
          onUpdateField={onUpdateField}
          onDragChange={onDragChange}
          onReorder={onReorder}
          onToggleCollapse={onToggleCollapse}
        />
      </div>
    </div>
  );
};
