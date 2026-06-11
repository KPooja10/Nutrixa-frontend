import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePatients } from '../context/PatientContext';
import { api } from '../services/api';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import LoadingOverlay from '../components/LoadingOverlay';

export default function Dashboard() {
  const { currentPatient, refreshCurrentPatient, loading } = usePatients();
  const navigate = useNavigate();

  const [waterAmount, setWaterAmount] = useState('');
  const [waterTotal, setWaterTotal] = useState(0);
  const [waterLogs, setWaterLogs] = useState([]);
  const [loggingWater, setLoggingWater] = useState(false);
  const [meals, setMeals] = useState([]);

  // Load patient water logs and meals
  useEffect(() => {
    if (currentPatient) {
      loadWaterAndMeals();
    }
  }, [currentPatient]);

  const loadWaterAndMeals = async () => {
    try {
      const waterData = await api.meals.getWater(currentPatient.id);
      setWaterLogs(waterData);
      const total = waterData.reduce((sum, w) => sum + w.intake, 0);
      setWaterTotal(total);

      const mealData = await api.meals.getByPatient(currentPatient.id);
      setMeals(mealData);
    } catch (err) {
      console.error('Error loading patient telemetry details:', err);
    }
  };

  const handleQuickAddWater = async (amount) => {
    if (!currentPatient) return;
    setLoggingWater(true);
    try {
      await api.meals.logWater(currentPatient.id, amount);
      await loadWaterAndMeals();
      await refreshCurrentPatient();
    } catch (err) {
      console.error('Error logging water:', err);
    } finally {
      setLoggingWater(false);
    }
  };

  const handleCustomAddWater = async (e) => {
    e.preventDefault();
    if (!currentPatient || !waterAmount) return;
    const amount = parseInt(waterAmount);
    if (isNaN(amount) || amount <= 0) return;

    setLoggingWater(true);
    try {
      await api.meals.logWater(currentPatient.id, amount);
      setWaterAmount('');
      await loadWaterAndMeals();
      await refreshCurrentPatient();
    } catch (err) {
      console.error('Error logging custom water volume:', err);
    } finally {
      setLoggingWater(false);
    }
  };

  if (!currentPatient) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="text-glow-cyan text-5xl">🧬</div>
        <h2 className="text-2xl font-bold text-white">No Monitored Patient Profile Selected</h2>
        <p className="text-slate-400 max-w-sm text-sm">
          Please access the directory list or search terminals to select and audit patient nutrition logs.
        </p>
        <button
          onClick={() => navigate('/patients')}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3 rounded-xl font-bold tracking-wider hover:shadow-neon-cyan transition"
        >
          Browse Patient Records
        </button>
      </div>
    );
  }

  // Find missed meals for warning dashboard checks
  const missedMeals = meals.filter(m => m.completed === 0);
  const completionRate = meals.length > 0
    ? Math.round((meals.filter(m => m.completed === 1).length / meals.length) * 100)
    : 100;

  return (
    <div className="space-y-6 relative">
      {loading && <LoadingOverlay message="Synchronizing clinical patient telemetry..." />}

      {/* Header Demographics Panel */}
      <GlassCard className="border border-cyan-500/20" glow>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-cyan-400 shadow-neon-cyan select-none">
              {currentPatient.patientName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white tracking-wide">{currentPatient.patientName}</h2>
                <StatusBadge status={currentPatient.analytics?.risk || 'Low'} />
              </div>
              <p className="text-xs text-slate-400 mt-1 font-semibold tracking-wider uppercase">
                🏷️ Node Profile: {currentPatient.cancerType} ({currentPatient.stage}) | Age: {currentPatient.age}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/patients')}
            className="bg-slate-900/60 hover:bg-slate-800/50 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition"
          >
            🔄 Switch Patient Profile
          </button>
        </div>
      </GlassCard>

      {/* Gauges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="text-center flex flex-col justify-between py-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Metabolic Nutrition Score</h3>
            <div className="text-4xl font-extrabold text-cyan-400 text-glow-cyan mt-3">{currentPatient.analytics?.energy || 75}%</div>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-4">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${currentPatient.analytics?.energy || 75}%` }} />
          </div>
        </GlassCard>

        <GlassCard className="text-center flex flex-col justify-between py-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Oral Hydration Index</h3>
            <div className="text-4xl font-extrabold text-blue-400 text-glow-blue mt-3">{currentPatient.analytics?.hydration || 80}%</div>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-4">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${currentPatient.analytics?.hydration || 80}%` }} />
          </div>
        </GlassCard>

        <GlassCard className="text-center flex flex-col justify-between py-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Oncology Recovery Forecast</h3>
            <div className="text-4xl font-extrabold text-emerald-400 mt-3 shadow-sm">{currentPatient.analytics?.recovery || 78}%</div>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-4">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${currentPatient.analytics?.recovery || 78}%` }} />
          </div>
        </GlassCard>

        <GlassCard className="text-center flex flex-col justify-between py-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Safety Compliance Level</h3>
            <div className="text-4xl font-extrabold text-amber-400 mt-3">{completionRate}%</div>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-4">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${completionRate}%` }} />
          </div>
        </GlassCard>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Interactive Trackers Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hydration Tracker */}
          <GlassCard className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Daily Hydration Log</h3>
                <p className="text-xs text-slate-400 mt-0.5">Maintain liquid targets for antiemetic protocols</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-blue-400 text-glow-blue">{waterTotal}</span>
                <span className="text-slate-500 text-xs"> / 2500 ml Target</span>
              </div>
            </div>

            {/* Quick add water buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleQuickAddWater(250)}
                disabled={loggingWater}
                className="bg-slate-900/60 border border-slate-800 hover:bg-slate-800/60 hover:border-blue-500/30 text-xs font-bold py-3.5 rounded-xl transition flex flex-col items-center justify-center gap-1.5"
              >
                <span>🥛 +250ml</span>
                <span className="text-[9px] text-slate-500 font-normal">Standard Cup</span>
              </button>
              <button
                onClick={() => handleQuickAddWater(500)}
                disabled={loggingWater}
                className="bg-slate-900/60 border border-slate-800 hover:bg-slate-800/60 hover:border-blue-500/30 text-xs font-bold py-3.5 rounded-xl transition flex flex-col items-center justify-center gap-1.5"
              >
                <span>🥤 +500ml</span>
                <span className="text-[9px] text-slate-500 font-normal">Small Infuser</span>
              </button>
              <button
                onClick={() => handleQuickAddWater(750)}
                disabled={loggingWater}
                className="bg-slate-900/60 border border-slate-800 hover:bg-slate-800/60 hover:border-blue-500/30 text-xs font-bold py-3.5 rounded-xl transition flex flex-col items-center justify-center gap-1.5"
              >
                <span>🧴 +750ml</span>
                <span className="text-[9px] text-slate-500 font-normal">Therapeutic Bottle</span>
              </button>
            </div>

            {/* Custom add water */}
            <form onSubmit={handleCustomAddWater} className="flex gap-3">
              <input
                type="number"
                min="10"
                max="2000"
                value={waterAmount}
                onChange={(e) => setWaterAmount(e.target.value)}
                placeholder="Log Custom Intake Volume (ml)..."
                className="flex-1 bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button
                type="submit"
                disabled={loggingWater || !waterAmount}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white text-xs font-bold px-6 py-3.5 rounded-xl hover:shadow-neon-blue transition"
              >
                Log Intake
              </button>
            </form>
          </GlassCard>

          {/* Quick Actions Shortcuts */}
          <GlassCard className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 text-center">
            <Link
              to="/meals"
              className="p-3 bg-slate-900/40 hover:bg-slate-800/40 border border-slate-800/80 hover:border-cyan-500/20 rounded-xl transition flex flex-col items-center justify-center gap-2 group"
            >
              <span className="text-xl">🥗</span>
              <span className="text-xs font-bold text-slate-300 group-hover:text-cyan-400 transition">Meal Planner</span>
            </Link>

            <Link
              to="/scanner"
              className="p-3 bg-slate-900/40 hover:bg-slate-800/40 border border-slate-800/80 hover:border-cyan-500/20 rounded-xl transition flex flex-col items-center justify-center gap-2 group"
            >
              <span className="text-xl">📷</span>
              <span className="text-xs font-bold text-slate-300 group-hover:text-cyan-400 transition">AI Food Scan</span>
            </Link>

            <Link
              to="/biometrics"
              className="p-3 bg-slate-900/40 hover:bg-slate-800/40 border border-slate-800/80 hover:border-cyan-500/20 rounded-xl transition flex flex-col items-center justify-center gap-2 group"
            >
              <span className="text-xl">👤</span>
              <span className="text-xs font-bold text-slate-300 group-hover:text-cyan-400 transition">Face Analysis</span>
            </Link>

            <Link
              to="/predictions"
              className="p-3 bg-slate-900/40 hover:bg-slate-800/40 border border-slate-800/80 hover:border-cyan-500/20 rounded-xl transition flex flex-col items-center justify-center gap-2 group"
            >
              <span className="text-xl">🔮</span>
              <span className="text-xs font-bold text-slate-300 group-hover:text-cyan-400 transition">AI Predictions</span>
            </Link>
          </GlassCard>
        </div>

        {/* Right Warnings & Clinical Alerts Panel */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
              ⚠️ Missed Meal Compliance Warnings
            </h3>

            {missedMeals.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                <span className="text-lg block mb-1">👍</span>
                All clinical oncology nutritional meals are currently completed. Zero alerts logged.
              </div>
            ) : (
              <div className="space-y-3">
                {missedMeals.map(m => (
                  <div key={m.id} className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl flex items-start gap-2.5 animate-pulse">
                    <span className="text-red-400 mt-0.5">🔔</span>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-red-400 uppercase tracking-wide">
                        {m.mealType.replace('_', ' ')} Overdue
                      </div>
                      <p className="text-[10px] text-slate-300 mt-0.5 leading-normal">
                        Missed Meal: <strong>{m.mealName}</strong>. Alert patient to complete or record nutritional intake.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Clinical Reminders */}
          <GlassCard className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-2">
              ⏰ Active Care Protocols
            </h3>
            <div className="space-y-3 text-xs leading-normal">
              <div className="flex justify-between items-center text-slate-300">
                <span>💊 Antiemetic Medication</span>
                <span className="text-cyan-400 font-semibold font-mono">08:00 (Completed)</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>🥤 Early Snack Intake</span>
                <span className="text-cyan-400 font-semibold font-mono">11:00 (Overdue)</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>💧 Fluid Infusion Re-Check</span>
                <span className="text-cyan-400 font-semibold font-mono">15:30 (Scheduled)</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
