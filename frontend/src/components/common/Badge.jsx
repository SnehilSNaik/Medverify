import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    success: 'bg-[rgba(16,185,129,0.1)] text-[#10b981] border-[#10b981]',
    danger: 'bg-[rgba(239,68,68,0.1)] text-[#ef4444] border-[#ef4444]',
    warning: 'bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border-[#f59e0b]',
    info: 'bg-[rgba(0,212,255,0.1)] text-[#00d4ff] border-[#00d4ff]',
    default: 'bg-[rgba(255,255,255,0.1)] text-[#f0f4ff] border-[rgba(255,255,255,0.2)]'
  };

  const styleClass = variants[variant] || variants.default;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styleClass} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
