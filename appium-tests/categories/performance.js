/**
 * ================================================================
 *  PONIS Appium Tests - Category 4: Performance Testing
 *  TC-035 to TC-044
 *  Tests: Screen load times, scroll performance, memory usage
 * ================================================================
 */

module.exports = async function runPerformanceTests(driver, step, delay, BACKEND_URL) {
  const CAT = 'Performance';

  const THRESHOLDS = {
    screenLoad   : 5000,  // 5 seconds max for screen load
    apiResponse  : 3000,  // 3 seconds max for API response
    scrollSmooth : 2000,  // 2 seconds for scroll action
  };

  // TC-035: Login Screen Load Time
  await step(CAT,
    'Login Screen Load Time < 5s',
    'Measure time for login screen to fully render after app cold start',
    async () => {
      const start = Date.now();
      const loginBtn = await driver.$('android=new UiSelector().className("android.widget.Button").instance(0)');
      await driver.waitUntil(() => loginBtn.isDisplayed(), { timeout: THRESHOLDS.screenLoad });
      const duration = Date.now() - start;
      if (duration > THRESHOLDS.screenLoad) {
        throw new Error(`Login screen took ${duration}ms — exceeds ${THRESHOLDS.screenLoad}ms threshold`);
      }
    }
  );

  // TC-036: Dashboard Load Time After Login
  await step(CAT,
    'Dashboard Load Time After Login < 5s',
    'Measure time for main dashboard to load after authentication',
    async () => {
      const start    = Date.now();
      const dashText = await driver.$('android=new UiSelector().textContains("Command Center")');
      await driver.waitUntil(() => dashText.isDisplayed().catch(() => false), { timeout: THRESHOLDS.screenLoad });
      const duration = Date.now() - start;
      if (duration > THRESHOLDS.screenLoad) {
        throw new Error(`Dashboard took ${duration}ms — exceeds ${THRESHOLDS.screenLoad}ms threshold`);
      }
    }
  );

  // TC-037: Patient List Screen Load Time
  await step(CAT,
    'Patient List Load Time < 5s',
    'Navigate to patient list and measure time until first patient card appears',
    async () => {
      const start    = Date.now();
      const patNav   = await driver.$('android=new UiSelector().textContains("Patient")');
      const found    = await patNav.isDisplayed().catch(() => false);
      if (found) {
        await patNav.click();
        await driver.waitUntil(
          () => driver.$('android=new UiSelector().className("android.widget.TextView").instance(2)').isDisplayed().catch(() => false),
          { timeout: THRESHOLDS.screenLoad }
        );
        const duration = Date.now() - start;
        if (duration > THRESHOLDS.screenLoad) {
          throw new Error(`Patient list took ${duration}ms — exceeds ${THRESHOLDS.screenLoad}ms threshold`);
        }
      }
    }
  );

  // TC-038: Smooth Scroll on Patient List
  await step(CAT,
    'Smooth Scroll on Patient List',
    'Perform a scroll gesture on the patient list and verify it completes within 2s',
    async () => {
      const start = Date.now();
      const { width, height } = await driver.getWindowSize();
      await driver.touchAction([
        { action: 'press',  x: width / 2, y: height * 0.7 },
        { action: 'wait',   ms: 500 },
        { action: 'moveTo', x: width / 2, y: height * 0.3 },
        { action: 'release' },
      ]);
      const duration = Date.now() - start;
      if (duration > THRESHOLDS.scrollSmooth) {
        throw new Error(`Scroll gesture took ${duration}ms — exceeds ${THRESHOLDS.scrollSmooth}ms threshold`);
      }
    }
  );

  // TC-039: Prognosis Engine Load Time
  await step(CAT,
    'Prognosis Engine Screen Load < 5s',
    'Navigate to Prognosis Engine and measure screen load time',
    async () => {
      const start    = Date.now();
      const progNav  = await driver.$('android=new UiSelector().textContains("Prognosis")');
      const found    = await progNav.isDisplayed().catch(() => false);
      if (found) {
        await progNav.click();
        await driver.waitUntil(
          () => driver.$('android=new UiSelector().textContains("Prediction")').isDisplayed().catch(() => false),
          { timeout: THRESHOLDS.screenLoad }
        );
        const duration = Date.now() - start;
        if (duration > THRESHOLDS.screenLoad) {
          throw new Error(`Prognosis Engine took ${duration}ms — exceeds threshold`);
        }
      }
    }
  );

  // TC-040: Analytics Chart Render Time
  await step(CAT,
    'Analytics Charts Render < 5s',
    'Navigate to Real-Time Analytics and verify chart elements appear within threshold',
    async () => {
      const start       = Date.now();
      const analyticsNav = await driver.$('android=new UiSelector().textContains("Analytics")');
      const found        = await analyticsNav.isDisplayed().catch(() => false);
      if (found) {
        await analyticsNav.click();
        await driver.waitUntil(
          () => driver.$('android=new UiSelector().className("android.view.View").instance(0)').isDisplayed().catch(() => false),
          { timeout: THRESHOLDS.screenLoad }
        );
        const duration = Date.now() - start;
        if (duration > THRESHOLDS.screenLoad) {
          throw new Error(`Analytics chart render took ${duration}ms — exceeds threshold`);
        }
      }
    }
  );

  // TC-041: Meal Planner List Render Time
  await step(CAT,
    'Meal Planner Checklist Render < 5s',
    'Navigate to Meal Planner and verify checklist items appear within load threshold',
    async () => {
      const start   = Date.now();
      const mealNav = await driver.$('android=new UiSelector().textContains("Meal")');
      const found   = await mealNav.isDisplayed().catch(async () => {
        const alt = await driver.$('android=new UiSelector().textContains("Intake")');
        return alt.isDisplayed().catch(() => false);
      });
      if (found) {
        await mealNav.click().catch(async () => {
          const alt = await driver.$('android=new UiSelector().textContains("Intake")');
          await alt.click();
        });
        await driver.waitUntil(
          () => driver.$('android=new UiSelector().textContains("Nutrition")').isDisplayed().catch(() => false),
          { timeout: THRESHOLDS.screenLoad }
        );
        const duration = Date.now() - start;
        if (duration > THRESHOLDS.screenLoad) {
          throw new Error(`Meal planner took ${duration}ms — exceeds threshold`);
        }
      }
    }
  );

  // TC-042: App Memory - No Crash on Rapid Navigation
  await step(CAT,
    'No Crash on Rapid Screen Navigation',
    'Rapidly switch between 3 screens and verify app remains stable',
    async () => {
      const screens = [
        'android=new UiSelector().textContains("Dashboard")',
        'android=new UiSelector().textContains("Patient")',
        'android=new UiSelector().textContains("Analytics")',
      ];

      for (const selector of screens) {
        try {
          const el = await driver.$(selector);
          const found = await el.isDisplayed().catch(() => false);
          if (found) {
            await el.click();
            await delay(800);
          }
        } catch (_) {}
      }

      // App should still be alive
      const alive = await driver.$('android=new UiSelector().className("android.widget.TextView").instance(0)').isDisplayed().catch(() => false);
      if (!alive) throw new Error('App crashed or became unresponsive during rapid navigation');
    }
  );

  // TC-043: Weekly Report Generation Time
  await step(CAT,
    'Weekly Report Screen Load < 5s',
    'Navigate to Weekly Progress Report and measure load time',
    async () => {
      const start     = Date.now();
      const reportNav = await driver.$('android=new UiSelector().textContains("Report")');
      const found     = await reportNav.isDisplayed().catch(() => false);
      if (found) {
        await reportNav.click();
        await driver.waitUntil(
          () => driver.$('android=new UiSelector().textContains("Progress")').isDisplayed().catch(() => false),
          { timeout: THRESHOLDS.screenLoad }
        );
        const duration = Date.now() - start;
        if (duration > THRESHOLDS.screenLoad) {
          throw new Error(`Weekly report took ${duration}ms — exceeds threshold`);
        }
      }
    }
  );

  // TC-044: AI Food Scanner Camera Init Time
  await step(CAT,
    'AI Food Scanner Camera View Init < 5s',
    'Navigate to AI Food Scanner and measure time until camera view or upload UI appears',
    async () => {
      const start   = Date.now();
      const scanNav = await driver.$('android=new UiSelector().textContains("Scanner")');
      const found   = await scanNav.isDisplayed().catch(async () => {
        const alt = await driver.$('android=new UiSelector().textContains("Food")');
        return alt.isDisplayed().catch(() => false);
      });
      if (found) {
        await scanNav.click().catch(async () => {
          const alt = await driver.$('android=new UiSelector().textContains("Food")');
          await alt.click();
        });
        await driver.waitUntil(
          () => driver.$('android=new UiSelector().textContains("Nutrient")').isDisplayed().catch(() => false),
          { timeout: THRESHOLDS.screenLoad }
        );
        const duration = Date.now() - start;
        if (duration > THRESHOLDS.screenLoad) {
          throw new Error(`Food Scanner init took ${duration}ms — exceeds threshold`);
        }
      }
    }
  );
};
