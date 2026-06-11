import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import PatientRegistration from './pages/PatientRegistration';
import MealPlanner from './pages/MealPlanner';
import AIFoodScanner from './pages/AIFoodScanner';
import AIFaceAnalysis from './pages/AIFaceAnalysis';
import AIPredictionEngine from './pages/AIPredictionEngine';
import RealTimeAnalytics from './pages/RealTimeAnalytics';
import WeeklyProgressReport from './pages/WeeklyProgressReport';
import HospitalCommandCenter from './pages/HospitalCommandCenter';
import Profile from './pages/Profile';

/**
 * Standard ProtectedRoute interceptor ensuring valid JWT access keys
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-cyan-400">
        <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs font-bold uppercase tracking-widest animate-pulse">
          Validating Security Session...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <PatientProvider>
          <Routes>
            {/* Guest/Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Clinical Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/patients" element={
              <ProtectedRoute>
                <PatientList />
              </ProtectedRoute>
            } />
            <Route path="/register-patient" element={
              <ProtectedRoute>
                <PatientRegistration />
              </ProtectedRoute>
            } />
            <Route path="/meals" element={
              <ProtectedRoute>
                <MealPlanner />
              </ProtectedRoute>
            } />
            <Route path="/scanner" element={
              <ProtectedRoute>
                <AIFoodScanner />
              </ProtectedRoute>
            } />
            <Route path="/biometrics" element={
              <ProtectedRoute>
                <AIFaceAnalysis />
              </ProtectedRoute>
            } />
            <Route path="/predictions" element={
              <ProtectedRoute>
                <AIPredictionEngine />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <RealTimeAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <WeeklyProgressReport />
              </ProtectedRoute>
            } />
            <Route path="/hospital-center" element={
              <ProtectedRoute>
                <HospitalCommandCenter />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Default Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PatientProvider>
      </AuthProvider>
    </Router>
  );
}
