import { useState, useMemo, useEffect, useRef } from 'react';
import { Download, Layout, Palette, Maximize, FileText, Settings2, MousePointer2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomCursor } from './components/ui/CustomCursor';
import { SceneType, ThemeType, SizePreset, ProfileData, BlockCustomization } from './types/profile';
import { SCENES } from './lib/scenes';
import { THEMES } from './lib/themes';
import { SceneSelector } from './components/editor/SceneSelector';
import { TemplateSelector } from './components/editor/TemplateSelector';
import { ThemeSelector } from './components/editor/ThemeSelector';
import { SizeSelector } from './components/editor/SizeSelector';
import { DynamicForm } from './components/editor/DynamicForm';
import { PreviewFrame } from './components/preview/PreviewFrame';
import { generateProfileHtml } from './lib/export';
import { downloadHtml } from './lib/utils';
import { normalizeProfileData, planLayout } from './lib/normalization';
import { cn } from './lib/utils';

export default function App() {
  const [profile, setProfile] = useState<ProfileData>({
    sceneId: 'mentor',
    templateId: 'luxury_editorial',
    themeId: 'luxury_gold',
    dragMode: 'auto',
    size: {
      preset: 'a4',
      width: 794,
      height: 1123,
    },
    content: {
      name: { zh: '维多利亚·沃尔顿', en: 'VICTORIA WOLTON' },
      title: { zh: '创意总监', en: 'Creative Director' },
      education: { 
        zh: '皇家艺术学院，设计硕士\n中央圣马丁学院，平面设计学士', 
        en: 'Royal College of Art, MA Design\nCentral Saint Martins, BA Graphic Design' 
      },
      teachingAreas: {
        zh: '编辑设计, 视觉识别, 字体排印, 品牌策略',
        en: 'Editorial Design, Visual Identity, Typography, Brand Strategy'
      },
      offerCases: {
        zh: 'Vogue, Nike, Apple, MoMA, Tate Modern',
        en: 'Vogue, Nike, Apple, MoMA, Tate Modern'
      },
      advantages: {
        zh: '充满好奇心的创意策略师，融合设计、文化与品牌心理学。我帮助初创企业打造大胆、人性化且令人难忘的品牌形象。',
        en: 'Obsessively curious creative strategist blending design, culture, and brand psychology. I help startups look bold, feel human, and sound unforgettable.'
      },
      skills: {
        zh: 'Figma, Adobe CC, 动效设计, 品牌识别, 内容策略',
        en: 'Figma, Adobe CC, Motion Graphics, Brand Identity, Content Strategy'
      },
      projects: [
        'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80'
      ],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
    },
  });

  const [activeTab, setActiveTab] = useState<'layout' | 'style' | 'content'>('layout');
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const currentScene = useMemo(() => SCENES.find(s => s.id === profile.sceneId)!, [profile.sceneId]);

  const normalizedData = useMemo(() => 
    normalizeProfileData(profile, currentScene), 
    [profile, currentScene]
  );

  const layoutPlan = useMemo(() => 
    planLayout(normalizedData), 
    [normalizedData]
  );

  const handleSceneChange = (id: SceneType) => {
    const newScene = SCENES.find(s => s.id === id)!;
    setProfile(prev => ({
      ...prev,
      sceneId: id,
      templateId: newScene.templates[0].id,
      themeId: newScene.defaultTheme,
    }));
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [fieldId]: value,
      },
    }));
  };

  const handleCustomizationChange = (fieldId: string, customization: BlockCustomization) => {
    setProfile(prev => ({
      ...prev,
      customization: {
        ...prev.customization,
        [fieldId]: customization,
      },
    }));
  };

  const handleDragChange = (fieldId: string, position: { x: number; y: number }) => {
    setProfile(prev => ({
      ...prev,
      customization: {
        ...prev.customization,
        [fieldId]: {
          ...prev.customization?.[fieldId],
          position,
        },
      },
    }));
  };

  const handleReorder = (newOrder: string[]) => {
    setProfile(prev => {
      const newCustomization = { ...prev.customization };
      newOrder.forEach((id, index) => {
        newCustomization[id] = {
          ...newCustomization[id],
          order: index,
        };
      });
      return {
        ...prev,
        customization: newCustomization,
      };
    });
  };

  const handleToggleCollapse = (fieldId: string) => {
    setProfile(prev => ({
      ...prev,
      customization: {
        ...prev.customization,
        [fieldId]: {
          ...prev.customization?.[fieldId],
          isCollapsed: !prev.customization?.[fieldId]?.isCollapsed,
        },
      },
    }));
  };

  const handleAddSection = () => {
    const id = `custom_${Date.now()}`;
    setProfile(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [id]: { zh: '在这里输入内容...', en: 'Enter content here...' },
      },
    }));
  };

  const handleDeleteSection = (id: string) => {
    setProfile(prev => {
      const newContent = { ...prev.content };
      delete newContent[id];
      const newCustomization = { ...prev.customization };
      delete newCustomization[id];
      return {
        ...prev,
        content: newContent,
        customization: newCustomization,
      };
    });
  };

  const handleSectionSelect = (sectionId: string) => {
    setActiveSection(sectionId);
    setActiveTab('content');
    // Scroll editor to section
    setTimeout(() => {
      const element = document.getElementById(`field-${sectionId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleExport = () => {
    // Extract all styles from the current document to make the export self-contained and offline-ready
    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          // We only want to include styles that are part of the app (Tailwind, etc.)
          // and skip external ones that might throw CORS errors or are already handled (like Google Fonts)
          return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
        } catch (e) {
          return '';
        }
      })
      .join('\n');

    const html = generateProfileHtml(profile, styles);
    downloadHtml(html, `portfolio-${profile.sceneId}-${Date.now()}.html`);
  };

  return (
    <div className="flex h-screen bg-[#FDFDFD] text-[#1A1A1A] overflow-hidden font-sans selection:bg-black selection:text-white">
      <CustomCursor />
      
      {/* Sidebar / Design Panel */}
      <aside className="w-[400px] flex flex-col bg-white border-r border-gray-100 z-20">
        <header className="p-10 pb-6">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tighter font-display uppercase">Studio</h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Editorial Tool</p>
              </div>
            </div>
            <button 
              onClick={handleExport}
              className="p-3 hover:bg-gray-50 rounded-2xl transition-all duration-300 active:scale-90"
            >
              <Download className="w-5 h-5 text-gray-400 hover:text-black" />
            </button>
          </div>

          <nav className="flex gap-8 border-b border-gray-50">
            {(['layout', 'style', 'content'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
                  activeTab === tab ? "text-black" : "text-gray-300 hover:text-gray-500"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-black" 
                  />
                )}
              </button>
            ))}
          </nav>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 pt-4 space-y-10">
          <AnimatePresence mode="wait">
            {activeTab === 'layout' && (
              <motion.div 
                key="layout"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-10"
              >
                <SceneSelector 
                  scenes={SCENES} 
                  currentSceneId={profile.sceneId} 
                  onSelect={handleSceneChange} 
                />
                <TemplateSelector 
                  templates={currentScene.templates} 
                  currentTemplateId={profile.templateId} 
                  onSelect={(id) => setProfile(prev => ({ ...prev, templateId: id }))} 
                />
              </motion.div>
            )}

            {activeTab === 'style' && (
              <motion.div 
                key="style"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-10"
              >
                <ThemeSelector 
                  currentThemeId={profile.themeId} 
                  onSelect={(id) => setProfile(prev => ({ ...prev, themeId: id }))} 
                />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Drag Mode</label>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      {(['auto', 'free'] as const).map(mode => (
                        <button
                          key={mode}
                          onClick={() => setProfile(prev => ({ ...prev, dragMode: mode }))}
                          className={cn(
                            "px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                            profile.dragMode === mode ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-gray-600"
                          )}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[9px] text-gray-400 italic">
                    {profile.dragMode === 'free' ? 'Free drag mode: Move blocks anywhere on the canvas.' : 'Auto mode: Blocks follow the template grid.'}
                  </p>
                </div>
                <SizeSelector 
                  currentPreset={profile.size.preset}
                  width={profile.size.width}
                  height={profile.size.height}
                  onSelect={(preset, w, h) => setProfile(prev => ({ 
                    ...prev, 
                    size: { preset, width: w ?? prev.size.width, height: h ?? prev.size.height } 
                  }))}
                />
              </motion.div>
            )}

            {activeTab === 'content' && (
              <motion.div 
                key="content"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-10"
              >
                <button
                  onClick={handleAddSection}
                  className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] font-black text-gray-300 uppercase tracking-widest hover:border-black hover:text-black transition-all"
                >
                  + Add Custom Section
                </button>
                <DynamicForm 
                  schema={[
                    ...currentScene.schema,
                    ...Object.keys(profile.content)
                      .filter(id => id.startsWith('custom_'))
                      .map(id => ({
                        id,
                        label: { zh: '自定义版块', en: 'CUSTOM SECTION' },
                        type: 'textarea' as const,
                        bilingual: true
                      }))
                  ]} 
                  data={profile.content} 
                  customization={profile.customization || {}}
                  onChange={handleFieldChange} 
                  onCustomizationChange={handleCustomizationChange}
                  onDeleteSection={handleDeleteSection}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="p-10 border-t border-gray-50">
          <button 
            onClick={handleExport}
            className="w-full py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-900 transition-all shadow-xl shadow-black/10 active:scale-95"
          >
            Generate Portfolio
          </button>
        </footer>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 relative flex flex-col overflow-hidden bg-[#FDFDFD]">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 via-white to-rose-50/20 pointer-events-none" />
        
        <header className="h-20 bg-white/40 backdrop-blur-2xl border-b border-gray-100 flex items-center justify-between px-10 z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Creative Engine</span>
            </div>
            <div className="h-4 w-px bg-gray-100" />
            <span className="text-[10px] font-mono text-gray-300 tracking-wider">
              {profile.size.width} × {profile.size.height} PX
            </span>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="px-4 py-1.5 bg-white/50 backdrop-blur-md rounded-full text-[10px] font-black text-gray-400 border border-gray-100">
                {Math.round((profile.size.width / 794) * 100)}%
             </div>
             <button className="p-2.5 hover:bg-white rounded-2xl transition-all duration-300 text-gray-300 hover:text-black">
                <Maximize className="w-4 h-4" />
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none paper-grid" />
          
          <div className="absolute inset-0 flex items-center justify-center p-16">
            <PreviewFrame 
              data={profile} 
              normalizedData={normalizedData}
              layoutPlan={layoutPlan}
              activeSection={activeSection}
              onSectionSelect={handleSectionSelect}
              onUpdateField={handleFieldChange}
              onDragChange={handleDragChange}
              onReorder={handleReorder}
              onToggleCollapse={handleToggleCollapse}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

