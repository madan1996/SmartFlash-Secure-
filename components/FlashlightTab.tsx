
import React, { useState, useEffect } from 'react';
import { FlashlightSettings } from '../types';

interface Props {
  settings: FlashlightSettings;
  updateSettings: (s: Partial<FlashlightSettings>) => void;
  language: 'en' | 'hi';
}

const FlashlightTab: React.FC<Props> = ({ settings, updateSettings, language }) => {
  const [heading, setHeading] = useState(0);

  const t = (en: string, hi: string) => language === 'hi' ? hi : en;

  // Compass Logic
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // Fix: Property 'webkitCompassHeading' does not exist on type 'DeviceOrientationEvent'
      // Use type assertion to any to access the non-standard webkitCompassHeading property
      const webkitHeading = (e as any).webkitCompassHeading;
      if (webkitHeading !== undefined && webkitHeading !== null) {
        setHeading(webkitHeading);
      } else if (e.alpha) {
        setHeading(360 - e.alpha);
      }
    };
    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  return (
    <div className="flex flex-col h-full p-6 space-y-8 overflow-y-auto pb-48 scrollbar-hide">
      
      {/* Compass / Orientation */}
      <div className="flex justify-center pt-4">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div 
            className="absolute inset-0 border border-white/10 rounded-full transition-transform duration-100"
            style={{ transform: `rotate(${-heading}deg)` }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-3 bg-red-500"></div>
            <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[8px] font-black">N</span>
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-black">S</span>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[8px] font-black">W</span>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black">E</span>
          </div>
          <div className="text-center">
            <p className="text-sm font-mono font-bold">{Math.round(heading)}°</p>
            <p className="text-[7px] text-gray-500 uppercase tracking-widest">{t('HEADING', 'दिशा')}</p>
          </div>
        </div>
      </div>

      {/* Main Flash Bulb */}
      <div className="flex flex-col items-center">
        <button 
          className={`w-44 h-44 rounded-full flex items-center justify-center transition-all duration-300 relative shadow-2xl active:scale-90`}
          style={{ 
            backgroundColor: settings.enabled ? settings.color : '#0d0d0d',
            boxShadow: settings.enabled ? `0 0 80px ${settings.color}44` : 'inset 0 0 40px #000'
          }}
          onClick={() => updateSettings({ enabled: !settings.enabled, strobeMode: 'static' })}
        >
          <i className={`fa-solid fa-lightbulb text-5xl transition-all ${settings.enabled ? 'text-black/50' : 'text-white/5'}`}></i>
          {settings.enabled && settings.strobeMode === 'sos' && (
            <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping"></div>
          )}
        </button>
        <div className="mt-6 text-center">
          <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] mb-1">{t('SHAKE TO TOGGLE', 'हिलाकर चालू करें')}</p>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-3xl font-mono font-black">{settings.brightness.toFixed(0)}</span>
            <span className="text-blue-500 text-xs font-bold uppercase tracking-widest">% {t('FLUX', 'रोशनी')}</span>
          </div>
        </div>
      </div>

      {/* SOS / Quick Modes */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => updateSettings({ strobeMode: 'static', enabled: !settings.enabled })}
          className={`p-4 rounded-3xl border flex items-center justify-center space-x-3 transition-all ${settings.strobeMode === 'static' && settings.enabled ? 'bg-blue-600 border-blue-400' : 'bg-white/5 border-white/5'}`}
        >
          <i className="fa-solid fa-power-off text-sm"></i>
          <span className="text-[10px] font-black uppercase">{t('NORMAL', 'सामान्य')}</span>
        </button>
        <button 
          onClick={() => updateSettings({ strobeMode: settings.strobeMode === 'sos' ? 'static' : 'sos', enabled: true })}
          className={`p-4 rounded-3xl border flex items-center justify-center space-x-3 transition-all ${settings.strobeMode === 'sos' ? 'bg-red-600 border-red-400 animate-pulse' : 'bg-white/5 border-white/5'}`}
        >
          <i className="fa-solid fa-triangle-exclamation text-sm"></i>
          <span className="text-[10px] font-black uppercase">{t('SOS', 'आपातकाल')}</span>
        </button>
      </div>

      {/* Power Regulator Slider */}
      <div className="p-8 bg-white/[0.02] rounded-[40px] border border-white/5">
        <div className="flex justify-between items-center mb-6">
           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('FLUX REGULATOR', 'पावर रेगुलेटर')}</p>
           <i className="fa-solid fa-sliders text-blue-500 text-xs"></i>
        </div>
        <input 
          type="range" min="0" max="2000" 
          value={settings.brightness}
          onChange={(e) => updateSettings({ brightness: parseInt(e.target.value), enabled: true })}
          className="w-full h-1.5 bg-black rounded-full appearance-none accent-blue-500 cursor-pointer"
        />
        <div className="flex justify-between mt-3 text-[8px] font-bold text-gray-700 uppercase">
          <span>{t('Eco', 'किफायती')}</span>
          <span>{t('Max Power', 'पूरी रोशनी')}</span>
        </div>
      </div>
    </div>
  );
};

export default FlashlightTab;
