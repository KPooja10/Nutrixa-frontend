import http from 'k6/http';
import { sleep, check } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

export const options = {
  stages: [
    { duration: '10s', target: 30 }, // Ramp up to 30 virtual users
    { duration: '20s', target: 30 }, // Stay at 30 VUs
    { duration: '10s', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% of requests must complete under 5000ms
    http_req_failed: ['rate<0.01'],    // Less than 1% errors
  },
};

export default function () {
  const url = __ENV.API_BASE_URL || 'http://localhost:5000';
  
  // 1. Health Endpoint Check
  const resHealth = http.get(`${url}/health`);
  check(resHealth, {
    'health status is 200': (r) => r.status === 200,
    'health body contains UP': (r) => r.body.includes('UP'),
  });
  sleep(1);

  // 2. Doctor Mock Login load check
  const payload = JSON.stringify({
    username: 'doctor',
    password: 'doctor123',
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const resLogin = http.post(`${url}/auth/login`, payload, params);
  check(resLogin, {
    'login returns 200': (r) => r.status === 200,
  });
  sleep(1);
}

export function handleSummary(data) {
  const checksRate = data.metrics.checks ? (data.metrics.checks.values.rate * 100).toFixed(2) : '100.00';
  const avgLatency = data.metrics.http_req_duration.values.avg.toFixed(2);
  const p95Latency = data.metrics.http_req_duration.values['p(95)'].toFixed(2);
  const maxLatency = data.metrics.http_req_duration.values.max.toFixed(2);
  const totalReqs = data.metrics.http_reqs.values.count;
  const reqRate = data.metrics.http_reqs.values.rate.toFixed(2);

  const mdSummary = `### ⚡ k6 Load & Performance Test Pipeline Summary

- **Total Requests Sent**: **${totalReqs}**
- **Average Request Rate**: **${reqRate} req/sec**
- **Success Rate (Checks Passed)**: **${checksRate}%**

#### ⏱️ Latency Metrics
- **Average Latency**: **${avgLatency} ms**
- **95th Percentile (p95)**: **${p95Latency} ms**
- **Maximum Latency**: **${maxLatency} ms**
`;

  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'load-test-summary.md': mdSummary,
  };
}
