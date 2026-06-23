const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Import Testing Categories
const runFunctionalTests = require('./categories/functional');
const runUiUxTests = require('./categories/ui_ux');
const runCompatibilityTests = require('./categories/compatibility');
const runPerformanceTests = require('./categories/performance');
const runSecurityTests = require('./categories/security');
const runApiTests = require('./categories/api');
const runDatabaseTests = require('./categories/database');
const runAccessibilityTests = require('./categories/accessibility');
const runMobileTests = require('./categories/mobile');
const runRegressionTests = require('./categories/regression');
const runE2ETests = require('./categories/e2e');

// Configuration
const BASE_URL = 'http://localhost:5173/Nutrixa-frontend/';
const REPORT_PATH = path.join(__dirname, 'e2e-test-report.xlsx');

const results = [];
let driver;

function recordResult(id, name, desc, status, duration, error = '') {
  results.push({
    'Test ID': `TC-${String(id).padStart(3, '0')}`,
    'Test Case Name': name,
    'Description': desc,
    'Status': status,
    'Duration (ms)': duration,
    'Error Message': error,
    'Timestamp': new Date().toISOString()
  });
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function setReactInput(element, value) {
  const valStr = value !== undefined && value !== null ? String(value) : '';
  await driver.executeScript((el, val) => {
    try {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, val);
    } catch (e) {
      el.value = val;
    }
    const tracker = el._valueTracker;
    if (tracker && typeof tracker.setValue === 'function') {
      tracker.setValue(val === '' ? 'a' : '');
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, element, valStr);
  await delay(100);
}

async function main() {
  console.log('========================================================');
  console.log('🧬 Starting Refactored PONIS 100+ Categorized E2E Suite...');
  console.log(`   Target Frontend URL: ${BASE_URL}`);
  console.log('========================================================\n');

  // Setup Chrome options
  const options = new chrome.Options();
  options.addArguments('--headless'); // Headless for automation speed
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--window-size=1280,800');

  let stepId = 1;
  let hasFailed = false;

  async function step(name, desc, fn) {
    const start = Date.now();
    const currentId = stepId++;
    if (hasFailed) {
      recordResult(currentId, name, desc, 'SKIPPED', 0, 'Skipped due to previous step failure.');
      return;
    }

    try {
      await fn();
      const duration = Date.now() - start;
      recordResult(currentId, name, desc, 'PASS', duration);
      console.log(`✓ PASS [TC-${String(currentId).padStart(3, '0')}]: ${name} (${duration}ms)`);
    } catch (err) {
      const duration = Date.now() - start;
      try {
        const currentUrl = await driver.getCurrentUrl();
        const bodyText = await driver.findElement(By.tagName('body')).getText();
        console.error(`   [DEBUG DIAGNOSTIC] Failure URL: ${currentUrl}`);
        console.error(`   [DEBUG DIAGNOSTIC] Page body text:\n${bodyText.substring(0, 1500)}\n...`);
        
        const browserLogs = await driver.manage().logs().get('browser');
        console.error('   [BROWSER LOGS]:');
        for (const log of browserLogs) {
          console.error(`      [${log.level.name}] ${log.message}`);
        }
      } catch (diagErr) {
        console.error(`   [DEBUG DIAGNOSTIC] Failed to gather page state: ${diagErr.message}`);
      }
      recordResult(currentId, name, desc, 'FAIL', duration, err.message);
      console.error(`✗ FAIL [TC-${String(currentId).padStart(3, '0')}]: ${name} (${duration}ms)`);
      console.error(`   Error details: ${err.message}`);
      hasFailed = true;
    }
  }

  // TC-001: Webdriver Initialization
  await step(
    'WebDriver Initialization',
    'Initialize Chrome WebDriver in Headless Mode',
    async () => {
      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    }
  );

  try {
    // 1. Run Functional Tests (TC-002 to TC-015)
    console.log('\n--- Running Category 1: Functional Testing ---');
    await runFunctionalTests(driver, step, setReactInput, delay, BASE_URL);

    // 2. Run UI/UX Tests (TC-016 to TC-025)
    console.log('\n--- Running Category 2: UI/UX Testing ---');
    await runUiUxTests(driver, step, setReactInput, delay, BASE_URL);

    // 3. Run Compatibility Tests (TC-026 to TC-033)
    console.log('\n--- Running Category 3: Compatibility Testing ---');
    await runCompatibilityTests(driver, step, setReactInput, delay, BASE_URL);

    // 4. Run Performance Tests (TC-034 to TC-041)
    console.log('\n--- Running Category 4: Performance Testing ---');
    await runPerformanceTests(driver, step, setReactInput, delay, BASE_URL);

    // 5. Run Security Tests (TC-042 to TC-051)
    console.log('\n--- Running Category 5: Security Testing ---');
    await runSecurityTests(driver, step, setReactInput, delay, BASE_URL);

    // 6. Run API Tests (TC-052 to TC-061)
    console.log('\n--- Running Category 6: API Testing ---');
    await runApiTests(driver, step, setReactInput, delay, BASE_URL);

    // 7. Run Database Tests (TC-062 to TC-071)
    console.log('\n--- Running Category 7: Database Testing ---');
    await runDatabaseTests(driver, step, setReactInput, delay, BASE_URL);

    // 8. Run Accessibility Tests (TC-072 to TC-079)
    console.log('\n--- Running Category 8: Accessibility Testing ---');
    await runAccessibilityTests(driver, step, setReactInput, delay, BASE_URL);

    // 9. Run Mobile-Specific Tests (TC-080 to TC-087)
    console.log('\n--- Running Category 9: Mobile-Specific Testing ---');
    await runMobileTests(driver, step, setReactInput, delay, BASE_URL);

    // 10. Run Regression Tests (TC-088 to TC-095)
    console.log('\n--- Running Category 10: Regression Testing ---');
    await runRegressionTests(driver, step, setReactInput, delay, BASE_URL);

    // 11. Run E2E Tests (TC-096 to TC-105)
    console.log('\n--- Running Category 11: End-to-End (E2E) Testing ---');
    await runE2ETests(driver, step, setReactInput, delay, BASE_URL);

  } catch (err) {
    console.error('Fatal execution error within test modules orchestration:', err);
  } finally {
    if (driver) {
      await driver.quit();
    }
    console.log('\n========================================================');
    console.log('🏁 E2E Testing Suite Completed!');
    console.log('========================================================');
    writeExcelReport();
  }
}

function writeExcelReport() {
  const ws = XLSX.utils.json_to_sheet(results);

  // Setup styles and columns formatting
  const colWidths = [
    { wch: 10 }, // Test ID
    { wch: 35 }, // Test Case Name
    { wch: 55 }, // Description
    { wch: 10 }, // Status
    { wch: 15 }, // Duration (ms)
    { wch: 45 }, // Error Message
    { wch: 25 }  // Timestamp
  ];
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'PONIS E2E Efficacy Tests');

  try {
    XLSX.writeFile(wb, REPORT_PATH);
    console.log(`📊 Analysis Excel report generated successfully:`);
    console.log(`   Location: ${REPORT_PATH}`);
  } catch (err) {
    console.error(`⚠️ Could not write Excel report: ${err.message}`);
    // Write to a fallback path with a timestamp if the file is locked
    const ext = path.extname(REPORT_PATH);
    const base = path.basename(REPORT_PATH, ext);
    const fallbackPath = path.join(path.dirname(REPORT_PATH), `${base}-${Date.now()}${ext}`);
    try {
      XLSX.writeFile(wb, fallbackPath);
      console.log(`📊 Generated report at fallback location instead:`);
      console.log(`   Location: ${fallbackPath}`);
    } catch (fallbackErr) {
      console.error(`❌ Even fallback report failed: ${fallbackErr.message}`);
    }
  }
}

main().catch(err => {
  console.error('Fatal crash inside the runner script:', err);
  if (driver) {
    driver.quit();
  }
  writeExcelReport();
  process.exit(1);
});
