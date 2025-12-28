
import React, { useState, useEffect } from 'react';
import { BorderSettings } from '../types';
import NeonBorder from './NeonBorder';

interface Props {
  onUnlock: () => void;
  isFlashlightOn: boolean;
  lowPowerMode: boolean;
  visualMode: 'dark' | 'transparent';
  onToggleFlashlight: () => void;
  language: 'en' | 'hi';
  borderSettings: BorderSettings;
}

type LockTab = 'IDENTITY' | 'UTILITY';

const LockScreen: React.FC<Props> = ({ 
  onUnlock, 
  isFlashlightOn, 
  lowPowerMode, 
  visualMode,
  onToggleFlashlight,
  language,
  borderSettings
}) => {
  const [time, setTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<LockTab>('IDENTITY');
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Battery Sync
    const updateBattery = async () => {
      try {
        if ('getBattery' in navigator) {
          const battery = await (navigator as any).getBattery();
          setBatteryLevel(Math.round(battery.level * 100));
          battery.addEventListener('levelchange', () => {
            setBatteryLevel(Math.round(battery.level * 100));
          });
        }
      } catch (e) {
        console.warn("Battery API not supported");
      }
    };
    updateBattery();

    return () => clearInterval(timer);
  }, []);

  const t = (en: string, hi: string) => language === 'hi' ? hi : en;
  const colorfulGradient = `linear-gradient(90deg, ${borderSettings.colors.join(', ')})`;

  return (
    <div 
      className={`absolute inset-0 z-[100] flex flex-col items-center justify-between p-8 animate-fade-in overflow-hidden transition-all duration-1000 ${visualMode === 'transparent' ? 'backdrop-blur-xl' : ''}`}
      style={{ backgroundColor: 'transparent' }}
    >
      <NeonBorder settings={borderSettings} />

      {/* Top Status Bar */}
      <div className="w-full flex justify-between items-center px-4 mt-10 opacity-60 relative z-10">
        <div className="flex items-center space-x-2 text-white">
          <i className="fa-solid fa-shield-halved text-[10px] text-blue-500"></i>
          <span className="text-[8px] font-black uppercase tracking-[0.2em]">{t('ENCRYPTED MODE', 'एन्क्रिप्टेड मोड')}</span>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-[8px] font-mono text-white/40 tracking-tighter italic">SEC-NET 5G</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-black text-white/60">{batteryLevel !== null ? `${batteryLevel}%` : '---'}</span>
              <i className={`fa-solid ${batteryLevel !== null && batteryLevel < 20 ? 'fa-battery-quarter text-red-500' : 'fa-battery-full text-emerald-500'} text-[10px]`}></i>
            </div>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col items-center justify-center relative z-10">
        {activeTab === 'IDENTITY' ? (
          <div className="flex flex-col items-center space-y-12 animate-fade-in">
            <div className="text-center">
              <h2 className="text-8xl font-black tracking-tighter text-white tabular-nums leading-none">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
              </h2>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] mt-6 bg-blue-500/5 py-2 px-6 rounded-full border border-blue-500/10">
                {time.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>

            <div className="flex flex-col items-center space-y-6" onClick={onUnlock}>
              <div className="relative group cursor-pointer active-scale">
                <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full scale-150 animate-pulse"></div>
                <div className="w-24 h-24 bg-white/[0.03] border border-white/10 rounded-full flex items-center justify-center backdrop-blur-md relative z-10 shadow-inner">
                  <i className="fa-solid fa-fingerprint text-5xl text-blue-500"></i>
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-400/60 blur-[1px] rounded-full animate-[scan_2.5s_infinite] z-20 pointer-events-none"></div>
              </div>
              <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">
                {t('SCAN TO UNLOCK', 'अनलॉक के लिए स्कैन करें')}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-10 animate-fade-in w-full max-w-xs">
            <div className="text-center mb-4">
               <h3 className="text-xl font-black italic tracking-tighter uppercase text-white/40">{t('UTILITY NODE', 'उपयोगिता नोड')}</h3>
            </div>

            <button 
              onClick={onToggleFlashlight}
              className={`w-36 h-36 rounded-[48px] border-2 flex flex-col items-center justify-center transition-all duration-500 active-scale ${isFlashlightOn ? 'bg-white border-white text-black shadow-[0_0_80px_rgba(255,255,255,0.5)]' : 'bg-white/5 border-white/10 text-gray-800'}`}
            >
              <i className={`fa-solid ${isFlashlightOn ? 'fa-bolt' : 'fa-bolt-flash'} text-5xl mb-1`}></i>
              <span className="text-[9px] font-black uppercase tracking-widest">{isFlashlightOn ? t('ACTIVE', 'सक्रिय') : t('LIGHT', 'रोशनी')}</span>
            </button>

            <div className="grid grid-cols-2 gap-4 w-full opacity-60">
               <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center space-y-2">
                  <i className="fa-solid fa-triangle-exclamation text-xl"></i>
                  <span className="text-[8px] font-black uppercase">SOS</span>
               </div>
               <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center space-y-2">
                  <i className="fa-solid fa-tower-broadcast text-xl"></i>
                  <span className="text-[8px] font-black uppercase">SIGNAL</span>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Tab Switcher with Enhanced Colorful Line */}
      <div className="relative z-10 mb-8 flex items-center space-x-2 bg-white/[0.03] p-2 rounded-3xl border border-white/5">
        <button 
          onClick={() => setActiveTab('IDENTITY')}
          className={`relative px-10 py-3.5 rounded-2xl text-[9px] font-black tracking-[0.2em] transition-all active-scale ${activeTab === 'IDENTITY' ? 'text-white' : 'text-white/20'}`}
        >
          {t('IDENTITY', 'पहचान')}
          {activeTab === 'IDENTITY' && (
             <div 
              className="absolute -bottom-1.5 left-2 right-2 h-[3px] rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)] z-10"
              style={{ background: colorfulGradient }}
             ></div>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('UTILITY')}
          className={`relative px-10 py-3.5 rounded-2xl text-[9px] font-black tracking-[0.2em] transition-all active-scale ${activeTab === 'UTILITY' ? 'text-white' : 'text-white/20'}`}
        >
          {t('UTILITY', 'उपयोगिता')}
          {activeTab === 'UTILITY' && (
             <div 
              className="absolute -bottom-1.5 left-2 right-2 h-[3px] rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)] z-10"
              style={{ background: colorfulGradient }}
             ></div>
          )}
        </button>
      </div>

      <div className="h-1 w-32 bg-white/5 rounded-full mb-6 relative z-10 overflow-hidden">
         <div className="h-full bg-blue-500/40 w-1/4 rounded-full animate-[shimmer_2.5s_infinite]"></div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 15%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 85%; opacity: 0; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
};

export default LockScreen;
