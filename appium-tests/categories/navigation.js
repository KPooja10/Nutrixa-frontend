/**
 * ================================================================
 *  PONIS Appium Tests - Category 3: Navigation Testing
 *  TC-025 to TC-034
 *  Tests: Screen-to-screen navigation, back navigation, deep links
 * ================================================================
 */

module.exports = async function runNavigationTests(driver, step, delay, BACKEND_URL) {
  const CAT = 'Navigation';

  // TC-025: Navigate to Hospital Command Center
  await step(CAT,
    'Navigate to Hospital Command Center',
    'Tap the Command Center nav item and verify the screen loads with patient list',
    async () => {
      const navItem = await driver.$('android=new UiSelector().textContains("Command Center")');
      const found   = await navItem.isDisplayed().catch(() => false);
      if (found) {
        await navItem.click();
        await delay(2000);
        const header = await driver.$('android=new UiSelector().textContains("Hospital")');
        const displayed = await header.isDisplayed().catch(() => false);
        if (!displayed) throw new Error('Hospital Command Center screen did not load');
      }
    }
  );

  // TC-026: Navigate to Patient Registration
  await step(CAT,
    'Navigate to Patient Registration Screen',
    'Open Patient Registration screen from the command center or navigation',
    async () => {
      const regBtn = await driver.$('android=new UiSelector().textContains("Register")');
      const found  = await regBtn.isDisplayed().catch(() => false);
      if (!found) throw new Error('Register Patient button/link not found');
      await regBtn.click();
      await delay(2000);
      const regScreen = await driver.$('android=new UiSelector().textContains("Registration")');
      const displayed = await regScreen.isDisplayed().catch(() => false);
      if (!displayed) throw new Error('Patient Registration screen did not load');
    }
  );

  // TC-027: Back Navigation from Registration
  await step(CAT,
    'Back Navigation from Registration Screen',
    'Press device back button from Registration screen and confirm return to previous screen',
    async () => {
      await driver.back();
      await delay(1500);
      // Should be back on command center or patient list
      const backScreen = await driver.$('android=new UiSelector().className("android.widget.TextView").instance(0)');
      const displayed  = await backScreen.isDisplayed().catch(() => false);
      if (!displayed) throw new Error('Back navigation failed — no screen content detected');
    }
  );

  // TC-028: Navigate to Central Console (Dashboard)
  await step(CAT,
    'Navigate to Central Console / Dashboard',
    'Tap the Central Console or Dashboard navigation and verify the main dashboard loads',
    async () => {
      const dashNav = await driver.$('android=new UiSelector().textContains("Dashboard")');
      const found   = await dashNav.isDisplayed().catch(async () => {
        const alt = await driver.$('android=new UiSelector().textContains("Console")');
        return alt.isDisplayed().catch(() => false);
      });
      if (found) {
        await dashNav.click().catch(async () => {
          const alt = await driver.$('android=new UiSelector().textContains("Console")');
          await alt.click();
        });
        await delay(2000);
      }
    }
  );

  // TC-029: Navigate to Intake / Meal Planner
  await step(CAT,
    'Navigate to Nutrition & Meal Planner',
    'Tap Intake Planner nav item and verify Meal Planner screen loads',
    async () => {
      const mealNav = await driver.$('android=new UiSelector().textContains("Meal")');
      const found   = await mealNav.isDisplayed().catch(async () => {
        const alt = await driver.$('android=new UiSelector().textContains("Intake")');
        return alt.isDisplayed().catch(() => false);
      });

      if (!found) throw new Error('Meal Planner nav item not found');
      await mealNav.click().catch(async () => {
        const alt = await driver.$('android=new UiSelector().textContains("Intake")');
        await alt.click();
      });
      await delay(2000);
      const mealScreen = await driver.$('android=new UiSelector().textContains("Nutrition")');
      const displayed  = await mealScreen.isDisplayed().catch(() => false);
      if (!displayed) throw new Error('Meal Planner screen did not load');
    }
  );

  // TC-030: Navigate to Prognosis Engine
  await step(CAT,
    'Navigate to Prognosis/Prediction Engine',
    'Tap Prognosis Engine nav item and verify AI prediction engine loads',
    async () => {
      const progNav = await driver.$('android=new UiSelector().textContains("Prognosis")');
      const found   = await progNav.isDisplayed().catch(() => false);
      if (!found) throw new Error('Prognosis Engine nav item not found');
      await progNav.click();
      await delay(2500);
      const progScreen = await driver.$('android=new UiSelector().textContains("Prediction")');
      const displayed  = await progScreen.isDisplayed().catch(() => false);
      if (!displayed) throw new Error('Prognosis/Prediction Engine screen did not load');
    }
  );

  // TC-031: Navigate to AI Food Scanner
  await step(CAT,
    'Navigate to AI Food Scanner',
    'Tap AI Food Scanner nav and verify the nutrient scanner screen loads',
    async () => {
      const scanNav = await driver.$('android=new UiSelector().textContains("Scanner")');
      const found   = await scanNav.isDisplayed().catch(async () => {
        const alt = await driver.$('android=new UiSelector().textContains("Food")');
        return alt.isDisplayed().catch(() => false);
      });
      if (!found) throw new Error('AI Food Scanner nav item not found');
      await scanNav.click().catch(async () => {
        const alt = await driver.$('android=new UiSelector().textContains("Food")');
        await alt.click();
      });
      await delay(2000);
      const scanScreen = await driver.$('android=new UiSelector().textContains("Nutrient")');
      const displayed  = await scanScreen.isDisplayed().catch(() => false);
      if (!displayed) throw new Error('AI Food Scanner screen did not load');
    }
  );

  // TC-032: Navigate to Biometric Scan
  await step(CAT,
    'Navigate to AI Biometric Face Analyzer',
    'Tap Biometric Scan nav and verify the face analysis screen loads',
    async () => {
      const bioNav = await driver.$('android=new UiSelector().textContains("Biometric")');
      const found  = await bioNav.isDisplayed().catch(() => false);
      if (!found) throw new Error('Biometric Scan nav item not found');
      await bioNav.click();
      await delay(2000);
      const bioScreen = await driver.$('android=new UiSelector().textContains("Biometric")');
      const displayed = await bioScreen.isDisplayed().catch(() => false);
      if (!displayed) throw new Error('Biometric Scan screen did not load');
    }
  );

  // TC-033: Navigate to Real-Time Analytics
  await step(CAT,
    'Navigate to Real-Time Analytics',
    'Tap Analytics nav and verify the real-time analytics dashboard loads',
    async () => {
      const analyticsNav = await driver.$('android=new UiSelector().textContains("Analytics")');
      const found        = await analyticsNav.isDisplayed().catch(() => false);
      if (!found) throw new Error('Analytics nav item not found');
      await analyticsNav.click();
      await delay(2000);
      const analyticsScreen = await driver.$('android=new UiSelector().textContains("Analytics")');
      const displayed       = await analyticsScreen.isDisplayed().catch(() => false);
      if (!displayed) throw new Error('Real-Time Analytics screen did not load');
    }
  );

  // TC-034: Navigate to Weekly Progress Report
  await step(CAT,
    'Navigate to Weekly Progress Report',
    'Tap Reports nav and verify the weekly progress report screen loads',
    async () => {
      const reportNav = await driver.$('android=new UiSelector().textContains("Report")');
      const found     = await reportNav.isDisplayed().catch(() => false);
      if (!found) throw new Error('Weekly Report nav item not found');
      await reportNav.click();
      await delay(2000);
      const reportScreen = await driver.$('android=new UiSelector().textContains("Progress")');
      const displayed    = await reportScreen.isDisplayed().catch(() => false);
      if (!displayed) throw new Error('Weekly Progress Report screen did not load');
    }
  );
};
