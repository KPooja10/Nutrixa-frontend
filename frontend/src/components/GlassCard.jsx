import React from 'react';

export default function GlassCard({ children, className = '', hover = true, glow = false, id }) {
  return (
    <div
      id={id}
      className={`
        glass-card rounded-2xl p-6 relative overflow-hidden transition-all duration-300
        ${hover ? 'glass-card-hover' : ''}
        ${glow ? 'shadow-neon-cyan border-cyan-500/20' : ''}
        ${className}
      `}
    >
      {/* Background medical gradient nodes for visual interest */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
