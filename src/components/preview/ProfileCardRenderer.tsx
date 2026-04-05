import React from 'react';
import { motion, Reorder, AnimatePresence } from 'motion/react';
import { ProfileData, ThemeTokens, NormalizedProfileData, LayoutPlan, BilingualValue, MaterialType } from '../../types/profile';
import { SectionBlock } from './SectionBlock';
import { cn } from '../../lib/utils';

import { 
  Figma, Palette, Play, Fingerprint, FileText, Zap, PenTool, Layout, Globe, 
  Smartphone, Target, Search, Camera, Video, Brush, Type, Code, Atom, 
  Box, Shield, Server, Terminal, BarChart, Megaphone, Share2, TrendingUp, 
  ShoppingBag, Briefcase, GraduationCap, Pen, Scissors, Users, Star, 
  Heart, Sparkles, Sun, Moon, Cloud, Coffee, Music, Smile, Maximize,
  ChevronDown, ChevronUp, GripVertical
} from 'lucide-react';

const SKILL_ICONS: Record<string, any> = {
  figma: Figma,
  adobe: Palette,
  motion: Play,
  brand: Fingerprint,
  content: FileText,
  branding: Zap,
  design: PenTool,
  ui: Layout,
  ux: Layout,
  web: Globe,
  mobile: Smartphone,
  strategy: Target,
  research: Search,
  photography: Camera,
  video: Video,
  illustration: Brush,
  typography: Type,
  coding: Code,
  react: Atom,
  vue: Box,
  angular: Shield,
  node: Server,
  python: Terminal,
  data: BarChart,
  marketing: Megaphone,
  social: Share2,
  seo: TrendingUp,
  ecommerce: ShoppingBag,
  consulting: Briefcase,
  teaching: GraduationCap,
  writing: Pen,
  editing: Scissors,
  management: Users,
};

const getSkillIcon = (tag: string) => {
  const lowerTag = tag.toLowerCase();
  for (const key in SKILL_ICONS) {
    if (lowerTag.includes(key)) return SKILL_ICONS[key];
  }
  return Sparkles;
};

const shortenLabel = (text: string) => {
  if (!text) return '';
  return text
    .replace(/EDITORIAL DESIGN/gi, 'EDITORIAL')
    .replace(/GRAPHIC DESIGN/gi, 'GRAPHIC')
    .replace(/USER INTERFACE/gi, 'UI')
    .replace(/USER EXPERIENCE/gi, 'UX')
    .replace(/VISUAL COMMUNICATION/gi, 'VISUAL')
    .replace(/INTERACTION DESIGN/gi, 'INTERACTION')
    .replace(/PRODUCT DESIGN/gi, 'PRODUCT')
    .replace(/MOTION GRAPHICS/gi, 'MOTION')
    .replace(/BRAND IDENTITY/gi, 'BRANDING')
    .replace(/DEVELOPMENT/gi, 'DEV')
    .replace(/MANAGEMENT/gi, 'MGMT')
    .replace(/ADVERTISING/gi, 'AD')
    .replace(/MARKETING/gi, 'MKT');
};

const Illustration = ({ icon: Icon, className, style }: { icon: any, className?: string, style?: React.CSSProperties }) => (
  <div className={cn("absolute pointer-events-none opacity-20", className)} style={style}>
    <Icon className="w-full h-full" strokeWidth={1} />
  </div>
);

interface ProfileCardRendererProps {
  data: ProfileData;
  normalizedData: NormalizedProfileData;
  layoutPlan: LayoutPlan;
  theme: ThemeTokens;
  activeSection: string | null;
  onSectionSelect: (id: string) => void;
  onUpdateField: (id: string, value: any) => void;
  onDragChange?: (id: string, position: { x: number; y: number }) => void;
  onReorder?: (newOrder: string[]) => void;
  onToggleCollapse?: (id: string) => void;
  mode?: 'preview' | 'export';
}

