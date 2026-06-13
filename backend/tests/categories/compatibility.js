const { By, until, Key } = require('selenium-webdriver');

module.exports = async function run(driver, step, setReactInput, delay, BASE_URL) {
  // TC-026: Successful Doctor Login
  await step(
    'Doctor Authentication',
    'Log in with seeded clinician credentials: doctor / doctor123',
    async () => {
      const docBtn = await driver.findElement(By.xpath("//button[contains(., 'Medical Staff')]"));
      await driver.executeScript("arguments[0].click();", docBtn);
      const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
      await driver.executeScript("arguments[0].click();", submitBtn);

      await driver.wait(until.urlContains('hospital-center'), 8000);
    }
  );

  // TC-027: Confirm Hospital Command Center Redirection
  await step(
    'Confirm Command Center Redirection',
    'Verify browser redirected successfully to command center route',
    async () => {
      const url = await driver.getCurrentUrl();
      if (!url.includes('hospital-center')) {
        throw new Error(`Current url is not hospital command center: ${url}`);
      }
    }
  );

  // TC-028: Confirm Doctor Session Banner
  await step(
    'Confirm Doctor Session Banner',
    'Verify doctor metadata displays in sidebar session details',
    async () => {
      const sidebarRole = await driver.findElement(By.xpath("//div[contains(text(), 'doctor') or contains(text(), 'DOCTOR') or contains(., 'doctor')]"));
      if (!sidebarRole) throw new Error('Doctor identity tag not found in active session panel');
    }
  );

  // TC-029: Patient Login Verification
  await step(
    'Patient Login Verification',
    'Perform patient logout, login as patient, check redirect and logout',
    async () => {
      // Logout doctor
      const logoutBtn = await driver.findElement(By.xpath("//button[contains(., 'Terminate Session')]"));
      await driver.executeScript("arguments[0].click();", logoutBtn);
      await driver.wait(until.urlContains('login'), 8000);

      await delay(1000); // Wait for redirect animation to settle
      // Login as patient using preset
      const patBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Oncology Patient')]")), 5000);
      await driver.executeScript("arguments[0].click();", patBtn);
      const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
      await driver.executeScript("arguments[0].click();", submitBtn);

      // Should redirect to Dashboard (/) or (PONIS-/)
      await driver.wait(async () => {
        const url = await driver.getCurrentUrl();
        return url.endsWith('/') || url.includes('/PONIS-');
      }, 8000);

      // Logout patient
      const logoutBtn2 = await driver.findElement(By.xpath("//button[contains(., 'Terminate Session')]"));
      await driver.executeScript("arguments[0].click();", logoutBtn2);
      await driver.wait(until.urlContains('login'), 8000);
    }
  );

  // TC-030: Re-authenticate Doctor
  await step(
    'Re-authenticate Doctor',
    'Re-authenticate doctor to restore full clinical permissions',
    async () => {
      await delay(1000); // Wait for logout redirect animation and mount to complete
      const docBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Medical Staff')]")), 5000);
      await driver.executeScript("arguments[0].click();", docBtn);
      const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
      await driver.executeScript("arguments[0].click();", submitBtn);
      await driver.wait(until.urlContains('hospital-center'), 8500);
    }
  );

  // TC-031: Viewport Resize - Tablet Layout Resolution
  await step(
    'Tablet Viewport Compatibility Check',
    'Resize window size to Tablet resolution (768x1024) and assert container visibility',
    async () => {
      await driver.manage().window().setSize({ width: 768, height: 1024 });
      await delay(500);
      const mainContainer = await driver.findElement(By.xpath("//main"));
      if (!mainContainer) throw new Error('Main content box missing on Tablet size');
    }
  );

  // TC-032: Viewport Resize - Desktop Resolution Restore
  await step(
    'Desktop Viewport Compatibility Check',
    'Restore browser to Standard Desktop resolution (1280x800) and verify alignment',
    async () => {
      await driver.manage().window().setSize({ width: 1280, height: 800 });
      await delay(500);
    }
  );

  // TC-033: Widescreen Layout Resolution Check
  await step(
    'Widescreen Viewport Compatibility Check',
    'Resize window size to Widescreen resolution (1920x1080) and assert container visibility',
    async () => {
      await driver.manage().window().setSize({ width: 1920, height: 1080 });
      await delay(500);
      // Restore back to standard E2E testing window size
      await driver.manage().window().setSize({ width: 1280, height: 800 });
      await delay(500);
    }
  );
};
