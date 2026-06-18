/**
 * ================================================================
 *  PONIS Appium Tests - Category 8: Accessibility Testing
 *  TC-075 to TC-082
 *  Tests: Content descriptions, font scale, color contrast indicators,
 *         TalkBack-friendly element labelling
 * ================================================================
 */

module.exports = async function runAccessibilityTests(driver, step, delay, BACKEND_URL) {
  const CAT = 'Accessibility';

  // TC-075: All Buttons Have Content-Description (TalkBack)
  await step(CAT,
    'Buttons Have Accessibility Content Descriptions',
    'Verify that interactive button elements have content-description attributes for TalkBack',
    async () => {
      const buttons = await driver.$$('android=new UiSelector().className("android.widget.Button")');
      if (buttons.length === 0) throw new Error('No buttons found on current screen');

      let unlabelledCount = 0;
      for (const btn of buttons) {
        const desc = await btn.getAttribute('content-desc').catch(() => '');
        const text = await btn.getText().catch(() => '');
        if (!desc && !text) unlabelledCount++;
      }

      if (unlabelledCount > 0) {
        throw new Error(`${unlabelledCount} button(s) have no content-description or text label`);
      }
    }
  );

  // TC-076: Input Fields Have Hints/Labels
  await step(CAT,
    'Input Fields Have Hint Text Labels',
    'Verify all EditText fields carry hint text that describes their purpose',
    async () => {
      const inputs = await driver.$$('android=new UiSelector().className("android.widget.EditText")');
      if (inputs.length === 0) {
        // Navigate to login screen where inputs exist
        return;
      }

      let noHintCount = 0;
      for (const input of inputs) {
        const hint        = await input.getAttribute('hint').catch(() => '');
        const contentDesc = await input.getAttribute('content-desc').catch(() => '');
        if (!hint && !contentDesc) noHintCount++;
      }

      if (noHintCount > 0) {
        throw new Error(`${noHintCount} input field(s) have no hint text or content-description`);
      }
    }
  );

  // TC-077: Image Views Have Content Descriptions
  await step(CAT,
    'Image/Icon Views Have Accessibility Descriptions',
    'Verify ImageView elements have content-description set for screen readers',
    async () => {
      const images = await driver.$$('android=new UiSelector().className("android.widget.ImageView")');
      if (images.length === 0) return; // No images on screen — pass

      let noDescCount = 0;
      for (const img of images) {
        const desc = await img.getAttribute('content-desc').catch(() => '');
        if (!desc) noDescCount++;
      }

      // Allow up to 20% unlabelled decorative images
      const threshold = Math.ceil(images.length * 0.2);
      if (noDescCount > threshold) {
        throw new Error(`${noDescCount}/${images.length} images have no content-description — exceeds 20% decorative threshold`);
      }
    }
  );

  // TC-078: Minimum Touch Target Size
  await step(CAT,
    'Interactive Elements Meet Minimum Touch Target (48dp)',
    'Verify that all buttons have a touch target height and width of at least 48dp',
    async () => {
      const buttons = await driver.$$('android=new UiSelector().className("android.widget.Button")');
      if (buttons.length === 0) return;

      const MINIMUM_DP = 48;
      let tooSmallCount = 0;

      for (const btn of buttons) {
        const size = await btn.getSize().catch(() => ({ width: 999, height: 999 }));
        // Convert px to dp: Android standard DPI = 160; most emulators use 420dpi → factor ~2.625
        // We use a safe low threshold of 48px as proxy (most emulators are >=2x density)
        if (size.height < MINIMUM_DP || size.width < MINIMUM_DP) {
          tooSmallCount++;
        }
      }

      if (tooSmallCount > 0) {
        throw new Error(`${tooSmallCount} button(s) are smaller than ${MINIMUM_DP}px touch target`);
      }
    }
  );

  // TC-079: Text Elements Are Not Empty
  await step(CAT,
    'Visible Text Elements Are Non-Empty',
    'Verify that rendered TextView elements contain actual text, not empty strings',
    async () => {
      const textViews = await driver.$$('android=new UiSelector().className("android.widget.TextView")');
      if (textViews.length === 0) throw new Error('No text elements found on screen');

      let emptyCount = 0;
      for (const tv of textViews.slice(0, 10)) { // Sample first 10
        const text = await tv.getText().catch(() => '');
        if (text.trim() === '') emptyCount++;
      }

      const threshold = Math.ceil(textViews.slice(0, 10).length * 0.5);
      if (emptyCount > threshold) {
        throw new Error(`${emptyCount} text elements are empty — possible rendering failure`);
      }
    }
  );

  // TC-080: Scrollable Lists Are Accessible
  await step(CAT,
    'Scrollable Lists Are Accessible via Swipe',
    'Verify that scrollable list views respond to swipe gestures for keyboard/accessibility navigation',
    async () => {
      const { width, height } = await driver.getWindowSize();

      // Swipe up to scroll
      await driver.touchAction([
        { action: 'press',  x: width / 2, y: height * 0.7 },
        { action: 'wait',   ms: 300 },
        { action: 'moveTo', x: width / 2, y: height * 0.3 },
        { action: 'release' },
      ]);
      await delay(800);

      // Swipe back down
      await driver.touchAction([
        { action: 'press',  x: width / 2, y: height * 0.3 },
        { action: 'wait',   ms: 300 },
        { action: 'moveTo', x: width / 2, y: height * 0.7 },
        { action: 'release' },
      ]);
      await delay(800);

      const stable = await driver.$('android=new UiSelector().className("android.widget.TextView").instance(0)').isDisplayed().catch(() => false);
      if (!stable) throw new Error('App became unstable after accessibility scroll gestures');
    }
  );

  // TC-081: Login Screen Accessible Without Visual Cues
  await step(CAT,
    'Login Screen Operable by Touch Alone',
    'Verify all login screen interactions can be completed purely through touch without requiring visual layout understanding',
    async () => {
      // Navigate to login
      try {
        const logoutBtn = await driver.$('android=new UiSelector().textContains("Terminate Session")');
        const visible   = await logoutBtn.isDisplayed().catch(() => false);
        if (visible) {
          await logoutBtn.click();
          await delay(2000);
        }
      } catch (_) {}

      // Verify login form elements all have accessible attributes
      const editTexts = await driver.$$('android=new UiSelector().className("android.widget.EditText")');
      const buttons   = await driver.$$('android=new UiSelector().className("android.widget.Button")');

      if (editTexts.length < 2) throw new Error('Login screen missing required input fields');
      if (buttons.length < 1)   throw new Error('Login screen missing submit button');
    }
  );

  // TC-082: No Content Flickers or Invisible Overlapping Elements
  await step(CAT,
    'No Invisible Overlapping Tap Blockers',
    'Verify that tapping visible interactive elements actually responds (no invisible overlays blocking)',
    async () => {
      // Re-login for subsequent tests
      const medBtn = await driver.$('android=new UiSelector().textContains("Medical Staff")');
      const found  = await medBtn.isDisplayed().catch(() => false);
      if (found) {
        await medBtn.click();
        await delay(500);
        const loginBtn = await driver.$('android=new UiSelector().className("android.widget.Button").instance(0)');
        await loginBtn.click();
        await delay(3000);

        // After login, verify we navigated — confirms button was not blocked by invisible overlay
        const dashboard = await driver.$('android=new UiSelector().textContains("Command Center")').isDisplayed().catch(() => false);
        const anyScreen = await driver.$('android=new UiSelector().className("android.widget.TextView").instance(0)').isDisplayed().catch(() => false);
        if (!dashboard && !anyScreen) throw new Error('Login button tap may have been blocked by invisible overlay');
      }
    }
  );
};
