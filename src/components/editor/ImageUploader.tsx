import React, { useRef } from 'react';
import { Camera, X, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ImageUploaderProps {
  label: string;
  value: string | string[];
  type: 'image' | 'gallery';
  onChange: (value: string | string[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ label, value, type, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const processFile = (file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'image') {
          onChange(base64);
        } else {
          const currentGallery = Array.isArray(value) ? value : [];
          if (currentGallery.length < 6) {
            onChange([...currentGallery, base64]);
          }
        }
      };
      reader.readAsDataURL(file);
    };

    if (type === 'image') {
      processFile(files[0]);
    } else {
      Array.from(files).slice(0, 6 - (Array.isArray(value) ? value.length : 0)).forEach(processFile);
    }
  };

  const removeImage = (index?: number) => {
    if (type === 'image') {
      onChange('');
    } else if (typeof index === 'number') {
      const currentGallery = Array.isArray(value) ? value : [];
      onChange(currentGallery.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</label>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple={type === 'gallery'}
        className="hidden"
      />
      
      {type === 'image' ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all",
            value ? "border-blue-500" : "border-gray-200 hover:border-gray-300"
          )}
        >
          {value ? (
            <>
              <img src={value as string} alt="Avatar" className="w-full h-full object-cover" />
              <button 
                onClick={(e) => { e.stopPropagation(); removeImage(); }}
                className="absolute top-1 right-1 p-1 bg-white/80 rounded-full shadow-sm hover:bg-white"
              >
                <X className="w-3 h-3 text-gray-600" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-400">
              <Camera className="w-6 h-6" />
              <span className="text-[10px]">上传头像</span>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {(Array.isArray(value) ? value : []).map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg border overflow-hidden group">
              <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
              <button 
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 p-1 bg-white/80 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-gray-600" />
              </button>
            </div>
          ))}
          {(Array.isArray(value) ? value.length : 0) < 6 && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-all"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
