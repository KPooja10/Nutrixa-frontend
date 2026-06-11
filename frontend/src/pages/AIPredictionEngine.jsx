import React, { useState } from 'react';
import { usePatients } from '../context/PatientContext';
import { api } from '../services/api';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import LoadingOverlay from '../components/LoadingOverlay';

export default function AIPredictionEngine() {
  const { currentPatient, refreshCurrentPatient } = usePatients();
  const [calculating, setCalculating] = useState(false);

  const handleRecalculate = async () => {
    if (!currentPatient) return;

    setCalculating(true);
    try {
      await api.predictions.recalculate(currentPatient.id);
      await refreshCurrentPatient();
    } catch (err) {
      console.error('Error recalculating clinical predictions:', err);
    } finally {
      setCalculating(false);
    }
  };

  if (!currentPatient) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <span className="text-4xl mb-4">🧬</span>
        <p className="text-sm font-semibold">Please select a monitored patient to access prediction diagnostics.</p>
      </div>
    );
  }

  const pred = currentPatient.predictions || {
    fatigueRisk: 'Low',
    recoveryForecast: 80,
    deficiencyRisk: 'None',
    energyTrend: 'stable',
    hydrationTrend: 'stable'
  };

  return (
    <div className="space-y-6 relative">
      {calculating && <LoadingOverlay message="Running oncology prognosis math engines..." />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Prognosis & Prediction Engine</h1>
          <p className="text-slate-400 text-sm">
            Clinical machine learning forecast arrays for patient node: {currentPatient.patientName}
          </p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={calculating}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold px-5 py-3 rounded-xl hover:shadow-neon-cyan transition uppercase tracking-wider flex items-center gap-2"
        >
          {calculating ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Recalculating...
            </>
          ) : (
            '🔮 Re-run Prognosis Core'
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left main metrics panel */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard glow className="space-y-6 border border-cyan-500/20">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Active Prognosis Matrix</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fatigue Risk */}
              <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Fatigue Acceleration Risk</div>
                  <div className="text-lg font-bold text-white mt-1">Systemic Fatigue Threat</div>
                </div>
                <StatusBadge status={pred.fatigueRisk} />
              </div>

              {/* Nutrition Deficiency Risk */}
              <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Metabolic Deficiency Risk</div>
                  <div className="text-lg font-bold text-white mt-1">Cellular Deficiency Score</div>
                </div>
                <StatusBadge status={pred.deficiencyRisk} />
              </div>

              {/* Energy Trend */}
              <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Energy Path</div>
                  <div className="text-lg font-bold text-white mt-1 uppercase text-xs tracking-wider flex items-center gap-1.5">
                    {pred.energyTrend === 'improving' ? '📈 Improving Trend' : pred.energyTrend === 'stable' ? '➡️ Stable Plateau' : '📉 Declining Vector'}
                  </div>
                </div>
                <StatusBadge status={pred.energyTrend} />
              </div>

              {/* Hydration Trend */}
              <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Volumetric Fluid Path</div>
                  <div className="text-lg font-bold text-white mt-1 uppercase text-xs tracking-wider flex items-center gap-1.5">
                    {pred.hydrationTrend === 'improving' ? '📈 Improving Trend' : pred.hydrationTrend === 'stable' ? '➡️ Stable Plateau' : '📉 Declining Vector'}
                  </div>
                </div>
                <StatusBadge status={pred.hydrationTrend} />
              </div>
            </div>
          </GlassCard>

          {/* Clinician Advisory */}
          <GlassCard className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">🚨 Care Station Recommendations</h3>
            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              {pred.fatigueRisk === 'High' || pred.deficiencyRisk === 'Severe' ? (
                <div className="bg-red-950/20 border border-red-500/20 p-3.5 rounded-xl">
                  ⚠️ <strong>Critical Clinical Status:</strong> Metabolic markers indicate severe cell starvation and muscle cachexia vectors. Add a fortified Whey protein drink or trigger oral glucose replacement fluids at once. Check warning alerts logs.
                </div>
              ) : pred.fatigueRisk === 'Medium' || pred.deficiencyRisk === 'Mild' ? (
                <div className="bg-amber-950/20 border border-amber-500/20 p-3.5 rounded-xl">
                  💡 <strong>Sub-optimal Recovery Vector:</strong> Demographics show minor deficiencies. Supplement diet with rich antioxidants and complex grains during snack periods. Recommend daily water logs increments.
                </div>
              ) : (
                <div className="bg-emerald-950/20 border border-emerald-500/20 p-3.5 rounded-xl">
                  ✓ <strong>Metabolic Balance Established:</strong> Compliance metrics remain stable. No specialized nutritional interventions are requested at this frame. Continue tracking daily meal log profiles.
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Model Specs */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="text-center py-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Therapeutic Forecast Target</h3>
            
            <div className="relative inline-flex items-center justify-center mb-4">
              {/* Simple beautiful SVG radial gauge */}
              <svg className="w-32 h-32">
                <circle className="text-slate-800" strokeWidth="6" stroke="currentColor" fill="transparent" r="50" cx="64" cy="64"/>
                <circle className="text-cyan-400" strokeWidth="6" strokeDasharray="314" strokeDashoffset={314 - (314 * (pred.recoveryForecast || 80)) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="50" cx="64" cy="64"/>
              </svg>
              <div className="absolute text-2xl font-black text-white">{pred.recoveryForecast || 80}%</div>
            </div>
            
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Estimated Recovery Score</p>
          </GlassCard>

          <GlassCard className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">🔮 ML Forecast Schema</h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              Predictions are synthesized dynamically using the patient's **6-slot compliance ratio** and **fluid logging frequencies**. Completing meals or water logs triggers calculations to re-evaluate cellular coefficients.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
