import React, { useState, useEffect } from 'react';
import { usePatients } from '../context/PatientContext';
import { api } from '../services/api';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import LoadingOverlay from '../components/LoadingOverlay';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function RealTimeAnalytics() {
  const { currentPatient } = usePatients();
  
  const [analytics, setAnalytics] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentPatient) {
      loadAnalytics();
    }
  }, [currentPatient]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.analytics.getPatient(currentPatient.id);
      setAnalytics(data.summary);
      setWeeklyReport(data.weeklyReport);
    } catch (err) {
      console.error('Error fetching patient analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentPatient) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <span className="text-4xl mb-4">🧬</span>
        <p className="text-sm font-semibold">Please select a monitored patient to access analytical trends.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {loading && <LoadingOverlay message="Fetching real-time patient charts..." />}

      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Oncology Real-Time Analytics</h1>
        <p className="text-slate-400 text-sm">
          Dynamic clinical telemetry trackers and cellular indexes for patient: {currentPatient.patientName}
        </p>
      </div>

      {/* Numerical summary row */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nutrition Adherence</div>
            <div className="text-xl font-bold text-white mt-1 text-glow-cyan">{analytics.energy}%</div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Oral Hydration</div>
            <div className="text-xl font-bold text-white mt-1 text-glow-blue">{analytics.hydration}%</div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cellular Recovery</div>
            <div className="text-xl font-bold text-white mt-1 text-emerald-400">{analytics.recovery}%</div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Safety Status</div>
            <div className="text-xl font-bold text-white mt-1"><StatusBadge status={analytics.risk} /></div>
          </div>
        </div>
      )}

      {/* Interactive Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Curves */}
        <GlassCard className="space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Nutrition & Hydration Curves</h3>
            <p className="text-[10px] text-slate-500">Dual-axis historical chart mapping over current week cycles</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyReport} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAdherence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHydration" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="adherence" name="Nutrition Score" stroke="#06b6d4" fillOpacity={1} fill="url(#colorAdherence)" />
                <Area type="monotone" dataKey="hydration" name="Hydration Level" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHydration)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Clinical Recovery Index Forecasts */}
        <GlassCard className="space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Recovery Forecast Vectors</h3>
            <p className="text-[10px] text-slate-500">Estimating systemic recovery variables over active timeline</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyReport} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="nutritionScore" name="Recovery Score" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
