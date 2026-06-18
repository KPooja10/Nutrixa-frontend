const fs = require('fs');
const path = require('path');

function generate(results) {
  const total = results.length;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const passRate = ((passed / total) * 100).toFixed(2);
  const totalDuration = results.reduce((acc, r) => acc + r.duration, 0);
  const avgDuration = (totalDuration / total).toFixed(2);

  // Group by testing type
  const typeMap = {};
  results.forEach(res => {
    if (!typeMap[res.type]) {
      typeMap[res.type] = { passed: 0, failed: 0, total: 0 };
    }
    typeMap[res.type].total++;
    if (res.status === 'PASS') {
      typeMap[res.type].passed++;
    } else {
      typeMap[res.type].failed++;
    }
  });

  const htmlDir = path.resolve(__dirname, '../../Test_Results/HTML');
  if (!fs.existsSync(htmlDir)) {
    fs.mkdirSync(htmlDir, { recursive: true });
  }
  const reportPath = path.join(htmlDir, 'execution-report.html');

  // Build type cards HTML
  let typeCardsHtml = '';
  Object.keys(typeMap).forEach(type => {
    const data = typeMap[type];
    const rate = ((data.passed / data.total) * 100).toFixed(1);
    const badgeColor = data.failed > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)';
    const textBorderColor = data.failed > 0 ? '#ef4444' : '#22c55e';
    typeCardsHtml += `
      <div class="category-card">
        <h3>${type}</h3>
        <div class="stat-row">
          <span>Total: ${data.total}</span>
          <span>Passed: <strong style="color: #22c55e;">${data.passed}</strong></span>
        </div>
        <div class="stat-row">
          <span>Failed: <strong style="color: #ef4444;">${data.failed}</strong></span>
          <span class="badge" style="background: ${badgeColor}; color: ${textBorderColor}; border: 1px solid ${textBorderColor};">${rate}%</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${rate}%; background: ${textBorderColor};"></div>
        </div>
      </div>
    `;
  });

  // Build table rows
  let tableRowsHtml = '';
  results.forEach(res => {
    const statusClass = res.status === 'PASS' ? 'status-pass' : 'status-fail';
    const errorHtml = res.status === 'FAIL' ? `
      <tr class="error-row" data-category="${res.category}" data-status="FAIL">
        <td colspan="6">
          <pre class="error-stack">${res.errorStack || res.error}</pre>
        </td>
      </tr>
    ` : '';
    tableRowsHtml += `
      <tr class="test-row" data-category="${res.category}" data-status="${res.status}">
        <td>TC-${String(res.id).padStart(4, '0')}</td>
        <td><span class="type-badge">${res.type}</span></td>
        <td class="category-col">${res.category}</td>
        <td>${res.name}</td>
        <td><span class="status-badge ${statusClass}">${res.status}</span></td>
        <td>${res.duration}ms</td>
      </tr>
      ${errorHtml}
    `;
  });

  // Full HTML Content
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nutrixa E2E Execution Report</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #070a13;
      --bg-card: rgba(15, 23, 42, 0.45);
      --border-cyan: rgba(6, 182, 212, 0.15);
      --glow-cyan: 0 0 20px rgba(6, 182, 212, 0.3);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --cyan: #06b6d4;
      --blue: #3b82f6;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--bg-dark);
      color: var(--text-main);
      padding: 2rem;
      min-height: 100vh;
      background-image: radial-gradient(circle at 10% 20%, rgba(6, 182, 212, 0.05) 0%, transparent 40%),
                        radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 40%);
      background-attachment: fixed;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--border-cyan);
      padding-bottom: 1.5rem;
    }

    .header-left h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 2.2rem;
      font-weight: 800;
      background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .header-left p {
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-top: 0.2rem;
    }

    .header-right {
      text-align: right;
    }

    .timestamp {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid var(--border-cyan);
      padding: 0.5rem 1rem;
      border-radius: 99px;
      font-size: 0.8rem;
      color: var(--cyan);
      font-family: monospace;
    }

    /* Dashboard Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-cyan);
      border-radius: 16px;
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(to bottom, var(--cyan), var(--blue));
    }

    .stat-card.pass::before {
      background: #22c55e;
    }

    .stat-card.fail::before {
      background: #ef4444;
    }

    .stat-card h4 {
      color: var(--text-muted);
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 0.5rem;
    }

    .stat-card .value {
      font-family: 'Outfit', sans-serif;
      font-size: 2rem;
      font-weight: 700;
    }

    /* Subcategories Grid */
    .categories-section {
      margin-bottom: 2rem;
    }

    .section-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.4rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1rem;
    }

    .category-card {
      background: rgba(15, 23, 42, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 1rem;
    }

    .category-card h3 {
      font-size: 1rem;
      margin-bottom: 0.75rem;
      color: #e2e8f0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: 0.5rem;
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }

    .badge {
      font-size: 0.75rem;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: bold;
    }

    .progress-bar-container {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
      overflow: hidden;
      margin-top: 0.5rem;
    }

    .progress-bar {
      height: 100%;
      border-radius: 3px;
    }

    /* Controls & Search */
    .controls-panel {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      background: var(--bg-card);
      border: 1px solid var(--border-cyan);
      padding: 1rem;
      border-radius: 12px;
    }

    .filters {
      display: flex;
      gap: 0.5rem;
    }

    .filter-btn {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--text-muted);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s;
    }

    .filter-btn:hover, .filter-btn.active {
      background: var(--cyan);
      color: var(--bg-dark);
      border-color: var(--cyan);
      box-shadow: 0 0 10px rgba(6, 182, 212, 0.4);
    }

    .search-box {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      width: 250px;
      font-size: 0.85rem;
    }

    .search-box:focus {
      outline: none;
      border-color: var(--cyan);
      box-shadow: var(--glow-cyan);
    }

    /* Table styling */
    .table-container {
      background: var(--bg-card);
      border: 1px solid var(--border-cyan);
      border-radius: 16px;
      overflow-x: auto;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }

    th {
      background: rgba(15, 23, 42, 0.8);
      color: var(--cyan);
      font-weight: 700;
      padding: 1rem;
      border-bottom: 1px solid var(--border-cyan);
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: #cbd5e1;
    }

    tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    .type-badge {
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.3);
      color: #60a5fa;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: bold;
    }

    .category-col {
      font-weight: 600;
      color: #94a3b8;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 0.75rem;
    }

    .status-badge.status-pass {
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.4);
      color: #4ade80;
    }

    .status-badge.status-fail {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #f87171;
    }

    /* Error collapsible details */
    .error-row {
      background: rgba(239, 68, 68, 0.05);
    }

    .error-stack {
      padding: 1rem;
      font-family: monospace;
      font-size: 0.8rem;
      color: #f87171;
      white-space: pre-wrap;
      overflow-x: auto;
      border-left: 3px solid #ef4444;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
      margin: 0.5rem;
    }
  </style>
