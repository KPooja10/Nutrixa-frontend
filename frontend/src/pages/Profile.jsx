import React from 'react';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Clinical User Profile</h1>
          <p className="text-slate-400 text-sm">System authorization details and clinical role configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <GlassCard glow className="lg:col-span-1 flex flex-col items-center justify-center text-center py-10 relative">
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-extrabold shadow-neon-cyan border-2 border-cyan-400">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] text-white font-bold title='Authorized Access'">
              ✓
            </div>
          </div>

          <h2 className="text-xl font-bold text-white uppercase tracking-wider">{user?.username}</h2>
          <p className="text-cyan-400 text-xs font-semibold tracking-widest mt-1 uppercase">
            🛡️ Role: {user?.role}
          </p>

          <div className="w-full border-t border-slate-800/80 my-6 pt-6 text-left space-y-3 px-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Access Scope</span>
              <span className="text-emerald-400 font-bold">{user?.role === 'doctor' ? 'Full Clinical Access' : 'Patient Analytics'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider">System ID</span>
              <span className="text-slate-200 font-mono">PONIS-USR-00{user?.id || 1}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider">MFA Security</span>
              <span className="text-cyan-400 font-bold">Enabled</span>
            </div>
          </div>
        </GlassCard>

        {/* Access Logs / Medical Node Specs */}
        <GlassCard className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Hospital Network Credentials</h3>
            <p className="text-xs text-slate-400 leading-normal">
              This node operates under HIPAA parameters. Dynamic auditing logging tracks credential changes, record modifications, and face scanning calculations.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active Authorized Devices</h4>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="text-slate-200">🏥 Clinician Console Node (Windows OS - Current)</span>
                <span className="text-emerald-400 font-bold">Verified Session</span>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">System Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Real-Time Clinical Telemetry Broadcasting</span>
                  <span className="text-cyan-400 font-bold">Active</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Warning Alerts For Missed Meals</span>
                  <span className="text-emerald-400 font-bold">Active (Sound Enabled)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Water Intake Smart Tracker Reminders</span>
                  <span className="text-cyan-400 font-bold">Active (Push Notifications)</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
