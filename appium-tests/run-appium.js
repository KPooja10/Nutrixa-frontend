/**
 * ================================================================
 *  PONIS - Predictive Oncology Nutrition Intelligence System
 *  Android Mobile App - Full Appium E2E Test Suite
 *  Runner: run-appium.js
 *
 *  Covers 11 categories, 100+ test cases (TC-001 to TC-110)
 *  Generates Excel analysis report on completion.
 * ================================================================
 */

const { remote } = require('webdriverio');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// ── Import Test Categories ────────────────────────────────────────
const runFunctionalTests     = require('./categories/functional');
const runUiUxTests           = require('./categories/ui_ux');
const runNavigationTests     = require('./categories/navigation');
const runPerformanceTests    = require('./categories/performance');
const runSecurityTests       = require('./categories/security');
const runApiTests            = require('./categories/api');
const runPatientTests        = require('./categories/patient');
const runAccessibilityTests  = require('./categories/accessibility');
const runGestureTests        = require('./categories/gestures');
const runRegressionTests     = require('./categories/regression');
const runE2EFlowTests        = require('./categories/e2e_flow');

// ── Configuration ────────────────────────────────────────────────
const REPORT_PATH   = path.join(__dirname, 'reports', 'ponis-mobile-test-report.xlsx');
const BACKEND_URL   = 'http://10.0.2.2:3000'; // Android emulator -> localhost

// ── Appium Capabilities (Android) ───────────────────────────────
const CAPABILITIES = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'Android Emulator',
  'appium:platformVersion': '13.0',
  // ✅ UPDATE THIS PATH to your compiled PONIS .apk file
  'appium:app': path.join(__dirname, 'app', 'ponis.apk'),
  'appium:appPackage': 'com.ponis.app',
  'appium:appActivity': 'com.ponis.app.MainActivity',
  'appium:noReset': false,
  'appium:fullReset': false,
  'appium:newCommandTimeout': 120,
  'appium:autoGrantPermissions': true,
};

const WDIO_OPTIONS = {
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',
  capabilities: CAPABILITIES,
  logLevel: 'warn',
  connectionRetryCount: 3,
  connectionRetryTimeout: 60000,
};

// ── Result Store ─────────────────────────────────────────────────
const results = [];
let driver;
let stepId = 1;
let hasFailed = false;

// ── Helpers ──────────────────────────────────────────────────────
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function recordResult(id, category, name, desc, status, duration, error = '') {
  results.push({
    'Test ID'        : `TC-${String(id).padStart(3, '0')}`,
    'Category'       : category,
    'Test Case Name' : name,
    'Description'    : desc,
    'Status'         : status,
    'Duration (ms)'  : duration,
    'Error Message'  : error,
    'Timestamp'      : new Date().toISOString(),
  });
}

/**
 * step() — wraps each test case with timing, error capture and Excel recording.
 * @param {string}   category  - Category label (e.g. "Functional")
 * @param {string}   name      - Short test case title
 * @param {string}   desc      - Longer description
 * @param {Function} fn        - Async test body
 */
async function step(category, name, desc, fn) {
  const start     = Date.now();
  const currentId = stepId++;

  if (hasFailed) {
    recordResult(currentId, category, name, desc, 'SKIPPED', 0, 'Skipped due to prior failure.');
    console.log(`⏭  SKIP [TC-${String(currentId).padStart(3, '0')}]: ${name}`);
    return;
  }

  try {
    await fn();
    const duration = Date.now() - start;
    recordResult(currentId, category, name, desc, 'PASS', duration);
    console.log(`✅ PASS [TC-${String(currentId).padStart(3, '0')}]: ${name} (${duration}ms)`);
  } catch (err) {
    const duration = Date.now() - start;
    recordResult(currentId, category, name, desc, 'FAIL', duration, err.message);
    console.error(`❌ FAIL [TC-${String(currentId).padStart(3, '0')}]: ${name} (${duration}ms)`);
    console.error(`   ↳ ${err.message}`);
    hasFailed = true;
  }
}

