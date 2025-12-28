
import React from 'react';
import { BorderSettings } from '../types';

interface Props {
  settings: BorderSettings;
  className?: string;
}

const NeonBorder: React.FC<Props> = ({ settings, className = "" }) => {
  if (!settings.enabled) return null;

  const animationDuration = `${11 - settings.speed}s`;
  const gradient = settings.colors.length > 1 
    ? `conic-gradient(from 0deg, ${settings.colors.join(', ')})`
    : `conic-gradient(from 0deg, ${settings.colors[0]}, transparent, ${settings.colors[0]})`;

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`} style={{ padding: `${settings.thickness}px`, zIndex: 0 }}>
      <div 
        className="absolute inset-[-100%] border-animation"
        style={{
          background: gradient,
          animationDuration,
          animationDirection: settings.direction === 'clockwise' ? 'normal' : 'reverse',
          filter: 'blur(8px)'
        }}
      />
      <div className="absolute inset-0 bg-[#000000] rounded-[inherit]" />
    </div>
  );
};

export default NeonBorder;
