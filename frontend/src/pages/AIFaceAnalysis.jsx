import React, { useState } from 'react';
import { api } from '../services/api';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import LoadingOverlay from '../components/LoadingOverlay';

export default function AIFaceAnalysis() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startScanning = async () => {
    setScanning(true);
    try {
      const data = await api.predictions.scanFace();
      setScanResult(data);
    } catch (err) {
      console.error('Error analyzing biometric indicators:', err);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Biometric Face Analyzer</h1>
        <p className="text-slate-400 text-sm">Real-time facial scanning console to estimate fatigue, cellular hydration, and recovery parameters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Webcam Capture Console */}
        <GlassCard glow className="lg:col-span-2 relative flex flex-col justify-between py-6 min-h-[420px] overflow-hidden">
          {scanning && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center z-50 rounded-2xl">
              <div className="w-16 h-16 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin shadow-neon-cyan mb-4" />
              <div className="text-center space-y-1 select-none">
                <p className="text-cyan-400 text-xs font-bold tracking-widest animate-pulse uppercase">
                  📡 Calibrating Biometric Mesh Matrix...
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                  Checking ocular vectors & vascular flow
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Biometric Feed Terminal</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">CONSOLE_UP_ONLINE</span>
              </div>
            </div>

            {!cameraActive ? (
              <div className="flex-1 border border-slate-800/80 bg-slate-950/50 rounded-2xl flex flex-col items-center justify-center text-center p-8 min-h-[260px] relative">
                {/* Visual camera outline */}
                <span className="text-5xl mb-3 select-none">🖥️</span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Webcam Access Required</span>
                <p className="text-[10px] text-slate-500 mt-1 max-w-xs leading-normal">
                  Toggle node console telemetry feed to analyze patient dermal indexes.
                </p>
                <button
                  onClick={() => setCameraActive(true)}
                  className="mt-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 text-cyan-400 text-xs font-bold px-5 py-2.5 rounded-xl transition"
                >
                  Activate Video Telemetry
                </button>
              </div>
            ) : (
              <div className="flex-1 relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 min-h-[260px] flex items-center justify-center group select-none">
                {/* Futuristic Video Simulation Container */}
                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-slate-700">
                  {/* Outer circle mesh */}
                  <div className="w-48 h-48 border border-cyan-500/15 rounded-full flex items-center justify-center pulse-ring-slow">
                    <div className="w-36 h-36 border border-cyan-500/10 rounded-full flex items-center justify-center">
                      <div className="w-24 h-24 border border-cyan-500/5 rounded-full" />
                    </div>
                  </div>

                  {/* Pulsing grid biometrics points */}
                  <div className="absolute top-[38%] left-[34%] w-1.5 h-1.5 bg-cyan-400 rounded-full clinical-dot shadow-[0_0_5px_cyan]" />
                  <div className="absolute top-[38%] right-[34%] w-1.5 h-1.5 bg-cyan-400 rounded-full clinical-dot shadow-[0_0_5px_cyan]" />
                  <div className="absolute top-[48%] left-[48%] w-1.5 h-1.5 bg-cyan-400 rounded-full clinical-dot shadow-[0_0_5px_cyan]" />
                  <div className="absolute bottom-[38%] left-[42%] w-1.5 h-1.5 bg-cyan-400 rounded-full clinical-dot shadow-[0_0_5px_cyan]" />
                  <div className="absolute bottom-[38%] right-[42%] w-1.5 h-1.5 bg-cyan-400 rounded-full clinical-dot shadow-[0_0_5px_cyan]" />

                  {/* Floating clinical metadata */}
                  <div className="absolute top-4 left-4 text-[9px] font-mono text-cyan-400/60 leading-normal">
                    LAT: 32.48° N | LON: 84.12° W <br />
                    FPS: 60 | COMP_RXT: 99.4%
                  </div>

                  <div className="absolute bottom-4 right-4 text-[9px] font-mono text-cyan-400/60 tracking-wider">
                    SCAN_ID_NODE: #832-PONIS
                  </div>

                  <span className="absolute bottom-16 text-slate-500 text-xs font-semibold tracking-wider font-mono">
                    🧬 FACIAL GRID SCAN ACTIVE
                  </span>
                </div>

                {/* Laser scan bar sweep */}
                <div className="scanner-laser" />

                <button
                  onClick={() => { setCameraActive(false); setScanResult(null); }}
                  className="absolute top-3 right-3 bg-red-600/90 hover:bg-red-500 text-white rounded-full p-2 text-xs font-bold transition shadow-lg opacity-0 group-hover:opacity-100"
                  title="Shut Down Telemetry"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {cameraActive && (
            <div className="pt-4">
              <button
                onClick={startScanning}
                disabled={scanning}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold py-3.5 rounded-xl hover:shadow-neon-cyan tracking-widest uppercase transition flex items-center justify-center gap-2"
              >
                📡 Execute Real-Time Biometric Analysis
              </button>
            </div>
          )}
        </GlassCard>

        {/* Diagnostic Results Readout */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="min-h-[420px] flex flex-col justify-between">
            {!scanResult ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs py-10">
                <span className="text-3xl mb-2">📋</span>
                Waiting for face scanning metrics...
              </div>
            ) : (
              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-md font-bold text-white tracking-wide">Biometric Readouts</h3>
                  <p className="text-[9px] text-slate-500 font-semibold tracking-wider font-mono uppercase mt-0.5">
                    ⚙️ Active Diagnostic Verification
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Fatigue Coefficient</span>
                      <span className="font-bold text-red-400">{scanResult.fatigue}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full rounded-full" style={{ width: `${scanResult.fatigue}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Treatment Stress Index</span>
                      <span className="font-bold text-amber-400">{scanResult.stress}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${scanResult.stress}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Cellular Hydration Level</span>
                      <span className="font-bold text-blue-400">{scanResult.hydration}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${scanResult.hydration}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Oncology Recovery Index</span>
                      <span className="font-bold text-emerald-400">{scanResult.recovery}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${scanResult.recovery}%` }} />
                    </div>
                  </div>
                </div>

                {/* Biometric specific tags */}
                <div className="border-t border-slate-800/80 pt-4 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    🔬 Cellular Micro Indicators
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="flex justify-between bg-slate-900/40 p-2 border border-slate-800 rounded-lg">
                      <span className="text-slate-500">Eye Strain</span>
                      <span className="font-bold text-white">{scanResult.biometricIndicators.eyeStrain}</span>
                    </div>
                    <div className="flex justify-between bg-slate-900/40 p-2 border border-slate-800 rounded-lg">
                      <span className="text-slate-500">Skin Index</span>
                      <span className="font-bold text-white">{scanResult.biometricIndicators.skinHydrationIndex}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-3 text-[10px] text-slate-300 leading-normal bg-cyan-950/10 border border-cyan-500/10 p-2.5 rounded-xl">
                  {scanResult.clinicalNote}
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
