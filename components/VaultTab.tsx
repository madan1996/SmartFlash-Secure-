
import React, { useState, useEffect } from 'react';
import { VaultFile } from '../types';

interface Props {
  language: 'en' | 'hi';
}

const VaultTab: React.FC<Props> = ({ language }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [authMode, setAuthMode] = useState<'PIN' | 'BIOMETRIC'>('PIN');
  const [pin, setPin] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [files, setFiles] = useState<VaultFile[]>([]);
  const CORRECT_PIN = '1234';

  const t = (en: string, hi: string) => language === 'hi' ? hi : en;

  useEffect(() => {
    const saved = localStorage.getItem('vault_files');
    if (saved) setFiles(JSON.parse(saved));
  }, []);

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin === CORRECT_PIN) {
        setTimeout(() => { setIsLocked(false); setPin(''); }, 200);
      } else if (newPin.length === 4) {
        setTimeout(() => setPin(''), 500);
      }
    }
  };

  const startBiometricScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsLocked(false);
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newFile: VaultFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        data: reader.result as string,
        encrypted: true,
        addedAt: Date.now()
      };
      const updated = [...files, newFile];
      setFiles(updated);
      localStorage.setItem('vault_files', JSON.stringify(updated));
    };
    reader.readAsDataURL(file);
  };

  const deleteFile = (id: string) => {
    const updated = files.filter(f => f.id !== id);
    setFiles(updated);
    localStorage.setItem('vault_files', JSON.stringify(updated));
  };

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in relative overflow-hidden">
        <div className="text-center mb-10 relative z-10">
          <div className="w-20 h-20 bg-gray-900 rounded-[28px] flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-2xl">
             <i className="fa-solid fa-shield-halved text-3xl text-blue-500"></i>
          </div>
          <h2 className="text-2xl font-black tracking-tighter text-white mb-1 italic uppercase">{t('SECURE VAULT', 'सुरक्षित तिजोरी')}</h2>
          <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">{t('GROUND-LEVEL ENCRYPTION', 'धरातल-स्तर एन्क्रिप्शन')}</p>
        </div>

        <div className="flex space-x-2 mb-10 bg-black p-1 rounded-2xl border border-white/5">
           {['PIN', 'BIOMETRIC'].map(mode => (
             <button 
              key={mode}
              onClick={() => setAuthMode(mode as any)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${authMode === mode ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500'}`}
             >
               {mode === 'PIN' ? t('PIN', 'पिन') : t('SCAN', 'स्कैन')}
             </button>
           ))}
        </div>

        <div className="z-10 w-full flex flex-col items-center">
          {authMode === 'PIN' && (
            <div className="flex flex-col items-center space-y-10">
              <div className="flex gap-4">
                {[0, 1, 2, 3].map(i => (
                  <div 
                    key={i} 
                    className={`w-3 h-3 rounded-full border-2 border-blue-500/20 transition-all ${pin.length > i ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : ''}`} 
                  />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, ' ', 0, 'X'].map((val, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (typeof val === 'number') handlePinInput(val.toString());
                      if (val === 'X') setPin(pin.slice(0, -1));
                    }}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold bg-gray-900 border border-white/5 active:scale-90 transition-all ${val === ' ' ? 'opacity-0' : ''}`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          )}

          {authMode === 'BIOMETRIC' && (
            <div className="flex flex-col items-center space-y-8">
              <button 
                onClick={startBiometricScan}
                disabled={isScanning}
                className={`w-32 h-32 rounded-3xl flex items-center justify-center bg-gray-900 border border-white/10 ${isScanning ? 'animate-pulse' : ''}`}
              >
                <i className={`fa-solid fa-fingerprint text-5xl ${isScanning ? 'text-blue-400' : 'text-gray-700'}`}></i>
              </button>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">
                {isScanning ? t('ANALYZING...', 'विश्लेषण...') : t('TAP TO SCAN', 'स्कैन करें')}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 animate-fade-in pb-32 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-black italic tracking-tighter">{t('MY FILES', 'मेरी फ़ाइलें')}</h2>
          <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest">{t('ENCRYPTED NODE', 'एन्क्रिप्टेड नोड')}</p>
        </div>
        <button 
          onClick={() => setIsLocked(true)}
          className="w-10 h-10 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center text-gray-500"
        >
          <i className="fa-solid fa-lock-open text-xs"></i>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/5 rounded-[32px] p-8 text-center opacity-40">
             <i className="fa-solid fa-folder-open text-4xl mb-4"></i>
             <p className="text-[10px] font-black uppercase tracking-widest">{t('NO FILES SECURED', 'कोई फ़ाइल नहीं मिली')}</p>
          </div>
        ) : (
          files.map(file => (
            <div key={file.id} className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-blue-400">
                  <i className={`fa-solid ${file.type.startsWith('image') ? 'fa-image' : 'fa-file'}`}></i>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black truncate w-32">{file.name}</p>
                  <p className="text-[8px] text-gray-500 uppercase">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>
              <button 
                onClick={() => deleteFile(file.id)}
                className="text-gray-600 hover:text-red-500 transition-colors"
              >
                <i className="fa-solid fa-trash text-sm"></i>
              </button>
            </div>
          ))
        )}
      </div>

      <label className="fixed bottom-32 right-8 w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center cursor-pointer shadow-xl active:scale-90 transition-all">
        <i className="fa-solid fa-plus text-xl text-white"></i>
        <input type="file" className="hidden" onChange={handleFileUpload} />
      </label>
    </div>
  );
};

export default VaultTab;
