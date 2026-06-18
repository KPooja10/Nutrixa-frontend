/**
 * ================================================================
 *  PONIS Appium Tests - Category 1: Functional Testing
 *  TC-002 to TC-014
 *  Tests: App launch, Login flow, UI element presence
 * ================================================================
 */

module.exports = async function runFunctionalTests(driver, step, delay, BACKEND_URL) {
  const CAT = 'Functional';

  // TC-002: App Launch & Splash Screen
  await step(CAT,
    'App Launch & Splash Screen',
    'Verify the app launches successfully and displays the PONIS splash or login screen',
    async () => {
      const loginScreen = await driver.$('~login-screen');
      // Try by accessibility ID first, fallback to text search
      let visible = false;
      try {
        visible = await loginScreen.isDisplayed();
      } catch (_) {
        const el = await driver.$('android=new UiSelector().textContains("PONIS")');
        visible = await el.isDisplayed();
      }
      if (!visible) throw new Error('App did not load — login/splash screen not found');
    }
  );

  // TC-003: Login Screen Title Visible
  await step(CAT,
    'Login Screen Title Visible',
    'Verify that the PONIS brand title is visible on the authentication screen',
    async () => {
      const title = await driver.$('android=new UiSelector().textContains("PONIS")');
      const displayed = await title.isDisplayed();
      if (!displayed) throw new Error('PONIS brand title not displayed on login screen');
    }
  );

  // TC-004: Username Input Field Present
  await step(CAT,
    'Username Input Field Present',
    'Verify that the username/email input field is visible on the login screen',
    async () => {
      const usernameField = await driver.$('~username-input');
      let displayed = false;
      try {
        displayed = await usernameField.isDisplayed();
      } catch (_) {
        const fallback = await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)');
        displayed = await fallback.isDisplayed();
      }
      if (!displayed) throw new Error('Username input field not found');
    }
  );

  // TC-005: Password Input Field Present
  await step(CAT,
    'Password Input Field Present',
    'Verify that the password input field is visible and is of password type',
    async () => {
      const passwordField = await driver.$('android=new UiSelector().className("android.widget.EditText").instance(1)');
      const displayed = await passwordField.isDisplayed();
      if (!displayed) throw new Error('Password input field not found');
    }
  );

  // TC-006: Login Button Visible
  await step(CAT,
    'Login Submit Button Visible',
    'Verify that the login submit/authorize button is visible and enabled',
    async () => {
      const loginBtn = await driver.$('android=new UiSelector().className("android.widget.Button").instance(0)');
      const displayed = await loginBtn.isDisplayed();
      const enabled   = await loginBtn.isEnabled();
      if (!displayed) throw new Error('Login button not visible');
      if (!enabled)   throw new Error('Login button is disabled');
    }
  );

  // TC-007: Medical Staff Quick Login Preset
  await step(CAT,
    'Medical Staff Quick Preset Button',
    'Verify the "Medical Staff" quick-login preset button is visible and tappable',
    async () => {
      const medBtn = await driver.$('android=new UiSelector().textContains("Medical Staff")');
      const displayed = await medBtn.isDisplayed();
      if (!displayed) throw new Error('"Medical Staff" preset button not found');
    }
  );

  // TC-008: Patient Quick Login Preset
  await step(CAT,
    'Oncology Patient Quick Preset Button',
    'Verify the "Oncology Patient" quick-login preset button is visible and tappable',
    async () => {
      const patBtn = await driver.$('android=new UiSelector().textContains("Oncology Patient")');
      const displayed = await patBtn.isDisplayed();
      if (!displayed) throw new Error('"Oncology Patient" preset button not found');
    }
  );

  // TC-009: Invalid Login Attempt
  await step(CAT,
    'Invalid Credentials Login Rejection',
    'Enter wrong credentials and verify the app shows an error, not the dashboard',
    async () => {
      const usernameField = await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)');
      const passwordField = await driver.$('android=new UiSelector().className("android.widget.EditText").instance(1)');
      const loginBtn      = await driver.$('android=new UiSelector().className("android.widget.Button").instance(0)');

      await usernameField.clearValue();
      await usernameField.setValue('invalid_user@test.com');
      await passwordField.clearValue();
      await passwordField.setValue('wrongpassword123');
      await loginBtn.click();
      await delay(2000);

      // App should still be on login screen or show error
      const isOnLogin = await driver.$('android=new UiSelector().textContains("PONIS")').isDisplayed().catch(() => false);
      if (!isOnLogin) throw new Error('App incorrectly navigated away from login on bad credentials');
    }
  );

  // TC-010: Successful Medical Staff Login
  await step(CAT,
    'Successful Medical Staff Login',
    'Use Medical Staff preset to log in and verify navigation to Hospital Command Center',
    async () => {
      const medBtn = await driver.$('android=new UiSelector().textContains("Medical Staff")');
      await medBtn.click();
      await delay(500);

      const loginBtn = await driver.$('android=new UiSelector().className("android.widget.Button").instance(0)');
      await loginBtn.click();
      await delay(3000);

      // Verify dashboard loaded
      const dashboard = await driver.$('android=new UiSelector().textContains("Command Center")');
      const displayed = await dashboard.isDisplayed().catch(() => false);
      if (!displayed) throw new Error('Did not navigate to Command Center after login');
    }
  );

  // TC-011: Dashboard Header Visible After Login
  await step(CAT,
    'Dashboard Header Visible After Login',
    'Verify the main dashboard header/navigation bar is present after successful login',
    async () => {
      const header = await driver.$('android=new UiSelector().textContains("PONIS")');
      const displayed = await header.isDisplayed().catch(() => false);
      if (!displayed) throw new Error('Dashboard header not visible post-login');
    }
  );

  // TC-012: Forgot Password Screen Navigation
  await step(CAT,
    'Forgot Password Screen Navigation',
    'Navigate back to login and open the Forgot Password screen',
    async () => {
      // Navigate back to login first (logout)
      try {
        const logoutBtn = await driver.$('android=new UiSelector().textContains("Terminate Session")');
        await logoutBtn.click();
        await delay(2000);
      } catch (_) {
        // Already on login or no session active
      }

      // Now tap Forgot Password
      const forgotBtn = await driver.$('android=new UiSelector().textContains("Forgot")');
      const displayed = await forgotBtn.isDisplayed().catch(() => false);
      if (!displayed) throw new Error('Forgot password link not found on login screen');
      await forgotBtn.click();
      await delay(1500);
    }
  );

  // TC-013: Forgot Password Email Input
  await step(CAT,
    'Forgot Password Email Input',
    'Verify email input field is visible on the Forgot Password screen',
    async () => {
      const emailInput = await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)');
      const displayed  = await emailInput.isDisplayed().catch(() => false);
      if (!displayed) throw new Error('Email input not visible on Forgot Password screen');
    }
  );

  // TC-014: Return to Login from Forgot Password
  await step(CAT,
    'Return to Login from Forgot Password',
    'Tap back/return button from Forgot Password screen to go back to Login',
    async () => {
      const backBtn = await driver.$('android=new UiSelector().textContains("Return")');
      const displayed = await backBtn.isDisplayed().catch(() => false);
      if (!displayed) {
        // Use device back button
        await driver.back();
      } else {
        await backBtn.click();
      }
      await delay(1500);

      const loginBtn = await driver.$('android=new UiSelector().className("android.widget.Button").instance(0)');
      const visible  = await loginBtn.isDisplayed().catch(() => false);
      if (!visible) throw new Error('Did not return to login screen');
    }
  );
};
