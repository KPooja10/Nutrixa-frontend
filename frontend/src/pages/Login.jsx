import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError(null);
    try {
      const user = await login(username, password);
      if (user.role === 'doctor') {
        navigate('/hospital-center');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Incorrect credentials. Try the quick presets.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (user, pass) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 medical-grid relative min-h-screen">
      {/* Background radial overlays */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center gap-3 text-glow-cyan text-4xl font-extrabold text-cyan-400">
          🧬 <span>PONIS</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white font-sans">
          Clinical Authentication Gateway
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Predictive Oncology Nutrition Intelligence System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <GlassCard glow className="shadow-neon-cyan border-cyan-500/20">
          {error && (
            <div className="mb-4 bg-red-950/40 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                User Identifier
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                  placeholder="Enter clinical identifier"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300 transition">
                  Forgot?
                </Link>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl py-3.5 font-bold tracking-wider hover:shadow-neon-cyan focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Synchronizing Session...
                  </>
                ) : (
                  'Authorize & Enter Dashboard'
                )}
              </button>
            </div>
          </form>

          {/* Quick preset credentials block to facilitate testing */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
              Quick Presets (Select for Instant Login)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleQuickSelect('doctor', 'doctor123')}
                className="bg-slate-900/40 hover:bg-slate-800/50 border border-cyan-500/10 hover:border-cyan-500/30 rounded-xl p-3 text-left transition"
              >
                <div className="text-cyan-400 text-xs font-bold">🩺 Medical Staff</div>
                <div className="text-[10px] text-slate-500 mt-1">doctor / doctor123</div>
              </button>
              <button
                onClick={() => handleQuickSelect('patient', 'patient123')}
                className="bg-slate-900/40 hover:bg-slate-800/50 border border-blue-500/10 hover:border-blue-500/30 rounded-xl p-3 text-left transition"
              >
                <div className="text-blue-400 text-xs font-bold">🧬 Oncology Patient</div>
                <div className="text-[10px] text-slate-500 mt-1">patient / patient123</div>
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