</head>
<body>

  <header>
    <div class="header-left">
      <h1>🧬 Nutrixa E2E Clinical Audit Report</h1>
      <p>Continuous Integration Web E2E Pipeline and Verification Logs</p>
    </div>
    <div class="header-right">
      <span class="timestamp">Generated: ${new Date().toUTCString()}</span>
    </div>
  </header>

  <main>
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <h4>Total Checkpoints</h4>
        <div class="value" style="color: var(--cyan);">${total}</div>
      </div>
      <div class="stat-card pass">
        <h4>Passed Checkpoints</h4>
        <div class="value" style="color: #22c55e;">${passed}</div>
      </div>
      <div class="stat-card fail">
        <h4>Failed Checkpoints</h4>
        <div class="value" style="color: #ef4444;">${failed}</div>
      </div>
      <div class="stat-card" style="border-color: ${passRate === '100.00' ? '#22c55e' : '#eab308'};">
        <h4>Pipeline Success Rate</h4>
        <div class="value" style="color: ${passRate === '100.00' ? '#22c55e' : '#eab308'};">${passRate}%</div>
      </div>
      <div class="stat-card">
        <h4>Total Exec Duration</h4>
        <div class="value" style="color: #a855f7;">${totalDuration}ms</div>
      </div>
    </div>

    <!-- Testing Types Breakdown -->
    <section class="categories-section">
      <h2 class="section-title">📊 Testing Domain Breakdowns</h2>
      <div class="categories-grid">
        ${typeCardsHtml}
      </div>
    </section>

    <!-- Interactive Execution Grid -->
    <section class="execution-section">
      <h2 class="section-title">🩺 Assertions Verification Matrix</h2>
      <div class="controls-panel">
        <div class="filters">
          <button class="filter-btn active" onclick="filterResults('ALL', this)">ALL (${total})</button>
          <button class="filter-btn" onclick="filterResults('PASS', this)">PASSED (${passed})</button>
          <button class="filter-btn" onclick="filterResults('FAIL', this)">FAILED (${failed})</button>
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
            ${tableRowsHtml}
          </tbody>
        </table>
      </div>
    </section>
  </main>

  <script>
    function filterResults(status, btn) {
      // Update filter active styling
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const rows = document.querySelectorAll('#testTable tbody .test-row');
      const errRows = document.querySelectorAll('#testTable tbody .error-row');

      rows.forEach((row, index) => {
        const rowStatus = row.getAttribute('data-status');
        const nextErrRow = row.nextElementSibling;
        const isErr = nextErrRow && nextErrRow.classList.contains('error-row');

        if (status === 'ALL' || rowStatus === status) {
          row.style.display = '';
          if (isErr && rowStatus === 'FAIL') {
            nextErrRow.style.display = '';
          }
        } else {
          row.style.display = 'none';
          if (isErr) {
            nextErrRow.style.display = 'none';
          }
        }
      });
    }

    function searchTable() {
      const query = document.getElementById('searchBar').value.toLowerCase();
      const rows = document.querySelectorAll('#testTable tbody .test-row');

      rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        const nextErrRow = row.nextElementSibling;
        const isErr = nextErrRow && nextErrRow.classList.contains('error-row');

        if (text.includes(query)) {
          row.style.display = '';
          if (isErr && row.getAttribute('data-status') === 'FAIL') {
            nextErrRow.style.display = '';
          }
        } else {
          row.style.display = 'none';
          if (isErr) {
            nextErrRow.style.display = 'none';
          }
        }
      });
    }
  </script>
