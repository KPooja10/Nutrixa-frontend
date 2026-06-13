const { By, until, Key } = require('selenium-webdriver');

module.exports = async function run(driver, step, setReactInput, delay, BASE_URL) {
  // TC-002: Portal Landing Page Navigation
  await step(
    'Portal Landing Page',
    'Navigate to the PONIS homepage and wait for loading',
    async () => {
      await driver.get(BASE_URL);
      await driver.wait(until.elementLocated(By.id('username')), 10000);
    }
  );

  // TC-003: Check Page Title
  await step(
    'Check Page Title',
    'Assert that the browser page title is valid and non-empty',
    async () => {
      const title = await driver.getTitle();
      if (!title || title.trim() === '') {
        throw new Error('Title is empty');
      }
    }
  );

  // TC-004: Check User Identifier Input
  await step(
    'Check User Identifier Input',
    'Verify that the username input field is present and visible',
    async () => {
      const usernameInput = await driver.findElement(By.id('username'));
      const isVisible = await usernameInput.isDisplayed();
      if (!isVisible) throw new Error('Username field is not visible');
    }
  );

  // TC-005: Check Password Input
  await step(
    'Check Password Input',
    'Verify that the password input field is present and visible',
    async () => {
      const passwordInput = await driver.findElement(By.id('password'));
      const isVisible = await passwordInput.isDisplayed();
      if (!isVisible) throw new Error('Password field is not visible');
    }
  );

  // TC-006: Check Forgot Password Link
  await step(
    'Check Forgot Password Link',
    'Verify the presence of the Forgot Password navigation link',
    async () => {
      const forgotLink = await driver.findElement(By.xpath("//a[contains(@href, 'forgot-password')]"));
      if (!forgotLink) throw new Error('Forgot password link not found');
    }
  );

  // TC-007: Check Submit Button
  await step(
    'Check Submit Button',
    'Verify that the authorize submit button is active on the login card',
    async () => {
      const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
      if (!submitBtn) throw new Error('Submit button not found');
    }
  );

  // TC-008: Check Quick Preset Doctor Button
  await step(
    'Check Quick Preset Doctor Button',
    'Verify the presence of the Doctor preset button',
    async () => {
      const docBtn = await driver.findElement(By.xpath("//button[contains(., 'Medical Staff')]"));
      if (!docBtn) throw new Error('Doctor preset button not found');
    }
  );

  // TC-009: Check Quick Preset Patient Button
  await step(
    'Check Quick Preset Patient Button',
    'Verify the presence of the Patient preset button',
    async () => {
      const patBtn = await driver.findElement(By.xpath("//button[contains(., 'Oncology Patient')]"));
      if (!patBtn) throw new Error('Patient preset button not found');
    }
  );

  // TC-010: Check Forgot Password Redirection
  await step(
    'Check Forgot Password Redirection',
    'Navigate to forgot password view and assert page redirection',
    async () => {
      const forgotLink = await driver.findElement(By.xpath("//a[contains(@href, 'forgot-password')]"));
      await driver.executeScript("arguments[0].click();", forgotLink);
      await driver.wait(until.urlContains('forgot-password'), 5000);
    }
  );

  // TC-011: Forgot Password Input Check
  await step(
    'Forgot Password Input Check',
    'Verify that the recovery email input is present on the page',
    async () => {
      const emailInput = await driver.findElement(By.css('input[type="email"]'));
      if (!emailInput) throw new Error('Recovery email input not found');
    }
  );

  // TC-012: Forgot Password Submit Check
  await step(
    'Forgot Password Submit Check',
    'Verify the presence of the reset request submit button',
    async () => {
      const resetBtn = await driver.findElement(By.css('button[type="submit"]'));
      if (!resetBtn) throw new Error('Reset submit button not found');
    }
  );

  // TC-013: Back to Login Navigation
  await step(
    'Back to Login Navigation',
    'Click back navigation link and return to login gateway',
    async () => {
      const backLink = await driver.findElement(
        By.xpath("//a[contains(normalize-space(.), 'Return to Authentication Gateway') or contains(normalize-space(.), 'Return to')]")
      );
      await driver.executeScript("arguments[0].click();", backLink);
      await driver.wait(until.elementLocated(By.id('username')), 5000);
    }
  );

  // TC-014: Check Radial Overlay Assets
  await step(
    'Check Radial Overlay Assets',
    'Verify styling background radial overlays exist',
    async () => {
      const overlay = await driver.findElement(By.xpath("//div[contains(@class, 'blur-3xl')]"));
      if (!overlay) throw new Error('Styling radial overlay background element not found');
    }
  );

  // TC-015: Check System Title Logo
  await step(
    'Check System Title Logo',
    'Verify the brand title PONIS logo displays in authentication gateway',
    async () => {
      const title = await driver.findElement(By.xpath("//span[contains(text(), 'PONIS')]"));
      if (!title) throw new Error('Brand text title not found');
    }
  );
};
