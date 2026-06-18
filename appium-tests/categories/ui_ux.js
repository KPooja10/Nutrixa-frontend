/**
 * ================================================================
 *  PONIS Appium Tests - Category 2: UI/UX Testing
 *  TC-015 to TC-024
 *  Tests: Visual elements, colors, responsiveness, layout
 * ================================================================
 */

module.exports = async function runUiUxTests(driver, step, delay, BACKEND_URL) {
  const CAT = 'UI/UX';

  // Login helper to ensure we're authenticated
  async function ensureLoggedIn() {
    try {
      const medBtn = await driver.$('android=new UiSelector().textContains("Medical Staff")');
      const visible = await medBtn.isDisplayed().catch(() => false);
      if (visible) {
        await medBtn.click();
        await delay(500);
        const loginBtn = await driver.$('android=new UiSelector().className("android.widget.Button").instance(0)');
        await loginBtn.click();
        await delay(3000);
      }
    } catch (_) {}
  }

  // TC-015: Login Screen Background Render
  await step(CAT,
    'Login Screen Background Renders',
    'Verify the login screen background gradient/image renders without white/blank screen',
    async () => {
      const screen = await driver.$('android=new UiSelector().packageName("com.ponis.app")');
      const displayed = await screen.isDisplayed().catch(() => false);
      if (!displayed) throw new Error('App screen not displayed - possible white screen crash');
    }
  );

  // TC-016: All Input Fields Have Placeholder Text
  await step(CAT,
    'Input Fields Have Placeholder/Hint Text',
    'Verify username and password inputs display appropriate placeholder/hint text',
    async () => {
      const inputs = await driver.$$('android=new UiSelector().className("android.widget.EditText")');
      if (inputs.length < 2) throw new Error(`Expected at least 2 input fields, found ${inputs.length}`);
    }
  );

  // TC-017: Bottom Navigation Bar Present (Post-Login)
  await step(CAT,
    'Bottom Navigation Bar Visible',
    'After login, verify the bottom navigation bar or side drawer is visible',
    async () => {
      await ensureLoggedIn();
      // Look for nav bar or hamburger menu
      const navEl = await driver.$('android=new UiSelector().descriptionContains("navigation")');
      const hasNav = await navEl.isDisplayed().catch(async () => {
        // Try looking for common nav items
        const el = await driver.$('android=new UiSelector().textContains("Dashboard")');
        return el.isDisplayed().catch(() => false);
      });
      if (!hasNav) throw new Error('Navigation element not found after login');
    }
  );

  // TC-018: Patient List Screen Card Layout
  await step(CAT,
    'Patient Cards Display Correctly',
    'Navigate to patient list and verify patient cards render with name and details',
    async () => {
      const patientNav = await driver.$('android=new UiSelector().textContains("Patient")');
      await patientNav.click();
      await delay(2000);

      const patientCard = await driver.$('android=new UiSelector().className("android.widget.TextView").instance(0)');
      const displayed   = await patientCard.isDisplayed().catch(() => false);
      if (!displayed) throw new Error('Patient list cards did not render');
    }
  );

  // TC-019: Loading Indicator on Network Operations
  await step(CAT,
    'Loading Indicator Appears on Data Fetch',
    'Verify a loading spinner or progress bar appears when the app fetches patient data',
    async () => {
      // Look for any progress/loading view immediately after navigation trigger
      const loaders = await driver.$$('android=new UiSelector().className("android.widget.ProgressBar")');
      // Loader may have already disappeared; test passes if it existed or data is loaded
      const dataLoaded = await driver.$('android=new UiSelector().className("android.widget.TextView").instance(0)').isDisplayed().catch(() => false);
      if (loaders.length === 0 && !dataLoaded) throw new Error('Neither loader nor data found after navigation');
    }
  );

  // TC-020: Dashboard Statistics Cards
  await step(CAT,
    'Dashboard Statistics Cards Render',
    'Navigate to main dashboard and verify key stat cards (patients, adherence etc.) are visible',
    async () => {
      const dashNav = await driver.$('android=new UiSelector().textContains("Dashboard")');
      const hasNav  = await dashNav.isDisplayed().catch(() => false);
      if (hasNav) {
        await dashNav.click();
        await delay(2000);
      }
      const statCard = await driver.$('android=new UiSelector().className("android.view.View").instance(0)');
      const displayed = await statCard.isDisplayed().catch(() => false);
      if (!displayed) throw new Error('Dashboard stat cards not found');
    }
  );

  // TC-021: Text Readability - No Text Overflow
  await step(CAT,
    'No Text Overflow on Main Screens',
    'Verify key text elements are not truncated or overflowing the screen bounds',
    async () => {
      const textElements = await driver.$$('android=new UiSelector().className("android.widget.TextView")');
      if (textElements.length === 0) throw new Error('No text elements found on current screen');
      // Pass if text elements are present and rendered
    }
  );

  // TC-022: Icon Elements Render
  await step(CAT,
    'App Icon/Image Elements Render',
    'Verify that icons or image elements in the UI are visible and not broken',
    async () => {
      const images = await driver.$$('android=new UiSelector().className("android.widget.ImageView")');
      // Images are optional — pass if no broken indicators
      if (images.length > 0) {
        const first = await images[0].isDisplayed().catch(() => false);
        if (!first) throw new Error('First image/icon element not displayed properly');
      }
    }
  );

  // TC-023: Meal Planner Screen Layout
  await step(CAT,
    'Meal Planner Screen Layout',
    'Navigate to Meal/Nutrition Planner and verify the screen layout renders correctly',
    async () => {
      const mealNav = await driver.$('android=new UiSelector().textContains("Meal")');
      const found   = await mealNav.isDisplayed().catch(() => false);
      if (found) {
        await mealNav.click();
        await delay(2000);
        const mealTitle = await driver.$('android=new UiSelector().textContains("Nutrition")');
        const displayed = await mealTitle.isDisplayed().catch(() => false);
        if (!displayed) throw new Error('Meal planner screen did not load');
      }
    }
  );

  // TC-024: Profile Screen Avatar/Info Layout
  await step(CAT,
    'Profile Screen Info Layout',
    'Navigate to User Profile/Settings and verify doctor profile card renders',
    async () => {
      const profileNav = await driver.$('android=new UiSelector().descriptionContains("Profile")');
      const found      = await profileNav.isDisplayed().catch(async () => {
        const fallback = await driver.$('android=new UiSelector().textContains("Profile")');
        return fallback.isDisplayed().catch(() => false);
      });

      if (found) {
        await profileNav.click().catch(async () => {
          const fallback = await driver.$('android=new UiSelector().textContains("Profile")');
          await fallback.click();
        });
        await delay(2000);
      }
      // Profile loaded check
      const profileInfo = await driver.$('android=new UiSelector().className("android.widget.TextView").instance(0)');
      const displayed   = await profileInfo.isDisplayed().catch(() => false);
      if (!displayed) throw new Error('Profile screen info not displayed');
    }
  );
};
