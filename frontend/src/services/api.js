const API_BASE = '/api';

/**
 * Enhanced fetch client that automatically attaches Bearer tokens
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('ponis_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'A network communication error has occurred.');
  }

  return data;
}

export const api = {
  // Authentication Gateway
  auth: {
    login: (username, password) => 
      request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
    register: (username, password, role) => 
      request('/auth/register', { method: 'POST', body: JSON.stringify({ username, password, role }) }),
  },

  // Patients Management
  patients: {
    getAll: () => request('/patients'),
    getById: (id) => request(`/patients/${id}`),
    create: (patientData) => request('/patients', { method: 'POST', body: JSON.stringify(patientData) }),
  },

  // Meals & Water Loggers
  meals: {
    getByPatient: (patientId) => request(`/meals?patientId=${patientId}`),
    log: (mealData) => request('/meals', { method: 'POST', body: JSON.stringify(mealData) }),
    toggle: (mealId, completed) => request(`/meals/${mealId}/toggle`, { method: 'PATCH', body: JSON.stringify({ completed }) }),
    getWater: (patientId) => request(`/meals/water?patientId=${patientId}`),
    logWater: (patientId, intake) => request('/meals/water', { method: 'POST', body: JSON.stringify({ patientId, intake }) }),
  },

  // Analytics Reports
  analytics: {
    getPatient: (patientId) => request(`/analytics?patientId=${patientId}`),
    getHospitalSummary: () => request('/analytics/hospital-summary'),
  },

  // AI Diagnostic Core
  predictions: {
    getPatient: (patientId) => request(`/predictions?patientId=${patientId}`),
    recalculate: (patientId) => request('/predictions/recalculate', { method: 'POST', body: JSON.stringify({ patientId }) }),
    scanFood: () => request('/predictions/scan-food', { method: 'POST' }),
    scanFace: () => request('/predictions/scan-face', { method: 'POST' }),
  }
};
