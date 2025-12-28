
import React from 'react';
import { BorderSettings } from '../types';

interface Props {
  settings: BorderSettings;
  updateSettings: (s: Partial<BorderSettings>) => void;
  language: 'en' | 'hi';
}

const BorderTab: React.FC<Props> = ({ settings, updateSettings, language }) => {
  const t = (en: string, hi: string) => language === 'hi' ? hi : en;

  const PRESETS = {
    rainbow: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8b00ff'],
    cyber: ['#00f3ff', '#ff00ff', '#00f3ff'],
    lava: ['#ff4d00', '#ff0000', '#ff8c00'],
    forest: ['#00ff00', '#004400', '#adff2f']
  };

  return (
    <div className="flex flex-col h-full p-8 space-y-10 overflow-y-auto pb-48 scrollbar-hide animate-fade-in">
      <div className="flex items-center justify-between p-6 bg-white/[0.03] rounded-[32px] border border-white/5">
        <div>
          <h3 className="font-black text-xl italic uppercase tracking-tighter">{t('BORDER EFFECT', 'बॉर्डर इफेक्ट')}</h3>
          <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mt-1">{t('DYNAMIC NEON EDGE', 'डायनामिक नियॉन एज')}</p>
        </div>
        <button 
          onClick={() => updateSettings({ enabled: !settings.enabled })}
          className={`w-16 h-8 rounded-full relative transition-all active-scale ${settings.enabled ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-gray-800'}`}
        >
          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${settings.enabled ? 'left-9' : 'left-1'}`} />
        </button>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between px-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('SPEED & DIRECTION', 'गति और दिशा')}</label>
            <span className="text-[10px] font-mono font-bold text-blue-500">{settings.speed}x</span>
          </div>
          <div className="flex gap-4 items-center bg-black/40 p-4 rounded-3xl border border-white/5">
             <input 
              type="range" min="1" max="10" 
              value={settings.speed}
              onChange={(e) => updateSettings({ speed: parseInt(e.target.value) })}
              className="flex-1 h-1.5 bg-gray-900 rounded-full appearance-none accent-blue-500"
            />
            <button 
              onClick={() => updateSettings({ direction: settings.direction === 'clockwise' ? 'counter-clockwise' : 'clockwise' })}
              className="w-12 h-12 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center text-blue-500 active-scale"
            >
              <i className={`fa-solid ${settings.direction === 'clockwise' ? 'fa-rotate-right' : 'fa-rotate-left'}`}></i>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between px-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('THICKNESS', 'मोटाई')}</label>
            <span className="text-[10px] font-mono font-bold text-blue-500">{settings.thickness}px</span>
          </div>
          <div className="bg-black/40 p-6 rounded-3xl border border-white/5">
            <input 
              type="range" min="1" max="25" 
              value={settings.thickness}
              onChange={(e) => updateSettings({ thickness: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-gray-900 rounded-full appearance-none accent-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{t('COLOR SCHEMES', 'रंग योजना')}</label>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(PRESETS).map(([name, colors]) => (
              <button
                key={name}
                onClick={() => updateSettings({ colors, pattern: name as any })}
                className={`p-5 rounded-[28px] border transition-all active-scale flex flex-col items-start gap-4 ${settings.pattern === name ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 bg-white/5'}`}
              >
                <div className="flex -space-x-2">
                  {colors.slice(0, 4).map((c, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border-2 border-black shadow-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">{t(name.toUpperCase(), name === 'rainbow' ? 'इंद्रधनुष' : name === 'cyber' ? 'साइबर' : name === 'lava' ? 'लावा' : 'जंगल')}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorderTab;
