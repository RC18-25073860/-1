import { ProfileData, NormalizedProfileData, LayoutPlan, SceneConfig } from '../types/profile';

/**
 * Normalizes raw form data into a structured format for templates.
 * Ensures every field in the schema is represented.
 */
export function normalizeProfileData(data: ProfileData, scene: SceneConfig): NormalizedProfileData {
  const { content } = data;
  
  // Basic identity fields
  const name = content.name || 'Untitled Profile';
  const title = content.title || content.school || content.currentInstitution || '';
  const avatar = content.avatar;

  // Mock avatar processing pipeline
  const avatarGrayscale = avatar ? `${avatar}?grayscale=true` : undefined;
  const avatarNoBg = avatar ? `${avatar}?nobg=true` : undefined;

  // Map all schema fields to sections
  const schemaIds = scene.schema.map(f => f.id);
  const customIds = Object.keys(content).filter(id => !schemaIds.includes(id) && !['name', 'title', 'avatar'].includes(id));
  
  const allFields = [
    ...scene.schema.filter(field => !['name', 'title', 'avatar'].includes(field.id)),
    ...customIds.map(id => ({
      id,
      label: { zh: '自定义版块', en: 'CUSTOM SECTION' },
      type: 'textarea' as const,
      bilingual: true
    }))
  ];

  const sections = allFields
    .map(field => {
      let value = content[field.id];
      
      // Default values based on type if missing
      if (value === undefined || value === null) {
        if (field.type === 'list' || field.type === 'taglist' || field.type === 'gallery') {
          value = [];
        } else if (field.bilingual) {
          value = { zh: '', en: '' };
        } else {
          value = '';
        }
      }

      // Consistent formatting for list types
      if (field.type === 'list' || field.type === 'taglist') {
        if (typeof value === 'string') {
          const lines = field.type === 'list' 
            ? value.split('\n') 
            : value.split(/[,\n]/);
          value = lines.filter(line => line.trim() !== '');
          if (field.bilingual) {
            value = value.map((line: string) => ({ zh: line, en: '' }));
          }
        } else if (field.bilingual && typeof value === 'object' && value !== null) {
          // Handle bilingual object { zh: string, en: string } for list/taglist
          const zhRaw = (value as any).zh || '';
          const enRaw = (value as any).en || '';
          
          const zhLines = (field.type === 'list' ? zhRaw.split('\n') : zhRaw.split(/[,\n]/))
            .filter((l: string) => l.trim() !== '');
          const enLines = (field.type === 'list' ? enRaw.split('\n') : enRaw.split(/[,\n]/))
            .filter((l: string) => l.trim() !== '');
            
          const maxLines = Math.max(zhLines.length, enLines.length);
          const zipped = [];
          for (let i = 0; i < maxLines; i++) {
            zipped.push({
              zh: zhLines[i] || '',
              en: enLines[i] || ''
            });
          }
          value = zipped;
        } else if (!Array.isArray(value)) {
          value = [];
        }
      }

      const customization = data.customization?.[field.id] || {};
      
      // Default material suggestions based on type if not explicitly set
      let material = customization.material;
      if (!material) {
        if (field.type === 'gallery') material = 'glass';
        else if (field.type === 'taglist' || field.type === 'list') material = 'soft';
        else material = 'flat';
      }

      return {
        id: field.id,
        label: field.label,
        type: field.type,
        value,
        material,
        backgroundColor: customization.backgroundColor,
        position: customization.position,
        isCollapsed: customization.isCollapsed,
        order: customization.order,
      };
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter(section => {
      // Only include sections with content
      if (Array.isArray(section.value)) return section.value.length > 0;
      if (typeof section.value === 'object' && section.value !== null) {
        return section.value.zh !== '' || section.value.en !== '';
      }
      return section.value !== '';
    });

  return {
    name,
    title,
    avatar,
    avatarGrayscale,
    avatarNoBg,
    sections,
  };
}

/**
 * Content-aware layout planner.
 * Adjusts layout parameters based on the density and type of content.
 */
export function planLayout(normalized: NormalizedProfileData): LayoutPlan {
  const { sections, name } = normalized;
  
  // Calculate content density
  const totalChars = sections.reduce((acc, s) => {
    if (typeof s.value === 'string') return acc + s.value.length;
    if (Array.isArray(s.value)) {
      return acc + s.value.reduce((sum, item) => {
        if (typeof item === 'string') return sum + item.length;
        if (typeof item === 'object' && item !== null) return sum + (item.zh?.length || 0) + (item.en?.length || 0);
        return sum;
      }, 0);
    }
    if (typeof s.value === 'object' && s.value !== null) {
      return acc + (s.value.zh?.length || 0) + (s.value.en?.length || 0);
    }
    return acc;
  }, 0);

  const hasGallery = sections.some(s => s.type === 'gallery');
  const sectionCount = sections.length;

  // Layout logic
  let heroSize: LayoutPlan['heroSize'] = 'standard';
  let avatarSize: LayoutPlan['avatarSize'] = 'md';
  let sectionDensity: LayoutPlan['sectionDensity'] = 'normal';
  let fontSizeAdjust = 1.0;

  // Adjust for long names
  const nameStr = typeof name === 'string' ? name : name.zh;
  if (nameStr.length > 20) fontSizeAdjust = 0.85;
  if (nameStr.length > 30) fontSizeAdjust = 0.7;

  // Adjust for content volume
  if (totalChars > 1500 || sectionCount > 6) {
    sectionDensity = 'tight';
    heroSize = 'compact';
    avatarSize = 'sm';
    fontSizeAdjust *= 0.9;
  } else if (totalChars < 500 && sectionCount < 4) {
    sectionDensity = 'relaxed';
    heroSize = 'large';
    avatarSize = 'lg';
  }

  return {
    heroSize,
    avatarSize,
    sectionDensity,
    galleryMode: hasGallery ? 'grid' : 'grid',
    columnBalance: sectionCount > 4 ? 'main-aside' : 'equal',
    fontSizeAdjust,
  };
}
