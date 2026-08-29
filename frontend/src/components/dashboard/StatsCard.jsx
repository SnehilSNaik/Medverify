import React from 'react';

const StatsCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
  const colorConfig = {
    primary: { iconColor: 'text-blue-700', iconBg: 'bg-blue-50 border-blue-100', textGlow: 'from-blue-500 to-cyan-500' },
    secondary: { iconColor: 'text-violet-700', iconBg: 'bg-violet-50 border-violet-100', textGlow: 'from-violet-500 to-indigo-500' },
    success: { iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50 border-emerald-100', textGlow: 'from-emerald-600 to-teal-600' },
    danger: { iconColor: 'text-red-600', iconBg: 'bg-red-50 border-red-100', textGlow: 'from-red-500 to-rose-600' },
    warning: { iconColor: 'text-amber-600', iconBg: 'bg-amber-50 border-amber-100', textGlow: 'from-amber-500 to-orange-500' },
    info: { iconColor: 'text-teal-600', iconBg: 'bg-teal-50 border-teal-100', textGlow: 'from-teal-500 to-cyan-600' },
  };

  const config = colorConfig[color] || colorConfig.primary;

  return (
    <div className="glass-card animate-fade-in flex items-center justify-between group relative overflow-hidden">
      <div className="relative z-10">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        {trend && (
          <p className="text-xs mt-2 font-semibold text-slate-500">
            <span className={trend > 0 ? 'text-emerald-600' : 'text-red-600'}>
              {trend > 0 ? '+' : ''}{trend}%
            </span> from last month
          </p>
        )}
      </div>
      <div className={`p-3.5 rounded-2xl border ${config.iconBg} ${config.iconColor} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
        <Icon size={26} />
      </div>
    </div>
  );
};

export default StatsCard;
