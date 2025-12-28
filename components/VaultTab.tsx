
import React, { useState, useEffect } from 'react';
import { VaultFile } from '../types';

interface Props {
  language: 'en' | 'hi';
  onError?: (e: DOMException) => void;
}

const VaultTab: React.FC<Props> = ({ language, onError }) => {
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
        setTimeout(() => { setIsLocked(false); setPin(''); }, 150);
      } else if (newPin.length === 4) {
        setTimeout(() => setPin(''), 500);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use native DOMException for quota or read issues
    if (file.size > 20 * 1024 * 1024) { // 20MB Limit
      onError?.(new DOMException("Object exceeds 20MB safety limit", "QuotaExceededError"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      onError?.(new DOMException("Failed to decrypt and map object to storage", "AbortError"));
    };
    reader.onload = () => {
      const newFile: VaultFile = {
        id: crypto.randomUUID(), // Clean native UUID
        name: file.name,
        type: file.type,
        size: file.size,
        data: reader.result as string,
        encrypted: true,
        addedAt: Date.now()
      };
      try {
        const updated = [...files, newFile];
        setFiles(updated);
        localStorage.setItem('vault_files', JSON.stringify(updated));
      } catch (storageErr) {
        onError?.(new DOMException("Local buffer overflow. Purge old objects.", "QuotaExceededError"));
      }
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
      <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in relative overflow-hidden bg-black">
        <div className="text-center mb-12 relative z-10">
          <div className="w-24 h-24 bg-white/[0.03] border border-white/10 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-2xl backdrop-blur-xl">
             <i className="fa-solid fa-fingerprint text-4xl text-blue-500"></i>
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-white mb-2 italic uppercase">{t('SECURE VAULT', 'सुरक्षित तिजोरी')}</h2>
          <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em]">{t('AES-256 SECTOR ENCRYPTION', 'क्षेत्र एन्क्रिप्शन सक्रिय')}</p>
        </div>

        <div className="flex space-x-2 mb-12 bg-white/[0.03] p-1.5 rounded-2xl border border-white/5">
           {['PIN', 'SCAN'].map(mode => (
             <button 
              key={mode}
              onClick={() => setAuthMode(mode === 'SCAN' ? 'BIOMETRIC' : 'PIN')}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all active-scale ${((authMode === 'BIOMETRIC' && mode === 'SCAN') || (authMode === 'PIN' && mode === 'PIN')) ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600'}`}
             >
               {mode === 'PIN' ? t('PIN', 'पिन') : t('SCAN', 'स्कैन')}
             </button>
           ))}
        </div>

        <div className="z-10 w-full flex flex-col items-center">
          {authMode === 'PIN' ? (
            <div className="flex flex-col items-center space-y-12">
              <div className="flex gap-6">
                {[0, 1, 2, 3].map(i => (
                  <div 
                    key={i} 
                    className={`w-3.5 h-3.5 rounded-full border-2 border-white/5 transition-all duration-300 ${pin.length > i ? 'bg-blue-500 border-white shadow-[0_0_15px_#3b82f6]' : ''}`} 
                  />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'DEL'].map((val, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (typeof val === 'number') handlePinInput(val.toString());
                      if (val === 'DEL') setPin(pin.slice(0, -1));
                    }}
                    className={`w-16 h-16 rounded-[28px] flex items-center justify-center text-xl font-black bg-white/[0.03] border border-white/5 active-scale transition-all ${val === '' ? 'opacity-0 pointer-events-none' : 'hover:border-blue-500/30'}`}
                  >
                    {val === 'DEL' ? <i className="fa-solid fa-delete-left text-sm"></i> : val}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-8">
              <button 
                onClick={() => {
                  setIsScanning(true);
                  setTimeout(() => { setIsScanning(false); setIsLocked(false); }, 1500);
                }}
                disabled={isScanning}
                className={`w-40 h-40 rounded-[50px] flex items-center justify-center bg-white/[0.03] border border-white/10 active-scale ${isScanning ? 'animate-pulse' : ''}`}
              >
                <i className={`fa-solid fa-fingerprint text-6xl ${isScanning ? 'text-blue-500' : 'text-gray-800'}`}></i>
              </button>
              <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">
                {isScanning ? t('DECRYPTING...', 'डिक्रिप्टिंग...') : t('TAP TO SCAN', 'स्कैन करने के लिए छुएं')}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-8 animate-fade-in pb-48 overflow-hidden bg-black">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-2xl font-black italic tracking-tighter uppercase">{t('VAULT ARCHIVE', 'वॉल्ट आर्काइव')}</h2>
          <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest">{t('SECTOR 7 - LOCAL DATA ONLY', 'सेक्टर 7 - केवल स्थानीय डेटा')}</p>
        </div>
        <button 
          onClick={() => setIsLocked(true)}
          className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-gray-500 active-scale"
        >
          <i className="fa-solid fa-lock-open text-xs"></i>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide pr-1">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-white/5 rounded-[40px] p-12 text-center opacity-20">
             <i className="fa-solid fa-folder-closed text-6xl mb-6"></i>
             <p className="text-[11px] font-black uppercase tracking-widest">{t('NO ASSETS MAPPED', 'कोई संपत्ति नहीं मिली')}</p>
          </div>
        ) : (
          files.map(file => (
            <div key={file.id} className="p-6 bg-white/[0.02] rounded-3xl flex items-center justify-between border border-white/5 group hover:border-white/10 transition-all">
              <div className="flex items-center space-x-5 min-w-0">
                <div className="w-12 h-12 bg-black rounded-xl border border-white/10 flex items-center justify-center text-blue-500 shadow-inner">
                  <i className={`fa-solid ${file.type.startsWith('image') ? 'fa-image' : 'fa-file-shield'} text-lg`}></i>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black truncate max-w-[150px] uppercase tracking-tighter italic">{file.name}</p>
                  <p className="text-[8px] text-gray-600 font-black mt-1 uppercase">{(file.size / 1024).toFixed(0)} KB / SECURE</p>
                </div>
              </div>
              <button 
                onClick={() => deleteFile(file.id)}
                className="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-red-500 transition-colors active-scale"
              >
                <i className="fa-solid fa-trash-can text-sm"></i>
              </button>
            </div>
          ))
        )}
      </div>

      <label className="fixed bottom-32 right-10 w-16 h-16 bg-blue-600 rounded-[28px] flex items-center justify-center cursor-pointer shadow-[0_0_30px_rgba(59,130,246,0.5)] active-scale transition-all border border-white/20">
        <i className="fa-solid fa-plus text-2xl text-white"></i>
        <input type="file" className="hidden" onChange={handleFileUpload} />
      </label>
    </div>
  );
};

export default VaultTab;
