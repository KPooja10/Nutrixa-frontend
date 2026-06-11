import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Simulate minor networking delays
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 medical-grid relative min-h-screen">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center gap-3 text-glow-cyan text-4xl font-extrabold text-cyan-400">
          🧬 <span>PONIS</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
          Reset Security Credentials
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <GlassCard glow className="shadow-neon-cyan border-cyan-500/20">
          {!submitted ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Registered Medical Email
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                    placeholder="physician@hospital.org / patient@recovery.net"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl py-3.5 font-bold tracking-wider hover:shadow-neon-cyan focus:outline-none focus:ring-2 focus:ring-cyan-500 transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Dispatching Reset Instructions...
                    </>
                  ) : (
                    'Request Recovery Link'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400 text-xl animate-bounce">
                ✓
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Recovery Email Dispatched</h3>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                If the email <strong className="text-cyan-400">{email}</strong> matches an authorized record in our systems, security reset parameters have been successfully broadcasted.
              </p>
              <div className="text-xs text-amber-400 bg-amber-950/20 border border-amber-500/20 p-3 rounded-lg leading-normal">
                💡 Testing Tip: The default passwords are 'doctor123' and 'patient123'. You can return to login immediately!
              </div>
            </div>
          )}

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
