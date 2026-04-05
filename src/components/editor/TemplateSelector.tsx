import React from 'react';
import { TemplateConfig } from '../../types/profile';
import { cn } from '../../lib/utils';

interface TemplateSelectorProps {
  templates: TemplateConfig[];
  currentTemplateId: string;
  onSelect: (id: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ templates, currentTemplateId, onSelect }) => {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Templates</label>
      <div className="grid grid-cols-1 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={cn(
              "group relative flex flex-col items-start p-4 rounded-2xl border transition-all duration-300 text-left",
              currentTemplateId === template.id
                ? "border-black bg-gray-50 shadow-sm"
                : "border-gray-100 bg-white hover:border-gray-300"
            )}
          >
            <div className="w-full aspect-[16/9] bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
               {/* Visual representation of the template */}
               <div className="absolute inset-0 flex flex-col p-3 gap-2 opacity-40 group-hover:opacity-60 transition-opacity">
                  {template.id === 'editorial_big_title' && (
                    <>
                      <div className="w-1/2 h-4 bg-black" />
                      <div className="w-full h-1 bg-gray-300" />
                      <div className="flex gap-2">
                        <div className="w-1/3 aspect-[3/4] bg-gray-400" />
                        <div className="flex-1 space-y-1">
                          <div className="w-full h-1 bg-gray-300" />
                          <div className="w-full h-1 bg-gray-300" />
                          <div className="w-2/3 h-1 bg-gray-300" />
                        </div>
                      </div>
                    </>
                  )}
                  {template.id === 'minimal_swiss' && (
                    <div className="grid grid-cols-3 grid-rows-3 gap-1 h-full">
                      <div className="col-span-2 row-span-1 bg-black" />
                      <div className="col-span-1 row-span-1 bg-gray-300" />
                      <div className="col-span-1 row-span-1 bg-gray-300" />
                      <div className="col-span-2 row-span-2 bg-gray-200" />
                    </div>
                  )}
                  {template.id === 'playful_designer' && (
                    <div className="flex flex-col gap-2 items-center justify-center h-full">
                       <div className="w-8 h-8 rounded-full bg-black" />
                       <div className="w-2/3 h-2 rounded-full bg-gray-300" />
                       <div className="flex gap-2 w-full">
                          <div className="flex-1 h-8 rounded-xl bg-gray-200" />
                          <div className="flex-1 h-8 rounded-xl bg-gray-200" />
                       </div>
                    </div>
                  )}
               </div>
               {currentTemplateId === template.id && (
                 <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                 </div>
               )}
            </div>
            <span className="text-xs font-bold">{template.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
