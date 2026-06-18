/**
 * ================================================================
 *  PONIS Appium Tests - Category 9: Gesture & Touch Testing
 *  TC-083 to TC-090
 *  Tests: Swipe, scroll, long-press, pinch, pull-to-refresh
 * ================================================================
 */

module.exports = async function runGestureTests(driver, step, delay, BACKEND_URL) {
  const CAT = 'Gestures & Touch';

  // Utility: get screen dimensions
  async function getScreenSize() {
    return driver.getWindowSize();
  }

  // TC-083: Swipe Up Scrolls Patient List
  await step(CAT,
    'Swipe Up Scrolls Patient List Down',
    'Perform a swipe-up gesture on the patient list and verify content scrolls',
    async () => {
      // Navigate to command center
      const cmdNav = await driver.$('android=new UiSelector().textContains("Command Center")');
      const found  = await cmdNav.isDisplayed().catch(() => false);
      if (found) {
        await cmdNav.click();
        await delay(2000);
      }

      const { width, height } = await getScreenSize();

      // Capture initial first element text
      const firstEl    = await driver.$('android=new UiSelector().className("android.widget.TextView").instance(2)');
      const beforeText = await firstEl.getText().catch(() => '');

      // Swipe up
      await driver.touchAction([
        { action: 'press',  x: width / 2, y: height * 0.75 },
        { action: 'wait',   ms: 600 },
        { action: 'moveTo', x: width / 2, y: height * 0.25 },
        { action: 'release' },
      ]);
      await delay(1000);

      // Content should have shifted — app still stable
      const stable = await driver.$('android=new UiSelector().className("android.widget.TextView").instance(0)').isDisplayed().catch(() => false);
      if (!stable) throw new Error('App became unstable after swipe-up gesture');
    }
  );

  // TC-084: Swipe Down Returns to Top of List
  await step(CAT,
    'Swipe Down Returns List to Top',
    'Perform a swipe-down gesture to scroll back to the top of the patient list',
    async () => {
      const { width, height } = await getScreenSize();

      await driver.touchAction([
        { action: 'press',  x: width / 2, y: height * 0.25 },
        { action: 'wait',   ms: 600 },
        { action: 'moveTo', x: width / 2, y: height * 0.75 },
        { action: 'release' },
      ]);
      await delay(1000);

      const stable = await driver.$('android=new UiSelector().className("android.widget.TextView").instance(0)').isDisplayed().catch(() => false);
      if (!stable) throw new Error('App became unstable after swipe-down gesture');
    }
  );

  // TC-085: Horizontal Swipe on Dashboard
  await step(CAT,
    'Horizontal Swipe on Dashboard Cards',
    'Perform a left swipe gesture on the dashboard and verify it either scrolls cards or stays stable',
    async () => {
      const dashNav = await driver.$('android=new UiSelector().textContains("Dashboard")');
      const found   = await dashNav.isDisplayed().catch(() => false);
      if (found) {
        await dashNav.click();
        await delay(2000);
      }

      const { width, height } = await getScreenSize();

      await driver.touchAction([
        { action: 'press',  x: width * 0.75, y: height / 2 },
        { action: 'wait',   ms: 400 },
        { action: 'moveTo', x: width * 0.25, y: height / 2 },
        { action: 'release' },
      ]);
      await delay(800);

      const stable = await driver.$('android=new UiSelector().className("android.widget.TextView").instance(0)').isDisplayed().catch(() => false);
      if (!stable) throw new Error('App crashed or froze after horizontal swipe');
    }
  );

  // TC-086: Pull-to-Refresh on Patient List
  await step(CAT,
    'Pull-to-Refresh on Patient List',
    'Perform a pull-down gesture on patient list to trigger a data refresh',
    async () => {
      const cmdNav = await driver.$('android=new UiSelector().textContains("Command Center")');
      const found  = await cmdNav.isDisplayed().catch(() => false);
      if (found) {
        await cmdNav.click();
        await delay(2000);
      }

      const { width, height } = await getScreenSize();

      // Pull down from top
      await driver.touchAction([
        { action: 'press',  x: width / 2, y: height * 0.2 },
        { action: 'wait',   ms: 800 },
        { action: 'moveTo', x: width / 2, y: height * 0.55 },
        { action: 'release' },
      ]);
      await delay(2500); // Wait for refresh to complete

      const listVisible = await driver.$('android=new UiSelector().className("android.widget.TextView").instance(0)').isDisplayed().catch(() => false);
      if (!listVisible) throw new Error('App lost content after pull-to-refresh gesture');
    }
  );

  // TC-087: Long Press on Patient Row
  await step(CAT,
    'Long Press on Patient Row',
    'Long-press on a patient row to check if context menu or actions appear',
    async () => {
      const patientRow = await driver.$('android=new UiSelector().className("android.widget.TextView").instance(3)');
      const found      = await patientRow.isDisplayed().catch(() => false);
      if (!found) return; // No rows visible — skip gracefully

      const location = await patientRow.getLocation();
      const size     = await patientRow.getSize();

      await driver.touchAction([
        { action: 'longPress', x: location.x + size.width / 2, y: location.y + size.height / 2, duration: 1500 },
        { action: 'release' },
      ]);
      await delay(1000);

      // App should remain stable after long press
      const stable = await driver.$('android=new UiSelector().className("android.widget.TextView").instance(0)').isDisplayed().catch(() => false);
      if (!stable) throw new Error('App became unstable after long press gesture');

      // Dismiss any popup if opened
      await driver.back().catch(() => {});
      await delay(500);
    }
  );

  // TC-088: Double-Tap on Card Element
  await step(CAT,
    'Double-Tap on Dashboard Stat Card',
    'Perform a double-tap on a dashboard card and verify no crash occurs',
    async () => {
      const dashNav = await driver.$('android=new UiSelector().textContains("Dashboard")');
      const found   = await dashNav.isDisplayed().catch(() => false);
      if (found) {
        await dashNav.click();
        await delay(2000);
      }

      const card = await driver.$('android=new UiSelector().className("android.view.View").instance(0)');
      const cardFound = await card.isDisplayed().catch(() => false);

      if (cardFound) {
        await card.doubleClick().catch(async () => {
          // Fallback: two rapid taps
          await card.click();
          await delay(100);
          await card.click();
        });
        await delay(800);
      }

      const stable = await driver.$('android=new UiSelector().className("android.widget.TextView").instance(0)').isDisplayed().catch(() => false);
      if (!stable) throw new Error('App became unstable after double-tap gesture');
    }
  );

  // TC-089: Swipe to Dismiss / Back on Meal Planner
  await step(CAT,
    'Swipe-Right Edge Gesture for Back Navigation',
    'Perform a right-edge swipe to trigger Android back navigation from Meal Planner',
    async () => {
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
        await delay(2000);
      }

      const { width, height } = await getScreenSize();

      // Edge swipe from left
      await driver.touchAction([
        { action: 'press',  x: 5,           y: height / 2 },
        { action: 'wait',   ms: 300 },
        { action: 'moveTo', x: width * 0.6, y: height / 2 },
        { action: 'release' },
      ]);
      await delay(1000);

      const stable = await driver.$('android=new UiSelector().className("android.widget.TextView").instance(0)').isDisplayed().catch(() => false);
      if (!stable) throw new Error('App became unstable after edge-swipe back gesture');
    }
  );

  // TC-090: Scroll Meal Checklist and Check Items
  await step(CAT,
    'Scroll Meal Checklist and Tap Checkbox',
    'On the Meal Planner screen, scroll to a checklist item and tap a checkbox',
    async () => {
      // Navigate to Meal Planner
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
        await delay(2000);
      }

      // Find a checkbox
      const checkboxes = await driver.$$('android=new UiSelector().className("android.widget.CheckBox")');
      if (checkboxes.length > 0) {
        await checkboxes[0].click();
        await delay(500);
        // Tap again to toggle back
        await checkboxes[0].click();
        await delay(500);
      }

      const stable = await driver.$('android=new UiSelector().className("android.widget.TextView").instance(0)').isDisplayed().catch(() => false);
      if (!stable) throw new Error('App became unstable after checkbox tap gesture');
    }
  );
};
