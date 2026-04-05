export type SceneType = 'mentor' | 'student' | 'phd';
export type ThemeType = 'black_white' | 'academic_blue' | 'warm_beige' | 'dark_portfolio' | 'luxury_gold' | 'red_accent';
export type SizePreset = 'a4' | 'long' | 'custom';

export interface ThemeTokens {
  label: string;
  primary: string;
  secondary: string;
  background: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  gradient?: string;
  fontSans?: string;
  fontSerif?: string;
  fontDisplay?: string;
}

export interface FieldSchema {
  id: string;
  label: string | BilingualValue;
  type: 'text' | 'textarea' | 'list' | 'taglist' | 'image' | 'gallery';
  placeholder?: string;
  bilingual?: boolean;
}

export interface TemplateConfig {
  id: string;
  label: string;
  thumbnail?: string;
}

export interface SceneConfig {
  id: SceneType;
  label: string;
  templates: TemplateConfig[];
  defaultTheme: ThemeType;
  supportedSizes: SizePreset[];
  schema: FieldSchema[];
}

export type MaterialType = 'flat' | 'soft' | 'glass' | 'accent';

export interface BlockCustomization {
  material?: MaterialType;
  backgroundColor?: string;
  position?: { x: number; y: number };
  isCollapsed?: boolean;
  order?: number;
}

export interface ProfileData {
  sceneId: SceneType;
  templateId: string;
  themeId: ThemeType;
  dragMode: 'auto' | 'free';
  size: {
    preset: SizePreset;
    width: number;
    height: number;
  };
  content: Record<string, any>;
  customization?: Record<string, BlockCustomization>;
}

export interface BilingualValue {
  zh: string;
  en: string;
}

export interface NormalizedProfileData {
  name: string | BilingualValue;
  title: string | BilingualValue;
  avatar?: string;
  avatarGrayscale?: string;
  avatarNoBg?: string;
  sections: Array<{
    id: string;
    label: string | BilingualValue;
    type: FieldSchema['type'];
    value: any; // Can be string | BilingualValue | string[] | BilingualValue[]
    material?: MaterialType;
    backgroundColor?: string;
    position?: { x: number; y: number };
    isCollapsed?: boolean;
    order?: number;
  }>;
}

export interface LayoutPlan {
  heroSize: 'compact' | 'standard' | 'large';
  avatarSize: 'sm' | 'md' | 'lg';
  sectionDensity: 'relaxed' | 'normal' | 'tight';
  galleryMode: 'grid' | 'masonry' | 'carousel';
  columnBalance: 'equal' | 'main-aside' | 'aside-main';
  fontSizeAdjust: number; // multiplier
}
