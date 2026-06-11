import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePatients } from '../context/PatientContext';
import StatusBadge from '../components/StatusBadge';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const { currentPatient } = usePatients();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: '🖥️ Central Console' },
    { path: '/patients', label: '🗄️ Patient Directory' },
    { path: '/meals', label: '🥗 Intake Planner' },
    { path: '/scanner', label: '📷 AI Food Scanner' },
    { path: '/biometrics', label: '👤 Biometric Scan' },
    { path: '/predictions', label: '🔮 Prognosis Engine' },
    { path: '/analytics', label: '📈 Live Analytics' },
    { path: '/reports', label: '📋 Weekly Progress' },
    { path: '/hospital-center', label: '🧬 Command Center' },
    { path: '/profile', label: '⚙️ User Settings' },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-slate-950 font-sans">
      {/* Sidebar - Desktop Layout */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900/60 backdrop-blur-xl border-r border-slate-800/80 p-5 justify-between relative shrink-0">
        <div className="space-y-6">
          {/* System brand header */}
          <div className="flex items-center gap-2.5 text-glow-cyan text-2xl font-extrabold text-cyan-400 select-none pb-4 border-b border-slate-800/80">
            🧬 <span className="tracking-wide">PONIS</span>
          </div>

          {/* Active monitored patient summary block */}
          {currentPatient && (
            <div className="bg-slate-950/50 border border-slate-800 p-3 rounded-xl space-y-1.5 select-none">
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Monitored Patient</div>
              <div className="text-white text-xs font-bold truncate">{currentPatient.patientName}</div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">{currentPatient.stage}</span>
                <StatusBadge status={currentPatient.analytics?.risk || 'Low'} />
              </div>
            </div>
          )}

          {/* Nav items list */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    w-full flex items-center px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all duration-150 uppercase
                    ${active 
                      ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-glow-cyan shadow-[0_0_15px_rgba(6,182,212,0.05)]' 
                      : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}
                  `}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile section */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center gap-3 px-1 select-none">
            <div className="w-9 h-9 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold border border-cyan-400 shadow-neon-cyan">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white uppercase tracking-wider">{user?.username}</div>
              <div className="text-[9px] text-slate-500 capitalize tracking-wide font-medium mt-0.5">{user?.role} Node</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-slate-950 hover:bg-red-950/20 border border-slate-800 hover:border-red-500/20 text-slate-400 hover:text-red-400 text-[10px] font-bold tracking-widest uppercase py-2.5 rounded-xl transition"
          >
            🔒 Terminate Session
          </button>
        </div>
      </aside>

      {/* Header - Mobile Layout */}
      <header className="md:hidden bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/80 p-4 flex justify-between items-center z-40 relative">
        <div className="flex items-center gap-2 text-glow-cyan text-xl font-extrabold text-cyan-400 select-none">
          🧬 <span>PONIS</span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-400 hover:text-white text-xl font-bold p-1"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Mobile dropdown navigation drawer */}
        {mobileMenuOpen && (
          <div className="absolute top-[100%] left-0 w-full bg-slate-900/95 backdrop-blur-2xl border-b border-slate-800 p-5 space-y-4 shadow-2xl flex flex-col">
            {currentPatient && (
              <div className="bg-slate-950/50 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Active Patient Node</div>
                  <div className="text-white text-xs font-bold">{currentPatient.patientName}</div>
                </div>
                <StatusBadge status={currentPatient.analytics?.risk || 'Low'} />
              </div>
            )}

            <nav className="flex flex-col gap-1">
              {navItems.map(item => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all
                      ${active 
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                        : 'text-slate-400 hover:text-slate-200'}
                    `}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
              className="w-full bg-slate-950 hover:bg-red-950/20 border border-slate-850 hover:border-red-500/20 text-slate-400 hover:text-red-400 text-[10px] font-bold tracking-widest uppercase py-3 rounded-xl transition"
            >
              🔒 Terminate Session
            </button>
          </div>
        )}
      </header>

      {/* Main page content space */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 z-10 relative">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-between">
          <div>{children}</div>
          
          <footer className="mt-12 pt-6 border-t border-slate-900 text-center text-[10px] text-slate-600 select-none leading-normal">
            Predictive Oncology Nutrition Intelligence System (PONIS) <br />
            Hospital SaaS Node Protocol. All records governed under standard security controls.
          </footer>
        </div>
      </main>
    </div>
  );
}
