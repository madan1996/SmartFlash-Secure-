
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Tab, AppState, BorderSettings, FlashlightSettings, AppLog } from './types';
import NeonBorder from './components/NeonBorder';
import FlashlightTab from './components/FlashlightTab';
import BorderTab from './components/BorderTab';
import VaultTab from './components/VaultTab';
import LockScreen from './components/LockScreen';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    activeTab: Tab.FLASHLIGHT,
    isVaultLocked: true,
    isSystemLocked: true, 
    lowPowerMode: true,
    lockScreenMode: 'transparent',
    language: 'hi',
    flashlight: {
      enabled: false,
      brightness: 100,
      color: '#FFFFFF',
      strobeMode: 'static'
    },
    border: {
      enabled: true,
      speed: 5,
      thickness: 8,
      direction: 'clockwise',
      colors: ['#00f3ff', '#ff00ff', '#00f3ff'],
      pattern: 'cyber'
    },
    logs: []
  });

  const [uptime, setUptime] = useState(0);
  const [hardwareStats, setHardwareStats] = useState({
    cores: (navigator as any).hardwareConcurrency || 4,
    memory: (navigator as any).deviceMemory || 'Unknown',
    downlink: (navigator as any).connection?.downlink || 0
  });

  const lastShake = useRef<number>(0);

  const addLog = useCallback((message: string, type: AppLog['type'] = 'info') => {
    const newLog: AppLog = { timestamp: Date.now(), message, type };
    setState(prev => ({
      ...prev,
      logs: [newLog, ...prev.logs].slice(0, 50)
    }));
  }, []);

  // Standardized error handler using native DOMException
  const handleSystemError = useCallback((error: Error | DOMException, context: string) => {
    const errorMsg = `[${context}] ${error.name}: ${error.message}`;
    addLog(errorMsg, 'error');
    console.error(error);
  }, [addLog]);

  useEffect(() => {
    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      
      const threshold = 18; // Increased for "Field" use to prevent accidental triggers
      const magnitude = Math.sqrt(acc.x!**2 + acc.y!**2 + acc.z!**2);
      
      if (magnitude > threshold) {
        const now = Date.now();
        if (now - lastShake.current > 800) {
          lastShake.current = now;
          toggleFlashlight();
        }
      }
    };

    try {
      window.addEventListener('devicemotion', handleMotion);
    } catch (e) {
      handleSystemError(new DOMException("Acceleration telemetry unavailable", "HardwareError"), "MOTION");
    }
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [state.flashlight.enabled, handleSystemError]);

  useEffect(() => {
    const timer = setInterval(() => setUptime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const updateFlashlight = (update: Partial<FlashlightSettings>) => {
    setState(prev => ({ ...prev, flashlight: { ...prev.flashlight, ...update } }));
  };

  const toggleFlashlight = () => {
    setState(prev => {
      const newState = !prev.flashlight.enabled;
      addLog(state.language === 'hi' ? `फ्लैश: ${newState ? 'सक्रिय' : 'बंद'}` : `Flash: ${newState ? 'Active' : 'Off'}`, 'automation');
      return { ...prev, flashlight: { ...prev.flashlight, enabled: newState } };
    });
  };

  const updateBorder = (update: Partial<BorderSettings>) => {
    setState(prev => ({ ...prev, border: { ...prev.border, ...update } }));
  };

  const toggleLanguage = () => {
    setState(p => ({ ...p, language: p.language === 'en' ? 'hi' : 'en' }));
  };

  const t = (en: string, hi: string) => state.language === 'hi' ? hi : en;

  return (
    <div className="relative h-full w-full bg-[#000000] text-white overflow-hidden font-sans selection:bg-blue-500/30 transition-all duration-700">
      <NeonBorder settings={state.border} />

      {state.isSystemLocked && (
        <LockScreen 
          onUnlock={() => setState(p => ({ ...p, isSystemLocked: false }))}
          isFlashlightOn={state.flashlight.enabled}
          lowPowerMode={state.lowPowerMode}
          visualMode={state.lockScreenMode}
          onToggleFlashlight={toggleFlashlight}
          language={state.language}
        />
      )}

      <main className="relative z-10 h-full w-full flex flex-col max-w-2xl mx-auto border-x border-white/[0.03]">
        <header className="pt-14 px-8 pb-4 flex justify-between items-center shrink-0 bg-gradient-to-b from-black to-transparent">
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter text-white italic uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]"></span>
              {t('S.F. SECURE+', 'एस.एफ. सिक्योर+')}
            </h1>
            <p className="text-[7px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1">OPERATIONAL GROUND UNIT V4.6.2</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleLanguage} className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-[9px] font-black active-scale">
              {state.language === 'en' ? 'HINDI' : 'ENGLISH'}
            </button>
            <button onClick={() => setState(p => ({ ...p, isSystemLocked: true }))} className="bg-white/5 w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center active-scale">
              <i className="fa-solid fa-lock text-gray-400 text-xs"></i>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {state.activeTab === Tab.FLASHLIGHT && <FlashlightTab settings={state.flashlight} updateSettings={updateFlashlight} language={state.language} onError={(e) => handleSystemError(e, 'FLASHLIGHT')} />}
          {state.activeTab === Tab.BORDER && <BorderTab settings={state.border} updateSettings={updateBorder} language={state.language} />}
          {state.activeTab === Tab.VAULT && <VaultTab language={state.language} onError={(e) => handleSystemError(e, 'VAULT')} />}
          {state.activeTab === Tab.SETTINGS && (
            <div className="p-8 space-y-10 overflow-y-auto h-full pb-48 scrollbar-hide animate-fade-in">
               <div className="flex justify-between items-end">
                 <div>
                   <h2 className="text-3xl font-black tracking-tighter leading-none italic uppercase">{t('FIELD', 'फील्ड')}<br/>{t('DIAGNOSTICS', 'डायग्नोस्टिक्स')}</h2>
                   <p className="text-[8px] font-black text-gray-500 mt-2 uppercase tracking-widest">{t('SYSTEM HEALTH REPORT', 'सिस्टम हेल्थ रिपोर्ट')}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{t('SESSION ACTIVE', 'सत्र सक्रिय')}</p>
                   <p className="text-sm font-mono font-bold text-white/90">{(uptime/60).toFixed(0)}:{ (uptime%60).toString().padStart(2, '0') }</p>
                 </div>
               </div>
               
               <section className="grid grid-cols-2 gap-4">
                  {[
                    { label: t('CORE THREADS', 'कोर थ्रेड्स'), val: hardwareStats.cores, icon: 'fa-microchip', color: 'text-purple-500' },
                    { label: t('DEVICE MEMORY', 'डिवाइस मेमोरी'), val: `${hardwareStats.memory}GB`, icon: 'fa-memory', color: 'text-blue-500' },
                    { label: t('NETWORK BAND', 'नेटवर्क बैंड'), val: `${hardwareStats.downlink}MB`, icon: 'fa-wifi', color: 'text-emerald-500' },
                    { label: t('STORAGE LOAD', 'स्टोरेज लोड'), val: 'LOW', icon: 'fa-database', color: 'text-orange-500' }
                  ].map((item, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-32">
                      <div className="flex justify-between items-start">
                        <i className={`fa-solid ${item.icon} ${item.color} text-sm`}></i>
                        <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">{item.label}</span>
                      </div>
                      <p className="text-2xl font-mono font-black">{item.val}</p>
                    </div>
                  ))}
               </section>

               <section className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">{t('EVENT TELEMETRY', 'इवेंट टेलीमेट्री')}</h3>
                    <button onClick={() => setState(p => ({ ...p, logs: [] }))} className="text-[7px] font-black text-blue-500/50 uppercase tracking-widest">{t('PURGE', 'मिटाएं')}</button>
                  </div>
                  <div className="bg-black border border-white/10 rounded-2xl p-6 h-56 overflow-y-auto font-mono text-[8px] space-y-3 scrollbar-hide">
                    {state.logs.length === 0 ? (
                      <p className="text-gray-800 italic uppercase">{t('No telemetry detected...', 'कोई टेलीमेट्री नहीं मिली...')}</p>
                    ) : (
                      state.logs.map((log, i) => (
                        <div key={i} className={`flex space-x-3 border-b border-white/[0.03] pb-2 last:border-0 ${log.type === 'error' ? 'text-red-500' : ''}`}>
                          <span className="opacity-30 shrink-0">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                          <span className="flex-1 leading-relaxed">{log.message}</span>
                        </div>
                      ))
                    )}
                  </div>
               </section>
            </div>
          )}
        </div>

        <nav className="fixed bottom-0 left-0 right-0 h-28 bg-black border-t border-white/10 flex justify-around items-center px-4 z-[50] pb-8 max-w-2xl mx-auto">
          {[
            { tab: Tab.FLASHLIGHT, icon: 'fa-bolt', label: t('Light', 'लाइट') },
            { tab: Tab.BORDER, icon: 'fa-expand', label: t('Edge', 'एज') },
            { tab: Tab.VAULT, icon: 'fa-shield', label: t('Vault', 'वॉल्ट') },
            { tab: Tab.SETTINGS, icon: 'fa-compass', label: t('Diag', 'डायग') }
          ].map(({ tab, icon, label }) => (
            <button
              key={tab}
              onClick={() => setState(p => ({ ...p, activeTab: tab }))}
              className={`relative flex flex-col items-center transition-all duration-200 active-scale ${state.activeTab === tab ? 'text-blue-500' : 'text-gray-600'}`}
            >
              <div className={`mb-1 p-3.5 rounded-xl transition-all ${state.activeTab === tab ? 'bg-blue-500/5 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' : ''}`}>
                <i className={`fa-solid ${icon} text-lg`}></i>
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default App;
