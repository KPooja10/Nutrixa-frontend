import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../context/PatientContext';
import { api } from '../services/api';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import LoadingOverlay from '../components/LoadingOverlay';

export default function HospitalCommandCenter() {
  const { selectPatient } = usePatients();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHospitalSummary();
  }, []);

  const loadHospitalSummary = async () => {
    setLoading(true);
    try {
      const data = await api.analytics.getHospitalSummary();
      setSummary(data);
    } catch (err) {
      console.error('Error loading Hospital Command Center summaries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMonitorPatient = async (id) => {
    setLoading(true);
    try {
      await selectPatient(id);
      navigate('/');
    } catch (err) {
      console.error('Error selecting patient:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {loading && <LoadingOverlay message="Broadcasting clinical telemetry metrics..." />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">🧬 Hospital Command Center</h1>
          <p className="text-slate-400 text-sm">Real-time oncology nutrition monitoring and clinical alerts network</p>
        </div>

        <button
          onClick={() => navigate('/register-patient')}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold px-5 py-3 rounded-xl hover:shadow-neon-cyan transition flex items-center gap-2"
        >
          ➕ Register Patient Intake
        </button>
      </div>

      {summary && (
        <>
          {/* Dashboard Telemetry Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassCard className="text-center py-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Patient Nodes</h3>
              <div className="text-3xl font-extrabold text-white mt-2 font-mono">
                {summary.statistics.totalPatients}
              </div>
            </GlassCard>

            <GlassCard className="text-center py-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Critical Risk Nodes</h3>
              <div className="text-3xl font-extrabold text-red-400 text-glow-cyan mt-2 font-mono">
                {summary.statistics.riskDistribution.high}
              </div>
            </GlassCard>

            <GlassCard className="text-center py-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg. Clinic Adherence</h3>
              <div className="text-3xl font-extrabold text-cyan-400 text-glow-cyan mt-2 font-mono">
                {summary.statistics.averages.nutritionAdherence}%
              </div>
            </GlassCard>

            <GlassCard className="text-center py-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg. Clinic Hydration</h3>
              <div className="text-3xl font-extrabold text-blue-400 text-glow-blue mt-2 font-mono">
                {summary.statistics.averages.hydration}%
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Clinical Alert logs */}
            <div className="lg:col-span-1 space-y-6">
              <GlassCard className="space-y-4 min-h-[380px]">
                <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    🚨 Safety Alert Threshold System
                  </h3>
                  <span className="bg-red-500/10 text-red-400 text-[9px] px-2 py-0.5 rounded font-mono font-bold">
                    SYSTEM_ACTIVE
                  </span>
                </div>

                {summary.alerts.length === 0 ? (
                  <div className="text-center text-slate-500 text-xs py-10">
                    👍 Medical nodes operating stable parameters. Zero compliance warnings.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {summary.alerts.map(alert => (
                      <div
                        key={alert.id}
                        className={`
                          p-3 border rounded-xl flex items-start gap-2.5 transition-all duration-300
                          ${alert.type === 'CRITICAL_RISK' 
                            ? 'bg-red-500/5 border-red-500/20' 
                            : alert.type === 'NUTRITION_ALERT' 
                              ? 'bg-amber-500/5 border-amber-500/20' 
                              : 'bg-blue-500/5 border-blue-500/20'}
                        `}
                      >
                        <span className="text-sm mt-0.5">🔔</span>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                              {alert.patientName}
                            </span>
                            <span className="text-[8px] text-slate-500 font-mono">
                              {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed">{alert.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Patients Directory grid table */}
            <div className="lg:col-span-2 space-y-6">
              <GlassCard className="space-y-4 min-h-[380px] overflow-hidden">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                  🗄️ Clinical Patients Directory
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-slate-500 uppercase tracking-wider border-b border-slate-800/80">
                      <tr>
                        <th className="py-3 px-2">Patient Demographics</th>
                        <th className="py-3 px-2">Classification</th>
                        <th className="py-3 px-2 text-center">Telemetry Parameters</th>
                        <th className="py-3 px-2">Staging & Risk</th>
                        <th className="py-3 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {summary.patientRegistry.map(patient => (
                        <tr key={patient.id} className="hover:bg-slate-900/30 transition duration-150">
                          <td className="py-3.5 px-2">
                            <div className="text-white font-bold">{patient.patientName}</div>
                            <div className="text-[10px] text-slate-500 font-normal">Age: {patient.age} yrs</div>
                          </td>
                          <td className="py-3.5 px-2 text-slate-300">
                            {patient.cancerType}
                          </td>
                          <td className="py-3.5 px-2 text-center">
                            <div className="flex justify-center gap-3 font-mono text-[10px]">
                              <div>
                                <span className="text-slate-500">NUT:</span>
                                <span className="text-cyan-400 font-bold ml-0.5">{patient.energy}%</span>
                              </div>
                              <div>
                                <span className="text-slate-500">HYD:</span>
                                <span className="text-blue-400 font-bold ml-0.5">{patient.hydration}%</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-2">
                            <div className="text-[10px] text-slate-300 font-bold mb-1">{patient.stage}</div>
                            <StatusBadge status={patient.risk} />
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            <button
                              onClick={() => handleMonitorPatient(patient.id)}
                              className="bg-slate-900/60 hover:bg-cyan-500/10 border border-slate-700 hover:border-cyan-500/30 text-cyan-400 text-[10px] font-bold px-3.5 py-1.5 rounded-xl transition"
                            >
                              🔎 Monitor
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