</body>
</html>
  `;

  fs.writeFileSync(reportPath, htmlContent);
  console.log(`🖥️ HTML report written to: ${reportPath}`);

  if (process.env.GITHUB_STEP_SUMMARY) {
    const summaryPath = process.env.GITHUB_STEP_SUMMARY;
    const summaryMarkdown = `### 🧬 Nutrixa E2E Clinical Audit Pipeline Summary

- **Total Assertions**: **${total}**
- **Passed Checkpoints**: **${passed}**
- **Failed Checkpoints**: **${failed}**
- **Pipeline Success Rate**: **${passRate}%**
- **Total Duration**: **${totalDuration} ms**

#### 🔗 Audit Report Visualizer Links
- 🌐 [Latest Live HTML Audit Report](https://kpooja10.github.io/Nutrixa-frontend/reports/latest/execution-report.html)
- 📜 [Historical Build HTML Report (Build #${process.env.GITHUB_RUN_NUMBER || 'latest'})](https://kpooja10.github.io/Nutrixa-frontend/reports/history/build-${process.env.GITHUB_RUN_NUMBER || 'latest'}/execution-report.html)
`;
    fs.appendFileSync(summaryPath, summaryMarkdown);
    console.log(`📝 Appended pipeline step summary to GITHUB_STEP_SUMMARY.`);
  }
}

module.exports = { generate };
