
import React, { useState, useEffect, useCallback } from 'react';
import { FlashlightSettings } from '../types';

interface Props {
  settings: FlashlightSettings;
  updateSettings: (s: Partial<FlashlightSettings>) => void;
  language: 'en' | 'hi';
  onError?: (e: DOMException) => void;
}

const FlashlightTab: React.FC<Props> = ({ settings, updateSettings, language, onError }) => {
  const [heading, setHeading] = useState(0);
  const [sensorStatus, setSensorStatus] = useState<'IDLE' | 'ACTIVE' | 'DENIED'>('IDLE');

  const t = (en: string, hi: string) => language === 'hi' ? hi : en;

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    const webkitHeading = (e as any).webkitCompassHeading;
    if (webkitHeading !== undefined && webkitHeading !== null) {
      setHeading(webkitHeading);
    } else if (e.alpha) {
      setHeading(360 - e.alpha);
    }
  }, []);

  const requestSensors = async () => {
    try {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          setSensorStatus('ACTIVE');
        } else {
          setSensorStatus('DENIED');
          onError?.(new DOMException("User denied orientation access", "NotAllowedError"));
        }
      } else {
        window.addEventListener('deviceorientation', handleOrientation, true);
        setSensorStatus('ACTIVE');
      }
    } catch (err) {
      setSensorStatus('DENIED');
      onError?.(new DOMException("Sensor initialization failed", "HardwareError"));
    }
  };

  useEffect(() => {
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [handleOrientation]);

  return (
    <div className="flex flex-col h-full p-8 space-y-10 overflow-y-auto pb-48 scrollbar-hide animate-fade-in">
      
      {/* Field Compass Component */}
      <div className="flex flex-col items-center">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <div 
            className="absolute inset-0 border-2 border-white/5 rounded-full transition-transform duration-300 ease-out shadow-inner bg-black"
            style={{ transform: `rotate(${-heading}deg)` }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-blue-500"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-gray-800"></div>
            <span className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-blue-500">N</span>
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-gray-700">S</span>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-gray-800"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-gray-800"></div>
          </div>
          <div className="relative z-10 text-center bg-black/80 p-4 rounded-full border border-white/5 backdrop-blur-sm w-24 h-24 flex flex-col justify-center items-center shadow-2xl">
            <p className="text-2xl font-mono font-black tracking-tighter tabular-nums">{Math.round(heading)}°</p>
            <p className="text-[7px] text-blue-500 font-black uppercase tracking-widest">{t('BEARING', 'दिशा')}</p>
          </div>
        </div>
        
        {sensorStatus === 'IDLE' && (
          <button 
            onClick={requestSensors}
            className="mt-6 text-[8px] font-black text-blue-500 border border-blue-500/20 px-4 py-1.5 rounded-full uppercase tracking-widest hover:bg-blue-500/10 active-scale"
          >
            {t('SYNC SENSORS', 'सेंसर सिंक करें')}
          </button>
        )}
      </div>

      {/* Primary Flux Bulb */}
      <div className="flex flex-col items-center">
        <button 
          className={`w-40 h-40 rounded-3xl flex items-center justify-center transition-all duration-300 relative active-scale`}
          style={{ 
            backgroundColor: settings.enabled ? settings.color : '#0a0a0a',
            boxShadow: settings.enabled ? `0 0 60px ${settings.color}33, inset 0 0 20px white/10` : 'inset 0 0 30px #000',
            border: settings.enabled ? '1px solid white' : '1px solid rgba(255,255,255,0.05)'
          }}
          onClick={() => updateSettings({ enabled: !settings.enabled, strobeMode: 'static' })}
        >
          <i className={`fa-solid fa-bolt text-5xl transition-all duration-500 ${settings.enabled ? 'text-black opacity-80' : 'text-gray-900'}`}></i>
          {settings.enabled && settings.strobeMode === 'sos' && (
            <div className="absolute inset-[-10px] rounded-[40px] border border-blue-500/30 animate-ping"></div>
          )}
        </button>
        <div className="mt-8 text-center space-y-1">
          <p className="text-sm font-mono font-black uppercase tracking-[0.2em] text-white flex items-center justify-center gap-2">
            {settings.brightness.toFixed(0)} <span className="text-[10px] text-blue-500">FLUX %</span>
          </p>
          <p className="text-[7px] text-gray-600 font-black uppercase tracking-widest italic">{t('GROUND UNIT ACTIVE', 'ग्राउंड यूनिट सक्रिय')}</p>
        </div>
      </div>

      {/* Field Control Grid */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => updateSettings({ strobeMode: 'static', enabled: true })}
          className={`p-5 rounded-2xl border transition-all flex items-center justify-center gap-3 active-scale ${settings.strobeMode === 'static' && settings.enabled ? 'bg-blue-600 border-white text-white' : 'bg-white/5 border-white/5 text-gray-600'}`}
        >
          <i className="fa-solid fa-power-off text-xs"></i>
          <span className="text-[10px] font-black uppercase tracking-widest">{t('STATIC', 'सामान्य')}</span>
        </button>
        <button 
          onClick={() => updateSettings({ strobeMode: settings.strobeMode === 'sos' ? 'static' : 'sos', enabled: true })}
          className={`p-5 rounded-2xl border transition-all flex items-center justify-center gap-3 active-scale ${settings.strobeMode === 'sos' ? 'bg-red-600 border-white text-white animate-pulse' : 'bg-white/5 border-white/5 text-gray-600'}`}
        >
          <i className="fa-solid fa-triangle-exclamation text-xs"></i>
          <span className="text-[10px] font-black uppercase tracking-widest">{t('SOS', 'एसओएस')}</span>
        </button>
      </div>

      {/* Regulator Section */}
      <div className="p-8 bg-black/40 rounded-[32px] border border-white/5 backdrop-blur-xl">
        <div className="flex justify-between items-center mb-6">
           <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">{t('INTENSITY REGULATOR', 'तीव्रता रेगुलेटर')}</p>
           <div className="flex gap-1">
             <div className={`w-1 h-1 rounded-full ${settings.brightness > 500 ? 'bg-blue-500' : 'bg-gray-800'}`}></div>
             <div className={`w-1 h-1 rounded-full ${settings.brightness > 1000 ? 'bg-blue-500' : 'bg-gray-800'}`}></div>
             <div className={`w-1 h-1 rounded-full ${settings.brightness > 1500 ? 'bg-blue-500' : 'bg-gray-800'}`}></div>
           </div>
        </div>
        <input 
          type="range" min="1" max="2000" 
          value={settings.brightness}
          onChange={(e) => updateSettings({ brightness: parseInt(e.target.value), enabled: true })}
          className="w-full h-1 bg-gray-900 rounded-full appearance-none accent-blue-500 cursor-pointer"
        />
        <div className="flex justify-between mt-4 text-[7px] font-black text-gray-700 uppercase tracking-widest">
          <span>MIN LOAD</span>
          <span>CRITICAL FLUX</span>
        </div>
      </div>
    </div>
  );
};

export default FlashlightTab;
