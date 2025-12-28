
import React from 'react';
import { BorderSettings } from '../types';

interface Props {
  settings: BorderSettings;
  updateSettings: (s: Partial<BorderSettings>) => void;
}

const BorderTab: React.FC<Props> = ({ settings, updateSettings }) => {
  const PRESETS = {
    rainbow: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8b00ff'],
    cyber: ['#00f3ff', '#ff00ff', '#00f3ff'],
    lava: ['#ff4d00', '#ff0000', '#ff8c00'],
    forest: ['#00ff00', '#004400', '#adff2f']
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto pb-24">
      <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800">
        <div>
          <h3 className="font-bold text-lg">Border Animation</h3>
          <p className="text-gray-400 text-xs">Neon lights around your screen</p>
        </div>
        <button 
          onClick={() => updateSettings({ enabled: !settings.enabled })}
          className={`w-14 h-8 rounded-full relative transition-colors ${settings.enabled ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.enabled ? 'left-7' : 'left-1'}`} />
        </button>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium">Speed & Direction</label>
        <div className="flex gap-4 items-center">
           <input 
            type="range" min="1" max="10" 
            value={settings.speed}
            onChange={(e) => updateSettings({ speed: parseInt(e.target.value) })}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none accent-purple-500"
          />
          <button 
            onClick={() => updateSettings({ direction: settings.direction === 'clockwise' ? 'counter-clockwise' : 'clockwise' })}
            className="p-2 bg-gray-800 rounded-lg text-xs"
          >
            <i className={`fa-solid ${settings.direction === 'clockwise' ? 'fa-rotate-right' : 'fa-rotate-left'} mr-2`}></i>
            {settings.direction === 'clockwise' ? 'CW' : 'CCW'}
          </button>
        </div>

        <label className="block text-sm font-medium">Thickness</label>
        <input 
          type="range" min="1" max="20" 
          value={settings.thickness}
          onChange={(e) => updateSettings({ thickness: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none accent-pink-500"
        />

        <label className="block text-sm font-medium">Color Patterns</label>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(PRESETS).map(([name, colors]) => (
            <button
              key={name}
              onClick={() => updateSettings({ colors, pattern: name as any })}
              className={`p-3 rounded-lg border-2 transition-all capitalize flex items-center justify-between ${settings.pattern === name ? 'border-blue-500 bg-blue-900/20' : 'border-gray-800 bg-gray-900'}`}
            >
              <span>{name}</span>
              <div className="flex -space-x-1">
                {colors.slice(0, 3).map((c, i) => (
                  <div key={i} className="w-3 h-3 rounded-full border border-gray-900" style={{ backgroundColor: c }} />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BorderTab;
