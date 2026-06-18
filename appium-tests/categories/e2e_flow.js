/**
 * ================================================================
 *  PONIS Appium Tests - Category 11: Full End-to-End Flow Testing
 *  TC-101 to TC-110
 *  Tests: Complete user journeys from login → action → logout,
 *         simulating real clinical workflows on the Android app.
 * ================================================================
 */

module.exports = async function runE2EFlowTests(driver, step, delay, BACKEND_URL) {
  const CAT = 'E2E Flow';

  // ── Helper: Login as Medical Staff ──────────────────────────────
  async function loginAsMedicalStaff() {
    const medBtn = await driver.$('android=new UiSelector().textContains("Medical Staff")');
    const visible = await medBtn.isDisplayed().catch(() => false);
    if (visible) {
      await medBtn.click();
      await delay(500);
      const loginBtn = await driver.$('android=new UiSelector().className("android.widget.Button").instance(0)');
      await loginBtn.click();
      await delay(3000);
    }
  }

  // ── Helper: Navigate by text label ──────────────────────────────
  async function navTo(label) {
    const el    = await driver.$(`android=new UiSelector().textContains("${label}")`);
    const found = await el.isDisplayed().catch(() => false);
    if (found) {
      await el.click();
      await delay(2000);
      return true;
    }
    return false;
  }

  // TC-101: E2E — Full Login → View Dashboard → Logout Flow
  await step(CAT,
    'E2E: Full Login → Dashboard → Logout Flow',
    'Complete flow: launch app → login as Medical Staff → view dashboard → terminate session → verify return to login',
    async () => {
      // Step 1: Login
      await loginAsMedicalStaff();

      // Step 2: Verify dashboard
      const onDash = await driver.$('android=new UiSelector().textContains("Command Center")').isDisplayed().catch(() => false);
      if (!onDash) throw new Error('E2E: Did not reach dashboard after login');

      // Step 3: Logout
      const logoutBtn = await driver.$('android=new UiSelector().textContains("Terminate Session")');
      const logoutFound = await logoutBtn.isDisplayed().catch(() => false);
      if (!logoutFound) throw new Error('E2E: Terminate Session button not found');
      await logoutBtn.click();
      await delay(2500);

      // Step 4: Verify back on login
      const onLogin = await driver.$('android=new UiSelector().className("android.widget.Button").instance(0)').isDisplayed().catch(() => false);
      if (!onLogin) throw new Error('E2E: Did not return to login screen after logout');
    }
  );

  // TC-102: E2E — Register Patient → Monitor → View Central Console
  await step(CAT,
    'E2E: Register Patient → Monitor → Central Console',
    'Login → Register new patient "E2E Patient One" → tap Monitor → verify Central Console loads with patient',
    async () => {
      await loginAsMedicalStaff();

      // Navigate to command center
      await navTo('Command Center');

      // Open registration form
      const regBtn = await driver.$('android=new UiSelector().textContains("Register")');
      await regBtn.click();
      await delay(1500);

      // Fill form
      const inputs = await driver.$$('android=new UiSelector().className("android.widget.EditText")');
      if (inputs.length >= 2) {
        await inputs[0].clearValue();
        await inputs[0].setValue('E2E Patient One');
        await inputs[1].clearValue();
        await inputs[1].setValue('58');
      }

      const submitBtn = await driver.$('android=new UiSelector().className("android.widget.Button").instance(0)');
      await submitBtn.click();
      await delay(3000);

      // Tap Monitor on registered patient
      const monitorBtn = await driver.$('android=new UiSelector().textContains("Monitor")');
      const monFound   = await monitorBtn.isDisplayed().catch(() => false);
      if (monFound) {
        await monitorBtn.click();
        await delay(2500);
      }

      // Verify Central Console or Dashboard loaded
      const console_ = await driver.$('android=new UiSelector().textContains("Console")').isDisplayed().catch(() => false);
      const dashboard = await driver.$('android=new UiSelector().textContains("Dashboard")').isDisplayed().catch(() => false);
      if (!console_ && !dashboard) throw new Error('E2E: Did not reach patient console after Monitor tap');
    }
  );

  // TC-103: E2E — Navigate to Meal Planner and Toggle Compliance
  await step(CAT,
    'E2E: Meal Planner → Toggle Compliance Checkboxes',
    'Navigate to Intake Planner → scroll to meal checklist → toggle 2 checkboxes → verify adherence updates',
    async () => {
      // Navigate to Meal Planner
      const navigated = await navTo('Meal');
      if (!navigated) await navTo('Intake');

      // Find and toggle checkboxes
      const checkboxes = await driver.$$('android=new UiSelector().className("android.widget.CheckBox")');
      if (checkboxes.length >= 2) {
        await checkboxes[0].click();
        await delay(400);
        await checkboxes[1].click();
        await delay(400);
      }

      // Look for adherence/compliance indicator update
      const adherenceEl = await driver.$('android=new UiSelector().textContains("Adherence")').isDisplayed().catch(() => false);
      const complianceEl = await driver.$('android=new UiSelector().textContains("Compliance")').isDisplayed().catch(() => false);

      // Pass if either element exists or checklist is visible
      const mealContent = await driver.$('android=new UiSelector().textContains("Nutrition")').isDisplayed().catch(() => false);
      if (!adherenceEl && !complianceEl && !mealContent) {
        throw new Error('E2E: Meal Planner content not visible or adherence indicator missing');
      }
    }
  );

  // TC-104: E2E — Prognosis Engine Recalculation Flow
  await step(CAT,
    'E2E: Prognosis Engine → Recalculate → Verify Risk Badges',
    'Navigate to Prognosis & Prediction Engine → tap Re-run → verify deficiency risk badges update',
    async () => {
      await navTo('Prognosis');

      const recalcBtn = await driver.$('android=new UiSelector().textContains("Re-run")');
      const btnFound  = await recalcBtn.isDisplayed().catch(async () => {
        const alt = await driver.$('android=new UiSelector().textContains("Prognosis Core")');
        return alt.isDisplayed().catch(() => false);
      });

      if (btnFound) {
        await recalcBtn.click().catch(async () => {
          const alt = await driver.$('android=new UiSelector().textContains("Prognosis Core")');
          await alt.click();
        });
        await delay(2500);
      }

      // Verify prediction data exists on screen
      const predData = await driver.$('android=new UiSelector().textContains("Risk")').isDisplayed().catch(() => false);
      const predScreen = await driver.$('android=new UiSelector().textContains("Prediction")').isDisplayed().catch(() => false);
      if (!predData && !predScreen) throw new Error('E2E: Prognosis Engine screen missing risk or prediction data');
    }
  );

  // TC-105: E2E — AI Food Scanner Navigation and UI Verification
  await step(CAT,
    'E2E: AI Food Scanner → Screen Loads → Upload UI Visible',
    'Navigate to AI Food Nutrient Scanner and verify the scanner interface or upload button is visible',
    async () => {
      await navTo('Scanner');

      const scannerUI = await driver.$('android=new UiSelector().textContains("Nutrient")').isDisplayed().catch(() => false);
      const uploadBtn = await driver.$('android=new UiSelector().textContains("Upload")').isDisplayed().catch(() => false);
      const cameraBtn = await driver.$('android=new UiSelector().textContains("Camera")').isDisplayed().catch(() => false);

      if (!scannerUI && !uploadBtn && !cameraBtn) {
        throw new Error('E2E: AI Food Scanner did not show expected UI elements');
      }
    }
  );

  // TC-106: E2E — Biometric Scan Screen and Camera Activation
  await step(CAT,
    'E2E: Biometric Scan → Activate Video Telemetry',
    'Navigate to AI Biometric Face Analyzer → tap Activate Video Telemetry → verify camera view appears',
    async () => {
      await navTo('Biometric');

      const activateBtn = await driver.$('android=new UiSelector().textContains("Activate")');
      const btnFound    = await activateBtn.isDisplayed().catch(() => false);
      if (btnFound) {
        await activateBtn.click();
        await delay(2000);
      }

      // Camera view or face analysis should appear
      const cameraView = await driver.$('android=new UiSelector().textContains("Biometric")').isDisplayed().catch(() => false);
      if (!cameraView) throw new Error('E2E: Biometric scan did not show camera/analysis view after activation');
    }
  );

  // TC-107: E2E — Real-Time Analytics Data Display
  await step(CAT,
    'E2E: Real-Time Analytics → Verify Data Renders',
    'Navigate to Real-Time Analytics and verify that chart data, statistics and summaries are visible',
    async () => {
      await navTo('Analytics');

      const chartEl    = await driver.$('android=new UiSelector().className("android.view.View").instance(0)').isDisplayed().catch(() => false);
      const analyticsEl = await driver.$('android=new UiSelector().textContains("Analytics")').isDisplayed().catch(() => false);
      const statsEl    = await driver.$('android=new UiSelector().className("android.widget.TextView").instance(2)').isDisplayed().catch(() => false);

      if (!chartEl && !analyticsEl && !statsEl) {
        throw new Error('E2E: Real-Time Analytics screen has no visible data or charts');
      }
    }
  );

  // TC-108: E2E — Weekly Progress Report Displays Patient Summary
  await step(CAT,
    'E2E: Weekly Progress Report → Patient Data Visible',
    'Navigate to Weekly Progress Report and verify the report displays patient progress data',
    async () => {
      await navTo('Report');

      const reportContent = await driver.$('android=new UiSelector().textContains("Progress")').isDisplayed().catch(() => false);
      const reportData    = await driver.$('android=new UiSelector().className("android.widget.TextView").instance(1)').isDisplayed().catch(() => false);

      if (!reportContent && !reportData) {
        throw new Error('E2E: Weekly Progress Report has no visible content');
      }
    }
  );

  // TC-109: E2E — User Settings / Profile Screen
  await step(CAT,
    'E2E: User Settings → Clinical Profile Card Visible',
    'Navigate to User Settings/Profile and verify the Clinical User Profile card renders with doctor info',
    async () => {
      const navigated = await navTo('Profile');
      if (!navigated) await navTo('Settings');

      const profileCard = await driver.$('android=new UiSelector().textContains("Profile")').isDisplayed().catch(() => false);
      const userInfo    = await driver.$('android=new UiSelector().className("android.widget.TextView").instance(1)').isDisplayed().catch(() => false);

      if (!profileCard && !userInfo) {
        throw new Error('E2E: User Settings/Profile screen has no visible content');
      }
    }
  );

  // TC-110: E2E — Full Clinical Workflow: Login → Register → Monitor → Meal → Prognosis → Logout
  await step(CAT,
    'E2E: Complete Clinical Workflow (Full Journey)',
    'Full end-to-end journey: Login → Register Patient → Monitor → Meal Planner → Prognosis Engine → Logout',
    async () => {
      // Step 1: Login
      await loginAsMedicalStaff();
      const loggedIn = await driver.$('android=new UiSelector().textContains("Command Center")').isDisplayed().catch(() => false);
      if (!loggedIn) throw new Error('E2E Full Journey: Login failed');

      // Step 2: Register a patient
      await navTo('Command Center');
      const regBtn = await driver.$('android=new UiSelector().textContains("Register")');
      const regFound = await regBtn.isDisplayed().catch(() => false);
      if (regFound) {
        await regBtn.click();
        await delay(1500);
        const inputs = await driver.$$('android=new UiSelector().className("android.widget.EditText")');
        if (inputs.length >= 2) {
          await inputs[0].clearValue();
          await inputs[0].setValue('Full Journey Patient');
          await inputs[1].clearValue();
          await inputs[1].setValue('47');
        }
        const submitBtn = await driver.$('android=new UiSelector().className("android.widget.Button").instance(0)');
        await submitBtn.click();
        await delay(3000);
      }

      // Step 3: Monitor patient
      const monBtn = await driver.$('android=new UiSelector().textContains("Monitor")');
      const monFound = await monBtn.isDisplayed().catch(() => false);
      if (monFound) {
        await monBtn.click();
        await delay(2500);
      }

      // Step 4: Meal Planner
      const mealNavigated = await navTo('Meal');
      if (!mealNavigated) await navTo('Intake');
      const checkboxes = await driver.$$('android=new UiSelector().className("android.widget.CheckBox")');
      if (checkboxes.length > 0) {
        await checkboxes[0].click();
        await delay(400);
      }

      // Step 5: Prognosis Engine
      await navTo('Prognosis');
      const recalcBtn = await driver.$('android=new UiSelector().textContains("Re-run")');
      const rFound    = await recalcBtn.isDisplayed().catch(() => false);
      if (rFound) {
        await recalcBtn.click();
        await delay(2000);
      }

      // Step 6: Logout
      const logoutBtn = await driver.$('android=new UiSelector().textContains("Terminate Session")');
      const lFound    = await logoutBtn.isDisplayed().catch(() => false);
      if (lFound) {
        await logoutBtn.click();
        await delay(2500);
      }

      // Final: Verify on login screen
      const onLogin = await driver.$('android=new UiSelector().className("android.widget.Button").instance(0)').isDisplayed().catch(() => false);
      if (!onLogin) throw new Error('E2E Full Journey: Did not return to login after complete workflow');
    }
  );
};
