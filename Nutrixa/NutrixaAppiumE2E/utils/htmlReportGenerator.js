/**
 * ============================================================================
 *  Nutrixa Appium E2E — HTML Report Generator
 *  Generates a premium dark-themed execution dashboard for Android test results
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

function generate(results) {
  const total = results.length;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : '0.00';
  const totalDuration = results.reduce((acc, r) => acc + r.duration, 0);
  const avgDuration = total > 0 ? (totalDuration / total).toFixed(2) : '0';

  // Group by domain
  const domainMap = {};
  results.forEach(res => {
    if (!domainMap[res.domain]) {
      domainMap[res.domain] = { passed: 0, failed: 0, total: 0 };
    }
    domainMap[res.domain].total++;
    if (res.status === 'PASS') domainMap[res.domain].passed++;
    else domainMap[res.domain].failed++;
  });

  const htmlDir = path.resolve(__dirname, '../../Test_Results/HTML');
  if (!fs.existsSync(htmlDir)) fs.mkdirSync(htmlDir, { recursive: true });
  const reportPath = path.join(htmlDir, 'appium-execution-report.html');

  // Build domain cards
  let domainCardsHtml = '';
  Object.entries(domainMap).forEach(([domain, data]) => {
    const rate = ((data.passed / data.total) * 100).toFixed(1);
    const color = data.failed > 0 ? '#ef4444' : '#22c55e';
    const bg = data.failed > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)';
    domainCardsHtml += `
      <div class="domain-card">
        <h3>${domain}</h3>
        <div class="stat-row">
          <span>Total: ${data.total}</span>
          <span>Passed: <strong style="color:#22c55e">${data.passed}</strong></span>
        </div>
        <div class="stat-row">
          <span>Failed: <strong style="color:#ef4444">${data.failed}</strong></span>
          <span class="badge" style="background:${bg};color:${color};border:1px solid ${color}">${rate}%</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width:${rate}%;background:${color}"></div>
        </div>
      </div>`;
  });

  // Build test table rows
  let tableRows = '';
  results.forEach(res => {
    const statusClass = res.status === 'PASS' ? 'status-pass' : 'status-fail';
    tableRows += `
      <tr class="test-row" data-category="${res.category}" data-status="${res.status}">
        <td>TC-${String(res.id).padStart(4, '0')}</td>
        <td><span class="domain-badge">${res.domain}</span></td>
        <td class="category-col">${res.category}</td>
        <td>${res.name}</td>
        <td><span class="status-badge ${statusClass}">${res.status}</span></td>
        <td>${res.duration}ms</td>
      </tr>
      ${res.status === 'FAIL' ? `
      <tr class="error-row" data-category="${res.category}" data-status="FAIL">
        <td colspan="6"><pre class="error-stack">${res.errorStack || res.error}</pre></td>
      </tr>` : ''}`;
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nutrixa Android Appium E2E Execution Report</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #06090f;
      --bg-card: rgba(10, 17, 32, 0.45);
      --border-green: rgba(34, 197, 94, 0.15);
      --glow-green: 0 0 20px rgba(34, 197, 94, 0.3);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --green: #22c55e;
      --blue: #3b82f6;
      --cyan: #06b6d4;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--bg-dark);
      color: var(--text-main);
      padding: 2rem;
      min-height: 100vh;
      background-image:
        radial-gradient(circle at 10% 20%, rgba(34, 197, 94, 0.05) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 40%);
      background-attachment: fixed;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--border-green);
      padding-bottom: 1.5rem;
    }
    .header-left h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 2rem;
      font-weight: 800;
      background: linear-gradient(135deg, #22c55e 0%, #3b82f6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .header-left p { color: var(--text-muted); font-size: 0.9rem; margin-top: 0.2rem; }
    .timestamp {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid var(--border-green);
      padding: 0.5rem 1rem;
      border-radius: 99px;
      font-size: 0.8rem;
      color: var(--green);
      font-family: monospace;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-green);
      border-radius: 16px;
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 30px rgba(0,0,0,0.2);
    }
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0;
      width: 4px; height: 100%;
      background: linear-gradient(to bottom, var(--green), var(--blue));
    }
    .stat-card.pass::before { background: #22c55e; }
    .stat-card.fail::before { background: #ef4444; }
    .stat-card h4 { color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; }
    .stat-card .value { font-family: 'Outfit', sans-serif; font-size: 2rem; font-weight: 700; }
    .section-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.4rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .domains-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .domain-card {
      background: rgba(10, 17, 32, 0.3);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 1rem;
    }
    .domain-card h3 { font-size: 1rem; margin-bottom: 0.75rem; color: #e2e8f0; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem; }
    .stat-row { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem; }
    .badge { font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
    .progress-bar-container { width: 100%; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; margin-top: 0.5rem; }
    .progress-bar { height: 100%; border-radius: 3px; }
    .controls-panel {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      background: var(--bg-card);
      border: 1px solid var(--border-green);
      padding: 1rem;
      border-radius: 12px;
    }
    .filters { display: flex; gap: 0.5rem; }
    .filter-btn {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255,255,255,0.1);
      color: var(--text-muted);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .filter-btn:hover, .filter-btn.active {
      background: var(--green);
      color: var(--bg-dark);
      border-color: var(--green);
      box-shadow: 0 0 10px rgba(34, 197, 94, 0.4);
    }
    .search-box {
      background: rgba(10, 17, 32, 0.6);
      border: 1px solid rgba(255,255,255,0.1);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      width: 250px;
      font-size: 0.85rem;
    }
    .search-box:focus { outline: none; border-color: var(--green); box-shadow: var(--glow-green); }
    .table-container {
      background: var(--bg-card);
      border: 1px solid var(--border-green);
      border-radius: 16px;
      overflow-x: auto;
      box-shadow: 0 4px 30px rgba(0,0,0,0.2);
    }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
    th { background: rgba(10, 17, 32, 0.8); color: var(--green); font-weight: 700; padding: 1rem; border-bottom: 1px solid var(--border-green); }
    td { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); color: #cbd5e1; }
    tr:hover td { background: rgba(255,255,255,0.02); }
    .domain-badge { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: #4ade80; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
    .category-col { font-weight: 600; color: #94a3b8; }
    .status-badge { display: inline-block; padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 0.75rem; }
    .status-badge.status-pass { background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.4); color: #4ade80; }
    .status-badge.status-fail { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color: #f87171; }
    .error-row { background: rgba(239, 68, 68, 0.05); }
    .error-stack { padding: 1rem; font-family: monospace; font-size: 0.8rem; color: #f87171; white-space: pre-wrap; overflow-x: auto; border-left: 3px solid #ef4444; background: rgba(0,0,0,0.2); border-radius: 4px; margin: 0.5rem; }
  </style>
</head>
<body>
  <header>
    <div class="header-left">
      <h1>📱 Nutrixa Android Appium E2E Audit Report</h1>
      <p>Continuous Integration — Android Appium Mobile E2E Pipeline and Verification Logs</p>
    </div>
    <div class="header-right">
      <span class="timestamp">Generated: ${new Date().toUTCString()}</span>
    </div>
  </header>

  <main>
    <div class="stats-grid">
      <div class="stat-card">
        <h4>Total Checkpoints</h4>
        <div class="value" style="color:var(--green)">${total}</div>
      </div>
      <div class="stat-card pass">
        <h4>Passed</h4>
        <div class="value" style="color:#22c55e">${passed}</div>
      </div>
      <div class="stat-card fail">
        <h4>Failed</h4>
        <div class="value" style="color:#ef4444">${failed}</div>
      </div>
      <div class="stat-card" style="border-color:${passRate === '100.00' ? '#22c55e' : '#eab308'}">
        <h4>Pass Rate</h4>
        <div class="value" style="color:${passRate === '100.00' ? '#22c55e' : '#eab308'}">${passRate}%</div>
      </div>
      <div class="stat-card">
        <h4>Total Duration</h4>
        <div class="value" style="color:#a855f7">${totalDuration}ms</div>
      </div>
    </div>

    <section style="margin-bottom:2rem">
      <h2 class="section-title">📊 Android Test Domain Breakdowns</h2>
      <div class="domains-grid">
        ${domainCardsHtml}
      </div>
    </section>

    <section>
      <h2 class="section-title">🩺 Assertions Verification Matrix</h2>
      <div class="controls-panel">
        <div class="filters">
          <button class="filter-btn active" onclick="filterResults('ALL',this)">ALL (${total})</button>
          <button class="filter-btn" onclick="filterResults('PASS',this)">PASSED (${passed})</button>
          <button class="filter-btn" onclick="filterResults('FAIL',this)">FAILED (${failed})</button>
        </div>
        <input type="text" class="search-box" id="searchBar" onkeyup="searchTable()" placeholder="Search assertions or categories...">
      </div>
      <div class="table-container">
        <table id="testTable">
          <thead>
            <tr>
              <th>Test ID</th>
              <th>Domain</th>
              <th>Category</th>
              <th>Assertion Description</th>
              <th>Status</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    </section>
  </main>

  <script>
    function filterResults(status, btn) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const rows = document.querySelectorAll('#testTable tbody .test-row');
      rows.forEach(row => {
        const rowStatus = row.getAttribute('data-status');
        const next = row.nextElementSibling;
        const isErr = next && next.classList.contains('error-row');
        if (status === 'ALL' || rowStatus === status) {
          row.style.display = '';
          if (isErr && rowStatus === 'FAIL') next.style.display = '';
        } else {
          row.style.display = 'none';
          if (isErr) next.style.display = 'none';
        }
      });
    }
    function searchTable() {
      const q = document.getElementById('searchBar').value.toLowerCase();
      document.querySelectorAll('#testTable tbody .test-row').forEach(row => {
        const t = row.innerText.toLowerCase();
        const next = row.nextElementSibling;
        const isErr = next && next.classList.contains('error-row');
        if (t.includes(q)) {
          row.style.display = '';
          if (isErr && row.getAttribute('data-status') === 'FAIL') next.style.display = '';
        } else {
          row.style.display = 'none';
          if (isErr) next.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>`;

  fs.writeFileSync(reportPath, html);
  console.log(`  🖥️  HTML report written to: ${reportPath}`);

  // Write GitHub Step Summary if available
  if (process.env.GITHUB_STEP_SUMMARY) {
    // Handled in appiumExcelReporter.js
  }

  return reportPath;
}

module.exports = { generate };
