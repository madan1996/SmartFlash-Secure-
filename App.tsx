
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
  const lastShake = useRef<number>(0);

  // Shake detection logic
  useEffect(() => {
    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      
      const threshold = 15;
      const magnitude = Math.sqrt(acc.x!**2 + acc.y!**2 + acc.z!**2);
      
      if (magnitude > threshold) {
        const now = Date.now();
        if (now - lastShake.current > 1000) { // Throttle shake
          lastShake.current = now;
          toggleFlashlight();
          addLog(state.language === 'hi' ? 'Shake: रोशनी टॉगल की गई' : 'Shake: Flash toggled', 'automation');
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [state.flashlight.enabled, state.language]);

  useEffect(() => {
    const timer = setInterval(() => setUptime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const addLog = useCallback((message: string, type: AppLog['type'] = 'info') => {
    const newLog: AppLog = { timestamp: Date.now(), message, type };
    setState(prev => ({
      ...prev,
      logs: [newLog, ...prev.logs].slice(0, 50)
    }));
  }, []);

  const updateFlashlight = (update: Partial<FlashlightSettings>) => {
    setState(prev => ({ ...prev, flashlight: { ...prev.flashlight, ...update } }));
  };

  const toggleFlashlight = () => {
    setState(prev => ({ 
      ...prev, 
      flashlight: { ...prev.flashlight, enabled: !prev.flashlight.enabled } 
    }));
  };

  const updateBorder = (update: Partial<BorderSettings>) => {
    setState(prev => ({ ...prev, border: { ...prev.border, ...update } }));
  };

  const toggleLanguage = () => {
    setState(p => ({ ...p, language: p.language === 'en' ? 'hi' : 'en' }));
  };

  const t = (en: string, hi: string) => state.language === 'hi' ? hi : en;

  return (
    <div className="relative h-full w-full bg-[#050505] text-white overflow-hidden font-sans selection:bg-blue-500/30 transition-all duration-700">
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

      <main className="relative z-10 h-full w-full flex flex-col max-w-2xl mx-auto border-x border-white/[0.02]">
        <header className="pt-12 px-6 pb-2 flex justify-between items-center shrink-0">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-emerald-400 to-indigo-500 italic uppercase">
              {t('SecureFlash+', 'सिक्योरफ्लैश+')}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
               <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${state.flashlight.enabled ? 'bg-blue-500 shadow-[0_0_8px_blue]' : 'bg-green-500 shadow-[0_0_8px_green]'}`}></span>
               <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.2em] leading-none">v4.5.0 FIELD-GRADE / GROUND OPTIMIZED</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={toggleLanguage} className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-bold">
              {state.language === 'en' ? 'हिन्दी' : 'EN'}
            </button>
            <button onClick={() => setState(p => ({ ...p, isSystemLocked: true }))} className="bg-white/5 p-2 px-4 rounded-xl border border-white/10">
              <i className="fa-solid fa-power-off text-gray-400 text-xs"></i>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {state.activeTab === Tab.FLASHLIGHT && <FlashlightTab settings={state.flashlight} updateSettings={updateFlashlight} language={state.language} />}
          {state.activeTab === Tab.BORDER && <BorderTab settings={state.border} updateSettings={updateBorder} language={state.language} />}
          {state.activeTab === Tab.VAULT && <VaultTab language={state.language} />}
          {state.activeTab === Tab.SETTINGS && (
            <div className="p-6 space-y-8 overflow-y-auto h-full pb-48 scrollbar-hide animate-fade-in">
               <div className="flex justify-between items-end">
                 <h2 className="text-4xl font-black italic tracking-tighter leading-none">{t('GROUND', 'धरातल')}<br/>{t('STATUS', 'स्टेटस')}</h2>
                 <div className="text-right">
                   <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{t('FIELD UPTIME', 'फील्ड अपटाइम')}</p>
                   <p className="text-sm font-mono font-bold text-white/90">{(uptime/60).toFixed(0)}m {uptime%60}s</p>
                 </div>
               </div>
               
               {/* Field Telemetry Grid */}
               <section className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5">
                    <div className="flex justify-between items-start mb-2">
                      <i className="fa-solid fa-signal text-blue-500 text-xs"></i>
                      <span className="text-[8px] font-black text-white/40 uppercase">Signal</span>
                    </div>
                    <p className="text-xl font-mono font-bold">-84<span className="text-[10px] ml-1">dBm</span></p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5">
                    <div className="flex justify-between items-start mb-2">
                      <i className="fa-solid fa-temperature-half text-orange-500 text-xs"></i>
                      <span className="text-[8px] font-black text-white/40 uppercase">Thermal</span>
                    </div>
                    <p className="text-xl font-mono font-bold">34<span className="text-[10px] ml-1">°C</span></p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5">
                    <div className="flex justify-between items-start mb-2">
                      <i className="fa-solid fa-microchip text-purple-500 text-xs"></i>
                      <span className="text-[8px] font-black text-white/40 uppercase">Core</span>
                    </div>
                    <p className="text-xl font-mono font-bold">12<span className="text-[10px] ml-1">%</span></p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5">
                    <div className="flex justify-between items-start mb-2">
                      <i className="fa-solid fa-hard-drive text-emerald-500 text-xs"></i>
                      <span className="text-[8px] font-black text-white/40 uppercase">Vault</span>
                    </div>
                    <p className="text-xl font-mono font-bold">4.2<span className="text-[10px] ml-1">GB</span></p>
                  </div>
               </section>

               <section className="space-y-4">
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] px-1">{t('FIELD LOGS', 'फील्ड लॉग्स')}</h3>
                  <div className="bg-black/50 rounded-3xl border border-white/5 p-6 h-48 overflow-y-auto font-mono text-[8px] space-y-2.5 scrollbar-hide">
                    {state.logs.length === 0 ? (
                      <p className="text-gray-700 italic">Listening for system events...</p>
                    ) : (
                      state.logs.map((log, i) => (
                        <div key={i} className="flex space-x-2 border-b border-white/[0.02] pb-2 last:border-0">
                          <span className="text-blue-500/40">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                          <span className="text-white/60">{log.message}</span>
                        </div>
                      ))
                    )}
                  </div>
               </section>
            </div>
          )}
        </div>

        <nav className="fixed bottom-0 left-0 right-0 h-28 bg-black/95 backdrop-blur-3xl border-t border-white/5 flex justify-around items-center px-6 z-[50] pb-8 max-w-2xl mx-auto">
          {[
            { tab: Tab.FLASHLIGHT, icon: 'fa-flashlight', label: t('Light', 'रोशनी') },
            { tab: Tab.BORDER, icon: 'fa-wand-magic-sparkles', label: t('Effect', 'इफेक्ट') },
            { tab: Tab.VAULT, icon: 'fa-vault', label: t('Vault', 'तिजोरी') },
            { tab: Tab.SETTINGS, icon: 'fa-terminal', label: t('System', 'सिस्टम') }
          ].map(({ tab, icon, label }) => (
            <button
              key={tab}
              onClick={() => setState(p => ({ ...p, activeTab: tab }))}
              className={`relative flex flex-col items-center transition-all duration-300 ${state.activeTab === tab ? 'text-blue-500' : 'text-gray-600'}`}
            >
              <div className={`mb-1 p-3 rounded-2xl transition-all ${state.activeTab === tab ? 'bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : ''}`}>
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
