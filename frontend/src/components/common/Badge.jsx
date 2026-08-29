import React from 'react';

const Badge = ({ children, variant = 'default', className = '', style = {} }) => {
  const variants = {
    pink: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-pink-50 text-pink-700 border-pink-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    danger: 'bg-red-50 text-red-700 border-red-200 font-semibold',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
    info: 'bg-teal-50 text-teal-700 border-teal-200 font-semibold',
    default: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  const styleClass = variants[variant] || variants.default;

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-xs ${styleClass} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
};

export default Badge;
