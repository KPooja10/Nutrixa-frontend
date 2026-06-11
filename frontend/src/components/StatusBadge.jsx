import React from 'react';

export default function StatusBadge({ status, id }) {
  const normStatus = String(status).toLowerCase().trim();

  let badgeStyles = 'bg-slate-800 text-slate-300 border-slate-700/50';
  let glowStyle = '';

  switch (normStatus) {
    case 'high':
    case 'poor':
    case 'severe':
    case 'critical_risk':
      badgeStyles = 'bg-red-500/10 text-red-400 border-red-500/20';
      glowStyle = 'shadow-[0_0_10px_rgba(239,68,68,0.2)]';
      break;
    case 'medium':
    case 'moderate':
    case 'mild':
    case 'hydration_warning':
      badgeStyles = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      glowStyle = 'shadow-[0_0_10px_rgba(245,158,11,0.2)]';
      break;
    case 'low':
    case 'healthy':
    case 'none':
    case 'completed':
    case 'improving':
      badgeStyles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      glowStyle = 'shadow-[0_0_10px_rgba(16,185,129,0.2)]';
      break;
    case 'stable':
    case 'nutrition_alert':
      badgeStyles = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      glowStyle = 'shadow-[0_0_10px_rgba(6,182,212,0.2)]';
      break;
    case 'declining':
      badgeStyles = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      glowStyle = 'shadow-[0_0_10px_rgba(244,63,94,0.2)]';
      break;
    default:
      badgeStyles = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      glowStyle = 'shadow-[0_0_10px_rgba(59,130,246,0.2)]';
  }

  return (
    <span
      id={id}
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wider border
        ${badgeStyles} ${glowStyle}
      `}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse" />
      {status}
    </span>
  );
}
