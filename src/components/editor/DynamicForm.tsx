import React from 'react';
import { FieldSchema, BilingualValue, BlockCustomization, MaterialType } from '../../types/profile';
import { ImageUploader } from './ImageUploader';
import { cn } from '../../lib/utils';

interface DynamicFormProps {
  schema: FieldSchema[];
  data: Record<string, any>;
  customization: Record<string, BlockCustomization>;
  onChange: (fieldId: string, value: any) => void;
  onCustomizationChange: (fieldId: string, customization: BlockCustomization) => void;
  onDeleteSection?: (fieldId: string) => void;
}

const BlockCustomizer: React.FC<{
  fieldId: string;
  customization?: BlockCustomization;
  onChange: (fieldId: string, customization: BlockCustomization) => void;
}> = ({ fieldId, customization, onChange }) => {
  const materials: MaterialType[] = ['flat', 'soft', 'glass', 'accent'];
  
  return (
    <div className="mt-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Block Style</span>
        <div className="flex gap-1">
          {materials.map(m => (
            <button
              key={m}
              onClick={() => onChange(fieldId, { ...customization, material: m })}
              className={cn(
                "px-2 py-1 text-[8px] font-bold uppercase tracking-wider rounded-md transition-all",
                (customization?.material === m || (!customization?.material && m === 'flat'))
                  ? "bg-black text-white"
                  : "bg-white text-gray-400 hover:bg-gray-100"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Custom Color</span>
        <div className="flex items-center gap-2">
          {customization?.backgroundColor && (
            <button 
              onClick={() => onChange(fieldId, { ...customization, backgroundColor: undefined })}
              className="text-[8px] font-bold text-rose-500 uppercase tracking-widest"
            >
              Reset
            </button>
          )}
          <input 
            type="color" 
            value={customization?.backgroundColor || '#ffffff'} 
            onChange={(e) => onChange(fieldId, { ...customization, backgroundColor: e.target.value })}
            className="w-6 h-6 rounded-lg overflow-hidden cursor-pointer border-none p-0 bg-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export const DynamicForm: React.FC<DynamicFormProps> = ({ 
  schema, 
  data, 
  customization,
  onChange,
  onCustomizationChange,
  onDeleteSection
}) => {
  const renderField = (field: FieldSchema) => {
    const value = data[field.id];
    const labelZh = typeof field.label === 'string' ? field.label : field.label.zh;
    const labelEn = typeof field.label === 'string' ? '' : field.label.en;

    const isIdentity = ['name', 'title', 'avatar'].includes(field.id);
    const isCustom = field.id.startsWith('custom_');

    const fieldContent = (() => {
      if (field.type === 'image' || field.type === 'gallery') {
        return (
          <ImageUploader
            label={labelZh}
            type={field.type}
            value={value || (field.type === 'gallery' ? [] : '')}
            onChange={(val) => onChange(field.id, val)}
          />
        );
      }

      if (field.bilingual) {
        const zhValue = (typeof value === 'object' && value !== null && 'zh' in value) ? (value as BilingualValue).zh : (value || '');
        const enValue = (typeof value === 'object' && value !== null && 'en' in value) ? (value as BilingualValue).en : '';

        const handleZhChange = (val: string) => onChange(field.id, { zh: val, en: enValue });
        const handleEnChange = (val: string) => onChange(field.id, { zh: zhValue, en: val });

        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{labelZh}</label>
                <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest bg-gray-100 px-1.5 py-0.5 rounded">ZH</span>
              </div>
              {field.type === 'text' ? (
                <input
                  type="text"
                  value={zhValue}
                  onChange={(e) => handleZhChange(e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 text-sm bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              ) : (
                <textarea
                  value={zhValue}
                  onChange={(e) => handleZhChange(e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 text-sm bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent min-h-[100px] resize-none transition-all"
                />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{labelEn || 'English'}</label>
                <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest bg-gray-100 px-1.5 py-0.5 rounded">EN</span>
              </div>
              {field.type === 'text' ? (
                <input
                  type="text"
                  value={enValue}
                  onChange={(e) => handleEnChange(e.target.value)}
                  placeholder="English translation..."
                  className="w-full px-4 py-3 text-sm bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent italic transition-all"
                />
              ) : (
                <textarea
                  value={enValue}
                  onChange={(e) => handleEnChange(e.target.value)}
                  placeholder="English translation..."
                  className="w-full px-4 py-3 text-sm bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent min-h-[100px] resize-none italic transition-all"
                />
              )}
              {(field.type === 'list' || field.type === 'taglist') && (
                <p className="text-[10px] text-gray-400 italic">
                  {field.type === 'list' ? 'Ensure line counts match for ZH/EN' : 'Ensure tag counts match for ZH/EN'}
                </p>
              )}
            </div>
          </div>
        );
      }

      // Non-bilingual fields
      return (
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{labelZh}</label>
          {field.type === 'textarea' || field.type === 'list' || field.type === 'taglist' ? (
            <textarea
              value={value || ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-4 py-3 text-sm bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent min-h-[100px] resize-none transition-all"
            />
          ) : (
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-4 py-3 text-sm bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          )}
        </div>
      );
    })();

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">{fieldContent}</div>
          {isCustom && onDeleteSection && (
            <button
              onClick={() => onDeleteSection(field.id)}
              className="ml-4 p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              title="Delete Section"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </button>
          )}
        </div>
        {!isIdentity && (
          <BlockCustomizer 
            fieldId={field.id} 
            customization={customization[field.id]} 
            onChange={onCustomizationChange} 
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {schema.map((field) => (
        <div key={field.id} id={`field-${field.id}`}>
          {renderField(field)}
        </div>
      ))}
    </div>
  );
};
