import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'emerald',
  trend,
  trendPositive,
  onClick,
}) {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600 border-blue-100',
      badge: 'bg-blue-100 text-blue-800',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
      badge: 'bg-amber-100 text-amber-800',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600 border-rose-100',
      badge: 'bg-rose-100 text-rose-800',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600 border-purple-100',
      badge: 'bg-purple-100 text-purple-800',
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      badge: 'bg-indigo-100 text-indigo-800',
    },
    slate: {
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      badge: 'bg-slate-200 text-slate-800',
    },
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-3.5 xs:p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 min-w-0 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between min-w-0">
        <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
          <p className="text-[10px] xs:text-xs font-semibold text-slate-500 tracking-wide uppercase truncate">
            {title}
          </p>
          <h3 className="text-lg xs:text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`p-2.5 xs:p-3 rounded-xl border flex-shrink-0 ml-2 ${scheme.bg}`}>
            <Icon className="w-4 h-4 xs:w-5 xs:h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center justify-between gap-1 text-[11px] xs:text-xs">
          {subtitle && (
            <span className="text-slate-400 font-medium truncate max-w-[170px] sm:max-w-none">
              {subtitle}
            </span>
          )}
          {trend && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] xs:text-xs ${
                trendPositive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