// ── Excel Report Writer ──────────────────────────────────────────
function writeExcelReport() {
  // Ensure reports directory exists
  const reportsDir = path.dirname(REPORT_PATH);
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const ws = XLSX.utils.json_to_sheet(results);

  // Column widths
  ws['!cols'] = [
    { wch: 10 },  // Test ID
    { wch: 22 },  // Category
    { wch: 38 },  // Test Case Name
    { wch: 58 },  // Description
    { wch: 10 },  // Status
    { wch: 15 },  // Duration
    { wch: 50 },  // Error Message
    { wch: 26 },  // Timestamp
  ];

  // Summary sheet
  const passed  = results.filter(r => r.Status === 'PASS').length;
  const failed  = results.filter(r => r.Status === 'FAIL').length;
  const skipped = results.filter(r => r.Status === 'SKIPPED').length;
  const total   = results.length;

  const summaryData = [
    { Metric: 'Total Test Cases',  Value: total },
    { Metric: 'Passed ✅',         Value: passed },
    { Metric: 'Failed ❌',         Value: failed },
    { Metric: 'Skipped ⏭',        Value: skipped },
    { Metric: 'Pass Rate (%)',     Value: total > 0 ? ((passed / total) * 100).toFixed(2) + '%' : '0%' },
    { Metric: 'Run Date',          Value: new Date().toLocaleString() },
    { Metric: 'Platform',          Value: 'Android (Appium UiAutomator2)' },
    { Metric: 'Application',       Value: 'PONIS - Predictive Oncology Nutrition Intelligence System' },
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 28 }, { wch: 35 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
  XLSX.utils.book_append_sheet(wb, ws, 'All Test Results');

  try {
    XLSX.writeFile(wb, REPORT_PATH);
    console.log(`\n📊 Excel Report Generated:`);
    console.log(`   📁 ${REPORT_PATH}`);
    console.log(`\n   ✅ Passed : ${passed}`);
    console.log(`   ❌ Failed : ${failed}`);
    console.log(`   ⏭  Skipped: ${skipped}`);
    console.log(`   📋 Total  : ${total}`);
  } catch (writeErr) {
    // Fallback with timestamp suffix if file is locked
    const fallback = REPORT_PATH.replace('.xlsx', `-${Date.now()}.xlsx`);
    XLSX.writeFile(wb, fallback);
    console.log(`\n📊 Report saved to fallback: ${fallback}`);
  }
}

// ── Main Orchestrator ────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   📱 PONIS Android Appium Mobile E2E Test Suite           ║');
  console.log('║   Platform  : Android (UiAutomator2)                      ║');
  console.log('║   Backend   : ' + BACKEND_URL.padEnd(43) + '║');
  console.log('║   Test Cases: 110+ across 11 categories                   ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // ── TC-001: Appium Driver Initialization ──────────────────────
  const initStart = Date.now();
  const currentId = stepId++;
  try {
    driver = await remote(WDIO_OPTIONS);
    await delay(3000); // Let app settle
    recordResult(currentId, 'Setup', 'Appium Driver Init', 'Initialize Appium WebDriverIO session with Android UiAutomator2', 'PASS', Date.now() - initStart);
    console.log(`✅ PASS [TC-001]: Appium Driver Initialized (${Date.now() - initStart}ms)`);
  } catch (err) {
    recordResult(currentId, 'Setup', 'Appium Driver Init', 'Initialize Appium WebDriverIO session with Android UiAutomator2', 'FAIL', Date.now() - initStart, err.message);
    console.error(`❌ FAIL [TC-001]: Appium Driver Init failed: ${err.message}`);
    console.error('\n⚠️  Ensure Appium server is running: npx appium');
    console.error('⚠️  Ensure Android emulator is running and app APK path is correct.');
    writeExcelReport();
    return;
  }

  try {
    // ── Category 1: Functional (TC-002 to TC-014) ──────────────
    console.log('\n━━━ Category 1: Functional Testing ━━━━━━━━━━━━━━━━━━━━━━━');
    await runFunctionalTests(driver, step, delay, BACKEND_URL);

    // ── Category 2: UI/UX (TC-015 to TC-024) ───────────────────
    console.log('\n━━━ Category 2: UI/UX Testing ━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    await runUiUxTests(driver, step, delay, BACKEND_URL);

    // ── Category 3: Navigation (TC-025 to TC-034) ──────────────
    console.log('\n━━━ Category 3: Navigation Testing ━━━━━━━━━━━━━━━━━━━━━━━');
    await runNavigationTests(driver, step, delay, BACKEND_URL);

    // ── Category 4: Performance (TC-035 to TC-044) ─────────────
    console.log('\n━━━ Category 4: Performance Testing ━━━━━━━━━━━━━━━━━━━━━━');
    await runPerformanceTests(driver, step, delay, BACKEND_URL);

    // ── Category 5: Security (TC-045 to TC-054) ────────────────
    console.log('\n━━━ Category 5: Security Testing ━━━━━━━━━━━━━━━━━━━━━━━━━');
    await runSecurityTests(driver, step, delay, BACKEND_URL);

    // ── Category 6: API (TC-055 to TC-064) ─────────────────────
    console.log('\n━━━ Category 6: API Integration Testing ━━━━━━━━━━━━━━━━━━');
    await runApiTests(driver, step, delay, BACKEND_URL);

    // ── Category 7: Patient Management (TC-065 to TC-074) ──────
    console.log('\n━━━ Category 7: Patient Management Testing ━━━━━━━━━━━━━━━');
    await runPatientTests(driver, step, delay, BACKEND_URL);

    // ── Category 8: Accessibility (TC-075 to TC-082) ───────────
    console.log('\n━━━ Category 8: Accessibility Testing ━━━━━━━━━━━━━━━━━━━━');
    await runAccessibilityTests(driver, step, delay, BACKEND_URL);

    // ── Category 9: Gestures & Touch (TC-083 to TC-090) ────────
    console.log('\n━━━ Category 9: Gesture & Touch Testing ━━━━━━━━━━━━━━━━━━');
    await runGestureTests(driver, step, delay, BACKEND_URL);

    // ── Category 10: Regression (TC-091 to TC-100) ─────────────
    console.log('\n━━━ Category 10: Regression Testing ━━━━━━━━━━━━━━━━━━━━━━');
    await runRegressionTests(driver, step, delay, BACKEND_URL);

    // ── Category 11: Full E2E Flow (TC-101 to TC-110) ──────────
    console.log('\n━━━ Category 11: End-to-End Flow Testing ━━━━━━━━━━━━━━━━━');
    await runE2EFlowTests(driver, step, delay, BACKEND_URL);

  } catch (fatalErr) {
    console.error('\n💥 Fatal orchestration error:', fatalErr.message);
  } finally {
    if (driver) {
      try { await driver.deleteSession(); } catch (_) {}
    }
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║   🏁 PONIS Appium Mobile Suite Completed                  ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    writeExcelReport();
  }
}

main().catch(err => {
  console.error('💥 Unhandled crash in runner:', err);
  writeExcelReport();
  process.exit(1);
});
