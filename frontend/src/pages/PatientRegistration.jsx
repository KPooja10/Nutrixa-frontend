import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../context/PatientContext';
import GlassCard from '../components/GlassCard';

export default function PatientRegistration() {
  const { createPatient } = usePatients();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [cancerType, setCancerType] = useState('Breast Cancer');
  const [stage, setStage] = useState('Stage I');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !age || !cancerType || !stage) {
      setError('Please provide all demographics and staging data.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createPatient({
        patientName: name,
        age: parseInt(age),
        cancerType,
        stage
      });
      navigate('/hospital-center');
    } catch (err) {
      setError(err.message || 'Failed to create patient profile in clinical systems.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Oncology Patient Intake Terminal</h1>
        <p className="text-slate-400 text-sm">Register new clinical nodes to system tracking metrics</p>
      </div>

      <GlassCard glow className="shadow-neon-cyan border-cyan-500/20">
        {error && (
          <div className="mb-6 bg-red-950/40 border border-red-500/30 text-red-400 p-4 rounded-xl text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="patientName" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Patient Demographics - Full Name
              </label>
              <input
                type="text"
                id="patientName"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-2 bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                placeholder="Alexander Vance"
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Demographics - Age
              </label>
              <input
                type="number"
                id="age"
                required
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full mt-2 bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                placeholder="58"
              />
            </div>

            <div>
              <label htmlFor="cancerType" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Primary Oncology Classification
              </label>
              <select
                id="cancerType"
                value={cancerType}
                onChange={(e) => setCancerType(e.target.value)}
                className="w-full mt-2 bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              >
                <option value="Breast Cancer">Breast Cancer</option>
                <option value="Lung Cancer">Lung Cancer</option>
                <option value="Colorectal Cancer">Colorectal Cancer</option>
                <option value="Prostate Cancer">Prostate Cancer</option>
                <option value="Leukemia">Leukemia</option>
                <option value="Pancreatic Cancer">Pancreatic Cancer</option>
                <option value="Ovarian Cancer">Ovarian Cancer</option>
              </select>
            </div>

            <div>
              <label htmlFor="stage" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Clinical Staging Paradigm
              </label>
              <select
                id="stage"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full mt-2 bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              >
                <option value="Stage I">Stage I (Localized)</option>
                <option value="Stage II">Stage II (Early Locally Advanced)</option>
                <option value="Stage III">Stage III (Late Locally Advanced)</option>
                <option value="Stage IV">Stage IV (Metastatic)</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-400 leading-normal flex items-start gap-3">
            <span className="text-cyan-400 text-lg">💡</span>
            <div>
              <strong className="text-white block mb-1">Electronic Health Record Auto-Provisioning</strong>
              Saving this form immediately creates the database parameters, generates nutritional compliance tables, maps standard meal planners, and initiates clinical AI prognosis vectors.
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => navigate('/hospital-center')}
              className="bg-slate-900/60 border border-slate-700/80 hover:bg-slate-800/50 hover:border-slate-600 text-slate-300 px-6 py-3 rounded-xl font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3 rounded-xl font-bold tracking-wider hover:shadow-neon-cyan transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Broadcasting Demographic Record...
                </>
              ) : (
                'Commit & Register Patient'
              )}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
