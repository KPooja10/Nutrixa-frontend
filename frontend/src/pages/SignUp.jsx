import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

export default function SignUp() {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Dispatch register call
      await register(username, password, role);
      setSuccess('Clinical identity registered successfully! Initiating auto-login...');

      // 2. Perform auto-login after short animation delay
      setTimeout(async () => {
        try {
          const user = await login(username, password);
          if (user.role === 'doctor') {
            navigate('/hospital-center');
          } else {
            navigate('/');
          }
        } catch (loginErr) {
          setError(loginErr.message || 'Auto-login failed. Please sign in manually.');
          setSuccess(null);
        }
      }, 1500);

    } catch (err) {
      setError(err.message || 'Registration failed. The user ID might already exist.');
    } finally {
      setLoading(false);
    }
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
          Register New Clinical Identity
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

          {success && (
            <div className="mb-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
              ✓ {success}
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
                  placeholder="Choose clinical identifier (e.g. physician1)"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Password
              </label>
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
              <label htmlFor="role" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Clinical Role
              </label>
              <div className="mt-2">
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="patient" className="bg-slate-900 text-white">🧬 Oncology Patient</option>
                  <option value="doctor" className="bg-slate-900 text-white">🩺 Medical Staff (Doctor)</option>
                </select>
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
                    Registering Session...
                  </>
                ) : (
                  'Confirm & Register Credentials'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <Link to="/login" className="text-sm text-cyan-400 hover:text-cyan-300 transition font-bold">
              ← Return to Authentication Gateway
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
