
import React, { useState, useEffect } from 'react';

interface Props {
  onUnlock: () => void;
  isFlashlightOn: boolean;
  lowPowerMode: boolean;
  visualMode: 'dark' | 'transparent';
  onToggleFlashlight: () => void;
  language: 'en' | 'hi';
}

const LockScreen: React.FC<Props> = ({ 
  onUnlock, 
  isFlashlightOn, 
  lowPowerMode, 
  visualMode,
  onToggleFlashlight,
  language
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const t = (en: string, hi: string) => language === 'hi' ? hi : en;

  return (
    <div 
      className={`absolute inset-0 z-[100] flex flex-col items-center justify-between p-8 animate-fade-in overflow-hidden transition-all duration-1000 ${visualMode === 'transparent' ? 'backdrop-blur-2xl' : ''}`}
      style={{ backgroundColor: '#000' }}
    >
      <div className="w-full flex justify-between items-center px-4 mt-6 opacity-60">
        <div className="flex items-center space-x-2 text-white">
          <i className="fa-solid fa-lock text-[8px]"></i>
          <span className="text-[8px] font-black uppercase tracking-widest">{t('SECURE', 'सुरक्षित')}</span>
        </div>
        <i className="fa-solid fa-battery-three-quarters text-[10px] text-green-500"></i>
      </div>

      <div className="text-center">
        <h2 className="text-8xl font-thin tracking-tighter text-white">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
        </h2>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.4em] mt-2">
          {time.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="flex flex-col items-center space-y-8">
        <div 
          onClick={onToggleFlashlight}
          className={`w-20 h-20 rounded-3xl border flex items-center justify-center transition-all ${isFlashlightOn ? 'bg-white border-white text-black shadow-[0_0_30px_white]' : 'bg-white/5 border-white/10 text-gray-600'}`}
        >
          <i className="fa-solid fa-flashlight text-2xl"></i>
        </div>
        
        <div className="flex flex-col items-center space-y-4" onClick={onUnlock}>
          <div className="relative">
            <i className="fa-solid fa-fingerprint text-5xl text-blue-500/20"></i>
            <div className="absolute inset-0 bg-blue-500/5 blur-xl animate-pulse rounded-full"></div>
          </div>
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] animate-bounce">
            {t('TAP TO UNLOCK', 'खोलने के लिए छुएं')}
          </p>
        </div>
      </div>

      <div className="h-2 w-32 bg-white/10 rounded-full mb-4"></div>
    </div>
  );
};

export default LockScreen;
