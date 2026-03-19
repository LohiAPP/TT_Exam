import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', style }) => {
  return (
    <div className={`glass glass-card animate-fade ${className}`} style={style}>
      {children}
    </div>
  );
};
