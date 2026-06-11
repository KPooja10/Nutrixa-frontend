import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const PatientContext = createContext(null);

export function PatientProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-load patient profiles if logged in
  useEffect(() => {
    if (isAuthenticated) {
      loadPatients();
    } else {
      setPatients([]);
      setCurrentPatient(null);
    }
  }, [isAuthenticated]);

  // Set default patient if user is a patient
  useEffect(() => {
    if (isAuthenticated && user?.role === 'patient' && patients.length > 0) {
      // Patients look for a matching profile or we default to the first patient
      // Since this is a clinician dashboard, we can assign patient Alexander Vance to default patient user
      const patientProfile = patients.find(p => p.patientName.toLowerCase().includes(user.username.toLowerCase())) || patients[0];
      if (patientProfile && (!currentPatient || currentPatient.id !== patientProfile.id)) {
        selectPatient(patientProfile.id);
      }
    }
  }, [isAuthenticated, user, patients]);

  const loadPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.patients.getAll();
      setPatients(data);
    } catch (err) {
      console.error('Error fetching clinical patients:', err);
      setError(err.message || 'Failed to fetch patients.');
    } finally {
      setLoading(false);
    }
  };

  const selectPatient = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.patients.getById(id);
      setCurrentPatient(data);
      return data;
    } catch (err) {
      console.error('Error fetching patient profile:', err);
      setError(err.message || 'Failed to retrieve patient profile.');
    } finally {
      setLoading(false);
    }
  };

  const refreshCurrentPatient = async () => {
    if (!currentPatient) return;
    try {
      const data = await api.patients.getById(currentPatient.id);
      setCurrentPatient(data);
      // Also update patient list to keep analytics in-sync
      setPatients(prev => prev.map(p => p.id === data.id ? { ...p, risk: data.analytics.risk, energy: data.analytics.energy, hydration: data.analytics.hydration, recovery: data.analytics.recovery } : p));
    } catch (err) {
      console.error('Error refreshing patient dashboard metrics:', err);
    }
  };

  const createPatient = async (patientData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.patients.create(patientData);
      await loadPatients();
      await selectPatient(res.patientId);
      return res;
    } catch (err) {
      setError(err.message || 'Failed to register patient profile.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    patients,
    currentPatient,
    loading,
    error,
    loadPatients,
    selectPatient,
    refreshCurrentPatient,
    createPatient
  };

  return <PatientContext.Provider value={value}>{children}</PatientContext.Provider>;
}

export function usePatients() {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatients must be executed within a PatientProvider.');
  }
  return context;
}