export const ProfileCardRenderer: React.FC<ProfileCardRendererProps> = ({ 
  data, 
  normalizedData, 
  layoutPlan, 
  theme,
  activeSection,
  onSectionSelect,
  onUpdateField,
  onDragChange,
  onReorder,
  onToggleCollapse,
  mode = 'preview'
}) => {
  const isExport = mode === 'export';
  const { templateId } = data;
  
  // Template categorization
  const isPoster = templateId === 'editorial_big_title' || templateId === 'playful_designer';
  const isEditorial = templateId === 'luxury_editorial' || templateId === 'playful_editorial_grid';
  const isAcademic = templateId === 'minimal_swiss';
  const isSwissStyle = isAcademic; // Swiss minimal style

  const { name, title, avatar, avatarGrayscale, avatarNoBg, sections } = normalizedData;
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [replacingField, setReplacingField] = React.useState<string | null>(null);

  const handleImageClick = (fieldId: string) => {
    if (isExport) return;
    setReplacingField(fieldId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && replacingField) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateField(replacingField, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getMaterialStyles = (material?: MaterialType, customBg?: string) => {
    if (!material || material === 'flat') {
      return {
        backgroundColor: customBg || 'transparent',
      };
    }

    const baseBg = customBg || theme.background;
    
    switch (material) {
      case 'soft':
        return {
          backgroundColor: baseBg,
          boxShadow: '10px 10px 20px rgba(0,0,0,0.05), -10px -10px 20px rgba(255,255,255,0.8)',
          borderRadius: '2rem',
          border: '1px solid rgba(255,255,255,0.5)',
          padding: '2rem',
        };
      case 'glass':
        return {
          backgroundColor: 'rgba(255,255,255,0.4)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '2rem',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
          padding: '2rem',
        };
      case 'accent':
        return {
          backgroundColor: theme.accent,
          color: '#FFFFFF',
          borderRadius: '2rem',
          boxShadow: `0 20px 40px -10px ${theme.accent}40`,
          padding: '2rem',
        };
      default:
        return {};
    }
  };

  const EditableNode: React.FC<{ 
    id: string, 
    label: string, 
    className?: string, 
    onClick?: () => void, 
    style?: React.CSSProperties,
    material?: MaterialType,
    backgroundColor?: string,
    position?: { x: number; y: number },
    isCollapsed?: boolean
  }> = ({ id, label, children, className, onClick, style, material, backgroundColor, position, isCollapsed }) => {
    const isActive = activeSection === id;
    const materialStyles = getMaterialStyles(material, backgroundColor);
    const isFreeDrag = data.dragMode === 'free' && !isExport;
    
    if (isExport) {
      return (
        <div 
          style={{ ...style, ...materialStyles }} 
          className={cn("reveal-on-scroll premium-lift", className)}
          data-tilt
          data-magnetic
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{label}</span>
          </div>
          <div className={cn("transition-all duration-500", isCollapsed && "hidden")}>
            {children}
          </div>
        </div>
      );
    }

    return (
      <motion.div 
        drag={isFreeDrag}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          if (isFreeDrag && onDragChange) {
            onDragChange(id, { 
              x: (position?.x || 0) + info.offset.x, 
              y: (position?.y || 0) + info.offset.y 
            });
          }
        }}
        whileDrag={{ 
          scale: 1.05, 
          rotate: 2,
          zIndex: 50,
          boxShadow: "0 30px 60px -12px rgba(50,50,93,0.25), 0 18px 36px -18px rgba(0,0,0,0.3)",
          opacity: 0.8
        }}
        initial={position ? { x: position.x, y: position.y } : false}
        animate={position ? { x: position.x, y: position.y } : { x: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => {
          e.stopPropagation();
          onSectionSelect(id);
          onClick?.();
        }}
        className={cn(
          "relative group cursor-pointer transition-all duration-300",
          isActive ? "ring-1 bg-black/[0.01]" : "hover:bg-black/[0.01]",
          isFreeDrag && "absolute",
          className
        )}
        style={{ 
          ...style,
          ...materialStyles,
          boxShadow: isActive ? `0 0 0 1px ${theme.accent}40` : materialStyles.boxShadow,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {!isFreeDrag && onReorder && (
              <GripVertical className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" />
            )}
            <span className="text-[8px] font-black uppercase tracking-widest opacity-30">{label}</span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse?.(id);
            }}
            className="p-1 hover:bg-black/5 rounded-full transition-colors"
          >
            {isCollapsed ? <ChevronDown className="w-3 h-3 opacity-40" /> : <ChevronUp className="w-3 h-3 opacity-40" />}
          </button>
        </div>
        
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>

        {isActive && (
          <div className="absolute -top-6 left-0 px-2 py-0.5 bg-black text-white text-[8px] font-bold uppercase tracking-widest rounded-t-sm z-50">
            {label}
          </div>
        )}
      </motion.div>
    );
  };

  const ImageReplace = ({ id, current, className }: { id: string, current: string, className?: string }) => {
    if (isExport) {
      return (
        <div className={cn("reveal-on-scroll overflow-hidden group", className)}>
          <img src={current} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
      );
    }

    return (
      <EditableNode id={id} label={id} className={cn("relative overflow-hidden", className)} onClick={() => handleImageClick(id)}>
        <img src={current} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-3 py-1 text-[10px] font-bold text-white uppercase tracking-widest rounded-sm" style={{ backgroundColor: theme.accent }}>Replace</span>
        </div>
      </EditableNode>
    );
  };

  const SectionGrid: React.FC<{ 
    sections: NormalizedProfileData['sections'],
    className?: string,
    renderSection: (section: NormalizedProfileData['sections'][0]) => React.ReactNode
  }> = ({ sections, className, renderSection }) => {
    if (data.dragMode === 'free' || isExport) {
      return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", className)}>
          {sections.map(section => renderSection(section))}
        </div>
      );
    }

    return (
      <Reorder.Group 
        axis="y" 
        values={sections.map(s => s.id)} 
        onReorder={onReorder || (() => {})}
        className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", className)}
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}
      >
        {sections.map(section => (
          <Reorder.Item 
            key={section.id} 
            value={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            {renderSection(section)}
          </Reorder.Item>
        ))}
      </Reorder.Group>
    );
  };

  const renderBilingualText = (
    value: string | BilingualValue, 
    pattern: 'stacked' | 'inline' | 'subtitle' = 'stacked',
    className?: string,
    enClassName?: string
  ) => {
    if (typeof value === 'string') return <span className={className}>{value}</span>;
    if (!value || (!value.zh && !value.en)) return null;

    const zh = value.zh;
    const en = value.en;

    if (!en) return <span className={className}>{zh}</span>;
    if (!zh) return <span className={cn("italic opacity-70 text-[0.9em] font-normal", enClassName)}>{en}</span>;

    // 1. Poster / Hero layout: Remove English completely to keep it clean and bold
    if (isPoster) {
      return <span className={className}>{zh}</span>;
    }

    // 2. Editorial layout: Chinese + English, English is secondary (italic, lower opacity)
    // 3. Academic layout: Full bilingual display (less opacity reduction, no italic)
    const enOpacity = isAcademic ? "opacity-80" : "opacity-60";
    const enItalic = isAcademic ? "" : "italic";

    if (pattern === 'inline') {
      return (
        <span className={className}>
          {zh} <span className={cn("mx-2 opacity-30 font-light")}>/</span> <span className={cn(enItalic, enOpacity, "text-[0.85em] font-normal tracking-tight", enClassName)}>{en}</span>
        </span>
      );
    }

    if (pattern === 'subtitle') {
      return (
        <div className={cn("flex flex-col", className)}>
          <span className="leading-tight">{zh}</span>
          <span className={cn(enItalic, enOpacity, "text-[0.85em] font-normal tracking-tight leading-tight mt-1", enClassName)}>{en}</span>
        </div>
      );
    }

    // Default: stacked
    return (
      <div className={cn("flex flex-col", className)}>
        <span className="leading-tight">{zh}</span>
        <span className={cn(enItalic, enOpacity, "text-[0.8em] font-normal tracking-tight leading-tight mt-0.5", enClassName)}>{en}</span>
      </div>
    );
  };

  const renderContent = (section: NormalizedProfileData['sections'][0], isLuxury: boolean = false) => {
    const { type, value, id } = section;

    if (type === 'list') {
      const isEducation = id === 'education';
      return (
        <ul className={cn(
          "space-y-4",
          layoutPlan.sectionDensity === 'tight' ? "space-y-2" : "space-y-5",
          isLuxury && isEducation && "pl-6 border-l border-black/5"
        )}>
          {Array.isArray(value) && value.map((item: string | BilingualValue, i: number) => (
            <li key={i} className={cn(
              "flex items-start gap-3 group relative p-2 rounded-xl transition-all duration-300 premium-lift reveal-on-scroll",
              isLuxury && isEducation && "timeline-dot"
            )}>
              {!isEducation && (
                <div className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-60" style={{ backgroundColor: theme.accent }} />
              )}
              <div className="flex-1">
                {renderBilingualText(item, 'subtitle', "text-sm leading-relaxed", "text-[0.9em]")}
              </div>
            </li>
          ))}
        </ul>
      );
    }

    if (type === 'taglist') {
      const isSkills = id === 'skills' || id === 'teachingAreas' || id === 'languageScores' || id === 'researchInterests';
      const isPlayfulGrid = templateId === 'playful_editorial_grid';

      return (
        <div className={cn(
          "flex flex-wrap gap-3",
          isPlayfulGrid && "grid grid-cols-1 sm:grid-cols-2 gap-4"
        )}>
          {Array.isArray(value) && value.map((tag: string | BilingualValue, i: number) => {
            const tagStr = typeof tag === 'string' ? tag : tag.zh || tag.en;
            const Icon = getSkillIcon(tagStr);
            const zh = typeof tag === 'string' ? tag : tag.zh;
            const en = typeof tag === 'string' ? '' : tag.en;

            return (
              <div key={i} className={cn(
                "flex flex-col gap-2 min-w-0 reveal-on-scroll",
                isPlayfulGrid && "p-5 rounded-2xl bg-white/50 border border-black/5 hover:bg-white transition-all duration-500 premium-lift flex-1"
              )}>
                <div className={cn(
                  "flex gap-3 min-w-0",
                  isPlayfulGrid ? "flex-col items-start" : "items-center"
                )}>
                  {isPlayfulGrid && (
                    <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center shrink-0 mb-1">
                      <Icon className="w-5 h-5" style={{ color: theme.accent }} />
                    </div>
                  )}
                  <div className="flex flex-col min-w-0 w-full">
                    <span className="text-[11px] font-bold uppercase tracking-wider truncate block" style={{ color: theme.primary }}>
                      {zh}
                    </span>
                    {en && (
                      <span 
                        className="text-[9px] italic opacity-40 tracking-[0.15em] uppercase whitespace-nowrap truncate block mt-0.5"
                        style={{ fontSize: en.length > 18 ? '9px' : en.length > 12 ? '10px' : '11px' }}
                      >
                        {shortenLabel(en)}
                      </span>
                    )}
                  </div>
                </div>
                {(isLuxury || isPlayfulGrid) && isSkills && (
                  <div className="w-full h-1 rounded-full bg-black/5 overflow-hidden mt-1">
                    <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ 
                      backgroundColor: theme.accent,
                      width: `${(i * 7 + 65) % 40 + 60}%` 
                    }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    if (type === 'gallery') {
      return (
        <div className={cn(
          "grid gap-6",
          layoutPlan.galleryMode === 'grid' ? "grid-cols-3" : "grid-cols-2"
        )}>
          {Array.isArray(value) && value.map((img: string, i: number) => (
            <div key={i} className="aspect-square rounded-2xl overflow-hidden border group relative premium-lift" style={{ borderColor: theme.border }}>
              <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-500" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={cn(
        "body-text",
        layoutPlan.sectionDensity === 'tight' ? "text-xs" : "text-sm"
      )} style={{ color: theme.text }}>
        {renderBilingualText(value, 'subtitle', "leading-relaxed", "text-[0.9em]")}
      </div>
    );
  };

  // Template: Playful Editorial Grid
  if (templateId === 'playful_editorial_grid') {
    return (
      <div className={cn(
        "flex flex-col p-16 relative paper-grid",
        !isExport ? "h-full overflow-hidden" : "min-h-screen"
      )} style={{ backgroundColor: theme.background, fontFamily: theme.fontSans }}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        
        {/* Decorative Illustrations */}
        <Illustration icon={Camera} className="w-24 h-24 top-10 right-10 rotate-12" />
        <Illustration icon={Brush} className="w-20 h-20 bottom-20 left-10 -rotate-12" />
        <Illustration icon={Zap} className="w-16 h-16 top-1/2 right-20 rotate-45" />
        <Illustration icon={Heart} className="w-12 h-12 bottom-40 right-40 -rotate-6" />
        <Illustration icon={Coffee} className="w-14 h-14 top-40 left-40 rotate-12" />

        <div className="relative z-10 flex flex-col gap-16">
          <header className="flex flex-col md:flex-row items-center gap-12">
            {avatar && (
              <div className="relative group">
                <div className="absolute inset-0 bg-black rounded-[3rem] rotate-6 scale-105 opacity-5 group-hover:rotate-12 transition-transform duration-700" />
                <ImageReplace 
                  id="avatar" 
                  current={avatar} 
                  className={cn(
                    "rounded-[3rem] border-4 border-white shadow-2xl relative z-10",
                    layoutPlan.avatarSize === 'sm' ? "w-32 h-32" : "w-48 h-48"
                  )} 
                />
              </div>
            )}
            <div className="flex-1 text-center md:text-left">
              <EditableNode id="name" label={typeof name === 'string' ? name : name.zh}>
                <h1 className="editorial-title mb-4" style={{ color: theme.primary, fontSize: `${5 * layoutPlan.fontSizeAdjust}rem` }}>
                  {renderBilingualText(name, 'stacked')}
                </h1>
              </EditableNode>
              <EditableNode id="title" label={typeof title === 'string' ? title : title.zh}>
                <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-white border border-black/5 shadow-sm">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.accent }} />
                  <div className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: theme.muted }}>
                    {renderBilingualText(title, 'inline')}
                  </div>
                </div>
              </EditableNode>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* Main Content Area */}
            <div className="md:col-span-8 space-y-16">
              {sections.filter(s => s.type === 'gallery' || s.type === 'textarea').map(section => (
                <EditableNode 
                  key={section.id} 
                  id={section.id} 
                  label={typeof section.label === 'string' ? section.label : section.label.zh} 
                  className="fade-in-section is-visible"
                  material={section.material}
                  backgroundColor={section.backgroundColor}
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="section-label">{renderBilingualText(section.label, 'inline')}</div>
                    <div className="flex-1 h-px bg-black/5" />
                  </div>
                  {renderContent(section)}
                </EditableNode>
              ))}
            </div>

            {/* Sidebar Area */}
            <div className="md:col-span-4 space-y-16">
              {sections.filter(s => s.type !== 'gallery' && s.type !== 'textarea').map(section => (
                <EditableNode 
                  key={section.id} 
                  id={section.id} 
                  label={typeof section.label === 'string' ? section.label : section.label.zh} 
                  className="fade-in-section is-visible"
                  material={section.material}
                  backgroundColor={section.backgroundColor}
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="section-label">{renderBilingualText(section.label, 'inline')}</div>
                    <div className="flex-1 h-px bg-black/5" />
                  </div>
                  {renderContent(section)}
                </EditableNode>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Template: Luxury Editorial
  if (templateId === 'luxury_editorial') {
    return (
      <div className={cn(
        "flex flex-col relative",
        !isExport ? "h-full overflow-hidden" : "min-h-screen overflow-visible"
      )} style={{ backgroundColor: theme.background, fontFamily: theme.fontSans }}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        {/* Luxury Background Decorations */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ 
          background: `radial-gradient(circle at 10% 10%, ${theme.accent} 0%, transparent 40%), radial-gradient(circle at 90% 90%, ${theme.primary} 0%, transparent 40%)` 
        }} />
        
        {/* Main Layout */}
        <div className="flex-1 flex flex-col p-20 z-10">
          {/* Elegant Header */}
          <header className="mb-24 flex flex-col items-center text-center">
            <div className="mb-12 relative group">
              <div className="absolute inset-0 bg-black/5 rounded-full scale-110 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              {avatar && (
                <ImageReplace 
                  id="avatar" 
                  current={avatar} 
                  className={cn(
                    "rounded-full border-2 border-white shadow-2xl transition-all duration-1000 premium-lift",
                    layoutPlan.avatarSize === 'sm' ? "w-28 h-28" : layoutPlan.avatarSize === 'lg' ? "w-56 h-56" : "w-40 h-40"
                  )} 
                />
              )}
            </div>
            
            <EditableNode id="name" label={typeof name === 'string' ? name : name.zh}>
              <h1 
                className="editorial-title mb-6 transition-all"
                style={{ 
                  color: theme.primary, 
                  fontSize: `${4.5 * layoutPlan.fontSizeAdjust}rem`,
                }}
              >
                {renderBilingualText(name, 'stacked')}
              </h1>
            </EditableNode>
            <EditableNode id="title" label={typeof title === 'string' ? title : title.zh}>
              <div className="flex items-center gap-6">
                <div className="h-px w-16 bg-black/10" />
                <div className="section-label" style={{ color: theme.muted }}>
                  {renderBilingualText(title, 'inline')}
                </div>
                <div className="h-px w-16 bg-black/10" />
              </div>
            </EditableNode>
          </header>

          {/* Content Grid */}
          <SectionGrid 
            sections={sections}
            className="flex-1"
            renderSection={(section) => (
              <EditableNode 
                key={section.id} 
                id={section.id} 
                label={typeof section.label === 'string' ? section.label : section.label.zh} 
                className="space-y-6 fade-in-section is-visible"
                material={section.material}
                backgroundColor={section.backgroundColor}
                position={section.position}
                isCollapsed={section.isCollapsed}
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="section-label" style={{ color: theme.primary }}>
                    {renderBilingualText(section.label, 'inline')}
                  </div>
                  <div className="flex-1 h-px bg-black/5" />
                </div>
                {renderContent(section, true)}
              </EditableNode>
            )}
          />
        </div>

        {/* Footer */}
        <footer className="p-16 border-t flex justify-between items-center opacity-20" style={{ borderColor: theme.border }}>
          <span className="text-[10px] font-bold uppercase tracking-[0.6em]">Editorial Design Studio</span>
          <div className="flex gap-6">
             <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primary }} />
             <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primary }} />
             <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primary }} />
          </div>
        </footer>
      </div>
    );
  }

  // Template: Minimal Swiss
  if (templateId === 'minimal_swiss') {
    return (
      <div className={cn(
        "flex flex-col p-24 relative",
        !isExport ? "h-full overflow-hidden" : "min-h-screen overflow-visible"
      )} style={{ backgroundColor: theme.background, fontFamily: theme.fontSans }}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        
        {/* Soft UI: Subtle depth without heavy borders */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `radial-gradient(${theme.primary} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        
        <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full">
          {/* Header Area - Clean & Typographic */}
          <div className="grid grid-cols-12 gap-12 mb-24 items-start">
            <div className="col-span-8">
              <EditableNode id="name" label={typeof name === 'string' ? name : name.zh}>
                <h1 className="font-bold tracking-tighter mb-6 leading-[0.9]" style={{ color: theme.primary, fontSize: `${5 * layoutPlan.fontSizeAdjust}rem` }}>
                  {renderBilingualText(name, 'stacked')}
                </h1>
              </EditableNode>
              <EditableNode id="title" label={typeof title === 'string' ? title : title.zh}>
                <div className="text-xl font-light tracking-tight opacity-50 max-w-xl border-l-2 pl-6 mt-4" style={{ color: theme.muted, borderColor: theme.primary }}>
                  {renderBilingualText(title, 'inline')}
                </div>
              </EditableNode>
            </div>
            <div className="col-span-4 flex justify-end">
              {avatar && (
                <div className="relative">
                  <div className="absolute -inset-4 bg-black/[0.02] rounded-full blur-2xl" />
                  <ImageReplace 
                    id="avatar" 
                    current={avatar} 
                    className={cn(
                      "rounded-2xl grayscale hover:grayscale-0 transition-all duration-700 shadow-sm",
                      layoutPlan.avatarSize === 'sm' ? "w-32 h-32" : "w-48 h-48"
                    )} 
                  />
                </div>
              )}
            </div>
          </div>

          {/* Content Grid - Borderless, whitespace-driven */}
          <SectionGrid 
            sections={sections}
            className="flex-1"
            renderSection={(section) => (
              <EditableNode 
                key={section.id} 
                id={section.id} 
                label={typeof section.label === 'string' ? section.label : section.label.zh}
                className="fade-in-section is-visible"
                material={section.material}
                backgroundColor={section.backgroundColor}
                position={section.position}
                isCollapsed={section.isCollapsed}
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: theme.primary }}>
                    {renderBilingualText(section.label, 'inline')}
                  </div>
                  <div className="flex-1 h-px bg-black/[0.05]" />
                </div>
                <div className="pl-8">
                  {renderContent(section)}
                </div>
              </EditableNode>
            )}
          />
        </div>
      </div>
    );
  }

  // Template: Playful Designer
  if (templateId === 'playful_designer') {
    return (
      <div className={cn(
        "flex flex-col p-16 relative paper-grid",
        !isExport ? "h-full overflow-hidden" : "min-h-screen overflow-visible"
      )} style={{ backgroundColor: theme.background, fontFamily: theme.fontDisplay }}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        
        {/* Decorative English Name for Poster Style */}
        {typeof name !== 'string' && name.en && (
          <div className="absolute top-40 right-20 text-[10rem] font-black opacity-[0.02] pointer-events-none select-none -rotate-12 uppercase" style={{ color: theme.primary }}>
            {name.en}
          </div>
        )}

        {/* Playful Decorations */}
        <Illustration icon={Smile} className="w-24 h-24 top-10 left-10 rotate-12" />
        <Illustration icon={Sparkles} className="w-32 h-32 bottom-20 right-10 -rotate-12" />
        
        <div className={cn(
          "relative z-10 flex flex-col",
          !isExport ? "h-full" : "min-h-screen"
        )}>
          <div className="flex items-center gap-12 mb-20">
            {avatar && (
              <div className="relative group">
                <div className="absolute inset-0 bg-black/5 rounded-[3rem] rotate-6 scale-105 group-hover:rotate-12 transition-transform duration-700" />
                <ImageReplace 
                  id="avatar" 
                  current={avatar} 
                  className={cn(
                    "rounded-[3rem] border-4 border-white shadow-2xl relative z-10 premium-lift",
                    layoutPlan.avatarSize === 'sm' ? "w-32 h-32" : "w-48 h-48"
                  )} 
                />
              </div>
            )}
            <div>
              <EditableNode id="name" label={typeof name === 'string' ? name : name.zh}>
                <h1 className="editorial-title italic -rotate-1" style={{ color: theme.primary, fontSize: `${4.5 * layoutPlan.fontSizeAdjust}rem` }}>
                  Hello! I'm <span className="underline decoration-black/10 decoration-wavy" style={{ decorationColor: theme.accent }}>
                    {renderBilingualText(typeof name === 'string' ? name.split(' ')[0] : { zh: name.zh.split(' ')[0], en: name.en.split(' ')[0] }, 'inline')}
                  </span>
                </h1>
              </EditableNode>
              <EditableNode id="title" label={typeof title === 'string' ? title : title.zh}>
                <div className="text-2xl font-bold mt-4 px-8 py-2 inline-block rounded-full shadow-lg" style={{ backgroundColor: theme.secondary, color: theme.primary }}>
                  {renderBilingualText(title, 'inline')}
                </div>
              </EditableNode>
            </div>
          </div>

          <SectionGrid 
            sections={sections}
            className="flex-1"
            renderSection={(section) => (
              <EditableNode 
                key={section.id} 
                id={section.id} 
                label={typeof section.label === 'string' ? section.label : section.label.zh}
                className="p-10 rounded-[3rem] border border-black/5 shadow-xl transition-all duration-700 premium-lift fade-in-section is-visible"
                material={section.material}
                backgroundColor={section.backgroundColor}
                position={section.position}
                isCollapsed={section.isCollapsed}
              >
                <div className="section-label mb-6 block" style={{ color: theme.primary }}>
                  {renderBilingualText(section.label, 'inline')}
                </div>
                {renderContent(section)}
              </EditableNode>
            )}
          />
        </div>
      </div>
    );
  }

  // Fallback to Editorial Big Title (updated for normalized data)
  return (
    <div className={cn(
      "flex flex-col p-12 relative",
      !isExport ? "h-full overflow-hidden" : "min-h-screen overflow-visible"
    )} style={{ backgroundColor: theme.background, fontFamily: theme.fontSans }}>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      <div className="absolute top-0 right-0 w-64 h-64 opacity-5 rounded-full blur-3xl" style={{ backgroundColor: theme.accent }} />
      
      {/* Decorative English Name for Poster Style */}
      {typeof name !== 'string' && name.en && (
        <div 
          className="absolute top-10 left-10 text-[12rem] font-black opacity-[0.03] pointer-events-none select-none uppercase tracking-tighter leading-none"
          style={{ color: theme.primary, fontFamily: theme.fontDisplay }}
        >
          {name.en}
        </div>
      )}

      <div className="relative z-10 mb-16">
        <div className="flex items-end justify-between border-b-2 pb-4" style={{ borderColor: theme.primary }}>
          <EditableNode id="name" label={typeof name === 'string' ? name : name.zh}>
            <h1 className="font-black uppercase leading-none tracking-tighter" style={{ 
              color: theme.primary, 
              fontFamily: theme.fontDisplay,
              fontSize: `${6 * layoutPlan.fontSizeAdjust}rem`
            }}>
              {renderBilingualText(name, 'stacked')}
            </h1>
          </EditableNode>
          <EditableNode id="title" label={typeof title === 'string' ? title : title.zh} className="text-right pb-2">
            <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: theme.muted }}>
              {renderBilingualText(title, 'inline')}
            </div>
          </EditableNode>
        </div>
      </div>

      <div className={cn(
        "grid grid-cols-12 gap-12 flex-1",
        !isExport && "overflow-hidden"
      )}>
        <div className="col-span-12">
          <SectionGrid 
            sections={sections}
            className="flex-1"
            renderSection={(section) => (
              <EditableNode 
                key={section.id} 
                id={section.id} 
                label={typeof section.label === 'string' ? section.label : section.label.zh} 
                className="space-y-4"
                material={section.material}
                backgroundColor={section.backgroundColor}
                position={section.position}
                isCollapsed={section.isCollapsed}
              >
                <div className="flex items-center gap-4">
                  <div className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.primary }}>
                    {renderBilingualText(section.label, 'inline')}
                  </div>
                  <div className="flex-1 h-px opacity-20" style={{ backgroundColor: theme.primary }} />
                </div>
                {renderContent(section)}
              </EditableNode>
            )}
          />
        </div>
      </div>
    </div>
  );
};
