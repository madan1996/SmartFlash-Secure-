
export enum Tab {
  FLASHLIGHT = 'Flashlight',
  BORDER = 'Border Effect',
  VAULT = 'Hidden Vault',
  SETTINGS = 'Settings'
}

export interface BorderSettings {
  enabled: boolean;
  speed: number; // 1 to 10
  thickness: number; // 1 to 20
  direction: 'clockwise' | 'counter-clockwise';
  colors: string[]; // hex colors
  pattern: 'rainbow' | 'cyber' | 'lava' | 'forest'; // Updated to match actual presets
}

export interface FlashlightSettings {
  enabled: boolean;
  brightness: number; // 1 to 2000
  color: string; // hex
  strobeMode: 'static' | 'sos' | 'strobe';
}

export interface VaultFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64
  encrypted: boolean;
  addedAt: number;
}

export interface AppLog {
  timestamp: number;
  message: string;
  type: 'info' | 'error' | 'security' | 'automation';
}

export interface AppState {
  flashlight: FlashlightSettings;
  border: BorderSettings;
  isVaultLocked: boolean;
  isSystemLocked: boolean;
  lowPowerMode: boolean; 
  lockScreenMode: 'dark' | 'transparent';
  activeTab: Tab;
  logs: AppLog[]; 
  language: 'en' | 'hi';
}
