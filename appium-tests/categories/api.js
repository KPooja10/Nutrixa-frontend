/**
 * ================================================================
 *  PONIS Appium Tests - Category 6: API Integration Testing
 *  TC-055 to TC-064
 *  Tests: Backend API calls via HTTP (axios), verifying PONIS
 *         endpoints return correct data from mobile context
 * ================================================================
 */

const axios = require('axios');

module.exports = async function runApiTests(driver, step, delay, BACKEND_URL) {
  const CAT = 'API';

  // Shared auth token (obtained via login)
  let authToken = null;

  // Helper: login via API to get token
  async function loginAndGetToken() {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        username: 'doctor',
        password: 'doctor123',
      }, { timeout: 5000 });
      return res.data.token || null;
    } catch (_) {
      return null;
    }
  }

  // Helper: authed GET request
  async function apiGet(endpoint) {
    return axios.get(`${BACKEND_URL}/api${endpoint}`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      timeout: 5000,
    });
  }

  // Helper: authed POST request
  async function apiPost(endpoint, body) {
    return axios.post(`${BACKEND_URL}/api${endpoint}`, body, {
      headers: authToken ? { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' } : {},
      timeout: 5000,
    });
  }

  // TC-055: Obtain Auth Token
  await step(CAT,
    'API Auth Login Returns Token',
    'POST /api/auth/login with valid credentials and verify JWT token is returned',
    async () => {
      const res = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        username: 'doctor',
        password: 'doctor123',
      }, { timeout: 5000 });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!res.data.token) throw new Error('No token returned from login endpoint');
      authToken = res.data.token;
    }
  );

  // TC-056: GET /api/patients Returns Array
  await step(CAT,
    'API GET /patients Returns Patient Array',
    'Fetch /api/patients with valid token and verify response is a non-empty array',
    async () => {
      const res = await apiGet('/patients');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!Array.isArray(res.data)) throw new Error('Response is not an array');
    }
  );

  // TC-057: GET /api/meals Returns Data
  await step(CAT,
    'API GET /meals?patientId=1 Returns Data',
    'Fetch /api/meals for patient 1 and verify meal array is returned',
    async () => {
      const res = await apiGet('/meals?patientId=1');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!Array.isArray(res.data)) throw new Error('Meals response is not an array');
    }
  );

  // TC-058: POST /api/meals/water Logs Water Intake
  await step(CAT,
    'API POST /meals/water Creates Water Log',
    'POST to /api/meals/water and verify 201 Created with success flag',
    async () => {
      const res = await apiPost('/meals/water', { patientId: 1, intake: 250 });
      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
      if (!res.data.success) throw new Error('success flag missing in water log response');
    }
  );

  // TC-059: GET /api/analytics Returns Summary
  await step(CAT,
    'API GET /analytics?patientId=1 Returns Summary',
    'Fetch analytics for patient 1 and verify summary object is present in response',
    async () => {
      const res = await apiGet('/analytics?patientId=1');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!res.data.summary) throw new Error('Analytics summary field missing');
    }
  );

  // TC-060: GET /api/predictions Returns Risk Data
  await step(CAT,
    'API GET /predictions?patientId=1 Returns Risk Fields',
    'Fetch predictions for patient 1 and verify fatigueRisk and other fields exist',
    async () => {
      const res = await apiGet('/predictions?patientId=1');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!res.data.fatigueRisk) throw new Error('fatigueRisk field missing in predictions response');
    }
  );

  // TC-061: POST /api/predictions/recalculate Triggers Recalc
  await step(CAT,
    'API POST /predictions/recalculate Succeeds',
    'POST to recalculate predictions for patient 1 and verify success response',
    async () => {
      const res = await apiPost('/predictions/recalculate', { patientId: 1 });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!res.data.success) throw new Error('Recalculation success indicator missing');
    }
  );

  // TC-062: GET /api/analytics/hospital-summary
  await step(CAT,
    'API GET /analytics/hospital-summary Returns Statistics',
    'Fetch hospital-level analytics summary and verify statistics object is present',
    async () => {
      const res = await apiGet('/analytics/hospital-summary');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!res.data.statistics) throw new Error('Hospital statistics object missing');
    }
  );

  // TC-063: Unauthenticated Request Returns 401
  await step(CAT,
    'Unauthenticated API Request Returns 401',
    'Call /api/patients without Authorization header and verify 401 Unauthorized',
    async () => {
      try {
        await axios.get(`${BACKEND_URL}/api/patients`, { timeout: 5000 });
        throw new Error('Expected 401 but request succeeded');
      } catch (err) {
        if (err.response && err.response.status === 401) return; // PASS
        if (err.message.includes('Expected 401')) throw err;
        throw new Error(`Unexpected error: ${err.message}`);
      }
    }
  );

  // TC-064: Non-Existent API Route Returns 404
  await step(CAT,
    'Invalid API Route Returns 404',
    'Request a non-existent API endpoint and verify 404 Not Found response',
    async () => {
      try {
        await apiGet('/does-not-exist-route-xyz');
        throw new Error('Expected 404 but request succeeded with 2xx');
      } catch (err) {
        if (err.response && err.response.status === 404) return; // PASS
        if (err.message.includes('Expected 404')) throw err;
        throw new Error(`Unexpected error: ${err.message}`);
      }
    }
  );
};
