import React from 'react';

const StatsCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
  const colorMap = {
    primary: 'text-[#00d4ff]',
    secondary: 'text-[#7c3aed]',
    success: 'text-[#10b981]',
    danger: 'text-[#ef4444]',
    warning: 'text-[#f59e0b]'
  };

  const bgMap = {
    primary: 'bg-[rgba(0,212,255,0.1)]',
    secondary: 'bg-[rgba(124,58,237,0.1)]',
    success: 'bg-[rgba(16,185,129,0.1)]',
    danger: 'bg-[rgba(239,68,68,0.1)]',
    warning: 'bg-[rgba(245,158,11,0.1)]'
  };

  return (
    <div className="glass-card animate-fade-in flex items-center justify-between group">
      <div>
        <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
        {trend && (
          <p className="text-xs mt-2 text-gray-400">
            <span className={trend > 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}>
              {trend > 0 ? '+' : ''}{trend}%
            </span> from last month
          </p>
        )}
      </div>
      <div className={`p-4 rounded-xl ${bgMap[color]} ${colorMap[color]} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={28} />
      </div>
    </div>
  );
};

export default StatsCard;
