import React from 'react';
import { SceneConfig, SceneType } from '../../types/profile';
import { cn } from '../../lib/utils';
import { Users, GraduationCap, BookOpen } from 'lucide-react';

interface SceneSelectorProps {
  scenes: SceneConfig[];
  currentSceneId: SceneType;
  onSelect: (id: SceneType) => void;
}

export const SceneSelector: React.FC<SceneSelectorProps> = ({ scenes, currentSceneId, onSelect }) => {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Scene</label>
      <div className="grid grid-cols-3 gap-2">
        {scenes.map((scene) => (
          <button
            key={scene.id}
            onClick={() => onSelect(scene.id)}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 gap-2",
              currentSceneId === scene.id
                ? "border-black bg-gray-50 shadow-sm"
                : "border-gray-100 bg-white hover:border-gray-300"
            )}
          >
            <div className={cn(
              "p-2 rounded-xl transition-colors",
              currentSceneId === scene.id ? "bg-black text-white" : "bg-gray-100 text-gray-400"
            )}>
              {scene.id === 'mentor' && <Users className="w-4 h-4" />}
              {scene.id === 'student' && <GraduationCap className="w-4 h-4" />}
              {scene.id === 'phd' && <BookOpen className="w-4 h-4" />}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tight">{scene.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
