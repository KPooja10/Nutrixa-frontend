const { By, until, Key } = require('selenium-webdriver');

module.exports = async function run(driver, step, setReactInput, delay, BASE_URL) {
  // Helper to execute REST fetch requests in the browser context
  async function executeFetch(endpoint, method = 'GET', body = null) {
    return await driver.executeAsyncScript((end, method, b, callback) => {
      const token = localStorage.getItem('ponis_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const config = { method, headers };
      if (b) config.body = JSON.stringify(b);

      fetch('/api' + end, config)
        .then(response => {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return response.json().then(data => callback({ status: response.status, data }));
          } else {
            return response.text().then(text => callback({ status: response.status, data: text }));
          }
        })
        .catch(err => callback({ status: 500, error: err.message }));
    }, endpoint, method, body);
  }

  // TC-052: API GET /patients
  await step(
    'API Endpoint: Get All Patients',
    'Execute fetch to /api/patients and assert status is 200 OK',
    async () => {
      const res = await executeFetch('/patients');
      if (res.status !== 200) throw new Error(`Status code was ${res.status}`);
      if (!Array.isArray(res.data)) throw new Error('Response data is not an array');
    }
  );

  // TC-053: API GET /meals
  await step(
    'API Endpoint: Get Patient Meals',
    'Execute fetch to /api/meals?patientId=1 and assert data integrity',
    async () => {
      const res = await executeFetch('/meals?patientId=1');
      if (res.status !== 200) throw new Error(`Status code was ${res.status}`);
      if (!Array.isArray(res.data)) throw new Error('Response meals data is not an array');
    }
  );

  // TC-054: API POST /meals/water
  await step(
    'API Endpoint: Log Water Intake',
    'Execute POST fetch to /api/meals/water and verify 201 Created',
    async () => {
      const res = await executeFetch('/meals/water', 'POST', { patientId: 1, intake: 250 });
      if (res.status !== 201) throw new Error(`Status code was ${res.status}`);
      if (!res.data.success) throw new Error('Success parameter is missing');
    }
  );

  // TC-055: API GET /analytics
  await step(
    'API Endpoint: Get Patient Analytics',
    'Execute fetch to /api/analytics?patientId=1 and assert summary fields',
    async () => {
      const res = await executeFetch('/analytics?patientId=1');
      if (res.status !== 200) throw new Error(`Status code was ${res.status}`);
      if (!res.data.summary) throw new Error('Analytics summary data missing');
    }
  );

  // TC-056: API GET /predictions
  await step(
    'API Endpoint: Get Patient Predictions',
    'Execute fetch to /api/predictions?patientId=1 and assert parameters structure',
    async () => {
      const res = await executeFetch('/predictions?patientId=1');
      if (res.status !== 200) throw new Error(`Status code was ${res.status}`);
      if (!res.data.fatigueRisk) throw new Error('Predictions fatigueRisk field is missing');
    }
  );

  // TC-057: API POST /predictions/recalculate
  await step(
    'API Endpoint: Recalculate Predictions',
    'Execute POST to /api/predictions/recalculate and assert math updates',
    async () => {
      const res = await executeFetch('/predictions/recalculate', 'POST', { patientId: 1 });
      if (res.status !== 200) throw new Error(`Status code was ${res.status}`);
      if (!res.data.success) throw new Error('Recalculation success indicator missing');
    }
  );

  // TC-058: API POST /auth/login (Invalid)
  await step(
    'API Endpoint: Invalid Login Gate',
    'Execute POST /api/auth/login with wrong credentials and assert 401 Unauthorized',
    async () => {
      const res = await executeFetch('/auth/login', 'POST', { username: 'bad', password: 'bad' });
      if (res.status !== 401) throw new Error(`Status code was ${res.status}`);
    }
  );

  // TC-059: API GET /analytics/hospital-summary
  await step(
    'API Endpoint: Get Hospital Summary',
    'Execute fetch to /api/analytics/hospital-summary and assert count data',
    async () => {
      const res = await executeFetch('/analytics/hospital-summary');
      if (res.status !== 200) throw new Error(`Status code was ${res.status}`);
      if (!res.data.statistics) throw new Error('Hospital statistics object missing');
    }
  );

  // TC-060: API Token authorization header check
  await step(
    'API Authorization Header Validation',
    'Execute fetch /api/patients without token and assert 401 Unauthorized is returned',
    async () => {
      const res = await driver.executeAsyncScript((callback) => {
        fetch('/api/patients', { method: 'GET', headers: { 'Content-Type': 'application/json' } })
          .then(response => callback(response.status))
          .catch(() => callback(500));
      });
      if (res !== 401) throw new Error(`Expected 401 but received: ${res}`);
    }
  );

  // TC-061: API GET invalid route
  await step(
    'API Endpoint: Invalid Route Handler',
    'Execute GET to non-existent API route and assert 404 Not Found response',
    async () => {
      const res = await executeFetch('/invalid-route-name');
      if (res.status !== 404) throw new Error(`Expected 404 but received: ${res.status}`);
    }
  );
};
