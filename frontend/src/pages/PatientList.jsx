import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../context/PatientContext';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';

export default function PatientList() {
  const { patients, selectPatient, loading } = usePatients();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelect = async (id) => {
    await selectPatient(id);
    navigate('/');
  };

  const filteredPatients = patients.filter(p =>
    p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cancerType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Active Oncology Patient Directory</h1>
          <p className="text-slate-400 text-sm">Review, coordinate, and select patient profiles for nutrition monitoring</p>
        </div>
        <button
          onClick={() => navigate('/register-patient')}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-bold tracking-wider hover:shadow-neon-cyan transition flex items-center gap-2 text-sm shadow-lg"
        >
          ➕ Register New Patient
        </button>
      </div>

      {/* Search and Filters */}
      <GlassCard className="py-4 px-6 flex items-center">
        <div className="w-full relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-sm"
            placeholder="Search by patient name, cancer categorization, or stage classification..."
          />
          <span className="absolute left-3.5 top-3.5 text-slate-500">🔍</span>
        </div>
      </GlassCard>

      {loading && patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold animate-pulse">Syncing patient records...</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <GlassCard className="text-center py-12">
          <p className="text-slate-400 text-sm">No oncology clinical profiles match your filter options.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredPatients.map(p => (
            <GlassCard key={p.id} className="space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">{p.patientName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Age: {p.age} | {p.cancerType} ({p.stage})
                    </p>
                  </div>
                  <StatusBadge status={p.risk || 'Low'} />
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 bg-slate-900/40 border border-slate-800/80 p-3 rounded-xl text-center">
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Adherence</div>
                    <div className="text-white text-sm font-bold mt-1 text-glow-cyan">{p.energy || 75}%</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Hydration</div>
                    <div className="text-white text-sm font-bold mt-1 text-glow-blue">{p.hydration || 80}%</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Recovery</div>
                    <div className="text-white text-sm font-bold mt-1 text-emerald-400">{p.recovery || 78}%</div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleSelect(p.id)}
                  className="w-full bg-slate-900/60 hover:bg-cyan-500/10 border border-slate-700/80 hover:border-cyan-500/30 text-cyan-400 py-2.5 rounded-xl text-xs font-bold tracking-wider hover:shadow-neon-cyan transition flex items-center justify-center gap-2"
                >
                  🧬 Select & Monitor Patient Node
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
