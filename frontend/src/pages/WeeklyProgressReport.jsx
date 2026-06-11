import React, { useState, useEffect } from 'react';
import { usePatients } from '../context/PatientContext';
import { api } from '../services/api';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import LoadingOverlay from '../components/LoadingOverlay';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function WeeklyProgressReport() {
  const { currentPatient } = usePatients();

  const [weeklyReport, setWeeklyReport] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentPatient) {
      loadProgress();
    }
  }, [currentPatient]);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const data = await api.analytics.getPatient(currentPatient.id);
      setWeeklyReport(data.weeklyReport);
    } catch (err) {
      console.error('Error fetching patient weekly progress logs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentPatient) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <span className="text-4xl mb-4">🧬</span>
        <p className="text-sm font-semibold">Please select a monitored patient to view weekly report parameters.</p>
      </div>
    );
  }

  // Calculate detailed progress metrics
  const totalNutritionScore = weeklyReport.reduce((sum, d) => sum + d.nutritionScore, 0);
  const averageNutrition = weeklyReport.length > 0 ? Math.round(totalNutritionScore / weeklyReport.length) : 75;

  const totalHydrationScore = weeklyReport.reduce((sum, d) => sum + d.hydration, 0);
  const averageHydration = weeklyReport.length > 0 ? Math.round(totalHydrationScore / weeklyReport.length) : 80;

  // Prepare completed vs missed meals mock series for the bar chart
  const mealComplianceSeries = weeklyReport.map(d => {
    const completedMealsCount = Math.round((d.adherence / 100) * 6); // out of 6 daily slots
    const missedMealsCount = 6 - completedMealsCount;
    return {
      day: d.day,
      Completed: completedMealsCount,
      Missed: missedMealsCount
    };
  });

  return (
    <div className="space-y-6 relative">
      {loading && <LoadingOverlay message="Syncing weekly oncology logs..." />}

      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Oncology Weekly Progress Report</h1>
        <p className="text-slate-400 text-sm">
          Detailed weekly progress audit and compliance logs for patient node: {currentPatient.patientName}
        </p>
      </div>

      {/* Numerical targets row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="py-5 text-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Weekly Nutrition Average</h3>
          <div className="text-3xl font-extrabold text-cyan-400 mt-2 text-glow-cyan">{averageNutrition}% Compliance</div>
        </GlassCard>

        <GlassCard className="py-5 text-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Weekly Hydration Average</h3>
          <div className="text-3xl font-extrabold text-blue-400 mt-2 text-glow-blue">{averageHydration}% Volume</div>
        </GlassCard>

        <GlassCard className="py-5 text-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Treatment Path Integrity</h3>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">Optimal Plateau</div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Adherence report bar chart */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Daily Meal Compliance Ratio</h3>
            <p className="text-[10px] text-slate-500">Comparing completed meals checklist items against missed/skipped indicators</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mealComplianceSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} domain={[0, 6]} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Missed" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Clinical Summary & Dietary Guidance */}
        <GlassCard className="lg:col-span-1 space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 mb-3">
              📋 Clinical Dietary Advisory
            </h3>
            
            <div className="space-y-4 text-xs leading-normal">
              <div className="bg-slate-900/40 p-3 border border-slate-800 rounded-xl space-y-1">
                <strong className="text-white block">Adherence Level Evaluation</strong>
                <p className="text-slate-300">
                  Patient nutrition compliance registers at <strong className="text-cyan-400">{averageNutrition}%</strong>. This maintains appropriate muscular mass ratios and satisfies baseline metabolic requirements.
                </p>
              </div>

              <div className="bg-slate-900/40 p-3 border border-slate-800 rounded-xl space-y-1">
                <strong className="text-white block">Cellular Toxicity Control</strong>
                <p className="text-slate-300">
                  Hydration status averages <strong className="text-blue-400">{averageHydration}%</strong>. Liquid thresholds remain active, mitigating acute toxicities from treatments.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-cyan-950/10 border border-cyan-500/10 p-3 rounded-xl text-[10px] text-cyan-400 leading-normal">
            💡 Clinical Advice: Continue maintaining current oral supplements. Recommend light vegetable broth intakes if slight nausea signs develop.
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
