import React, { useState } from 'react';
import { api } from '../services/api';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import LoadingOverlay from '../components/LoadingOverlay';

export default function AIFoodScanner() {
  const [scanning, setScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setScannedResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const executeScan = async () => {
    if (!imagePreview) return;

    setScanning(true);
    try {
      const data = await api.predictions.scanFood();
      setScannedResult(data);
    } catch (err) {
      console.error('Error scanning food image:', err);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Food Nutrient Scanner</h1>
        <p className="text-slate-400 text-sm">Computer vision oncology calorie and nutrient classification engine</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scan Capture Terminal */}
        <GlassCard glow className="relative flex flex-col justify-between py-6 min-h-[400px]">
          {scanning && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-50 rounded-2xl">
              {/* Spinning high-tech radar rings */}
              <div className="w-20 h-20 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin shadow-neon-cyan mb-4" />
              <p className="text-cyan-400 text-xs font-semibold tracking-widest animate-pulse uppercase">
                🔬 Executing Optical Nutrition Audit...
              </p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Image Capture Input</h3>
            
            {!imagePreview ? (
              <label className="border-2 border-dashed border-slate-700/60 hover:border-cyan-500/40 bg-slate-900/40 rounded-2xl flex flex-col items-center justify-center p-12 text-center cursor-pointer transition h-64">
                <span className="text-4xl mb-3">📷</span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Upload Meal Image</span>
                <span className="text-[10px] text-slate-500 mt-1 leading-normal">
                  Drop files or select local images (JPG, PNG, WebP)
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 h-64 flex items-center justify-center group select-none">
                <img src={imagePreview} alt="Meal Preview" className="max-h-full max-w-full object-contain" />
                
                {/* Laser Sweep Effect */}
                {scanning && <div className="scanner-laser" />}
                
                <button
                  onClick={() => { setImagePreview(null); setScannedResult(null); }}
                  className="absolute top-3 right-3 bg-red-600/90 hover:bg-red-500 text-white rounded-full p-2 text-xs font-bold transition shadow-lg opacity-0 group-hover:opacity-100"
                  title="Clear Upload"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-between gap-4">
            {imagePreview && (
              <button
                onClick={executeScan}
                disabled={scanning}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold py-3.5 rounded-xl hover:shadow-neon-cyan tracking-widest uppercase transition flex items-center justify-center gap-2"
              >
                🔬 Execute Bio-Analytical Scan
              </button>
            )}
          </div>
        </GlassCard>

        {/* Diagnostic Scan Readout */}
        <div className="space-y-6">
          <GlassCard className="min-h-[400px] flex flex-col justify-between">
            {!scannedResult ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs py-10">
                <span className="text-3xl mb-2">📋</span>
                Waiting for optical food scanning results...
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-start gap-2 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-wide">{scannedResult.foodItem}</h3>
                    <p className="text-[10px] text-slate-500 font-semibold tracking-wider font-mono uppercase mt-0.5">
                      🔬 Computer Vision Classification Verified
                    </p>
                  </div>
                  <StatusBadge status={scannedResult.rating} />
                </div>

                {/* Macro Nutrients */}
                <div className="grid grid-cols-4 gap-2 text-center bg-slate-900/40 border border-slate-800 p-3 rounded-xl">
                  <div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Calories</div>
                    <div className="text-white text-xs font-bold mt-1">{scannedResult.macros.calories} kcal</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Protein</div>
                    <div className="text-white text-xs font-bold mt-1 text-cyan-400">{scannedResult.macros.protein}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Carbs</div>
                    <div className="text-white text-xs font-bold mt-1 text-blue-400">{scannedResult.macros.carbs}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Fats</div>
                    <div className="text-white text-xs font-bold mt-1 text-amber-400">{scannedResult.macros.fats}</div>
                  </div>
                </div>

                {/* Clinical Notes */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    🔬 Clinical Oncology Assessment
                  </div>
                  <p className="text-slate-300 text-xs leading-normal">
                    {scannedResult.clinicalAdvantage}
                  </p>
                </div>

                {/* Vitamin Deficiency Impacts */}
                {scannedResult.deficiencyImpacts.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      🧬 Therapeutic Deficiency Mitigators
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {scannedResult.deficiencyImpacts.map(vit => (
                        <span key={vit} className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider">
                          +{vit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
