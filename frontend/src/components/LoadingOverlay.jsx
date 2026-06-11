import React from 'react';

export default function LoadingOverlay({ message = 'Accessing medical database...', id }) {
  return (
    <div
      id={id}
      className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-50 rounded-2xl p-6"
    >
      <div className="relative flex items-center justify-center mb-6">
        {/* Outer glowing pulsing circles */}
        <div className="w-20 h-20 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin shadow-neon-cyan" />
        <div className="absolute w-14 h-14 border border-blue-500/10 border-b-blue-400 rounded-full animate-spin [animation-direction:reverse] shadow-neon-blue" />
        <div className="absolute w-6 h-6 bg-cyan-500/20 rounded-full animate-ping" />
      </div>
      
      <p className="text-cyan-400 text-sm font-semibold tracking-wider animate-pulse text-glow-cyan text-center max-w-xs">
        🧬 {message}
      </p>
      
      <div className="w-32 h-1 bg-slate-900 rounded-full overflow-hidden mt-4">
        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-1/2 rounded-full animate-[laser-sweep_1.5s_infinite_ease-in-out]" />
      </div>
    </div>
  );
}
