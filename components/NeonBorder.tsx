
import React from 'react';
import { BorderSettings } from '../types';

interface Props {
  settings: BorderSettings;
}

const NeonBorder: React.FC<Props> = ({ settings }) => {
  if (!settings.enabled) return null;

  const animationDuration = `${11 - settings.speed}s`;
  const gradient = settings.colors.length > 1 
    ? `conic-gradient(from 0deg, ${settings.colors.join(', ')})`
    : `conic-gradient(from 0deg, ${settings.colors[0]}, transparent, ${settings.colors[0]})`;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ padding: `${settings.thickness}px` }}>
      <div 
        className="absolute inset-[-100%] border-animation"
        style={{
          background: gradient,
          animationDuration,
          animationDirection: settings.direction === 'clockwise' ? 'normal' : 'reverse',
          filter: 'blur(8px)'
        }}
      />
      <div className="absolute inset-0 bg-[#0a0a0a] rounded-[inherit]" />
    </div>
  );
};

export default NeonBorder;
