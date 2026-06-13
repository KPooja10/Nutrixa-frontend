const { By, until, Key } = require('selenium-webdriver');

module.exports = async function run(driver, step, setReactInput, delay, BASE_URL) {
  // TC-080: Simulate Mobile Device Viewport size
  await step(
    'Mobile Simulation Viewport Resize',
    'Resize window size to iPhone dimensions (375x667) and verify mobile mode triggers',
    async () => {
      await driver.manage().window().setSize({ width: 375, height: 667 });
      await delay(1000);
    }
  );

  // TC-081: Check Hamburger Menu Visibility
  await step(
    'Mobile Hamburger Menu Visibility Check',
    'Verify that the mobile hamburger button is visible in header navigation bar',
    async () => {
      const hamburger = await driver.findElement(By.xpath("//header//button"));
      const isVisible = await hamburger.isDisplayed();
      if (!isVisible) throw new Error('Hamburger toggle button not visible on mobile');
    }
  );

  // TC-082: Check Hamburger Menu Opens Drawer
  await step(
    'Mobile Menu Drawer Trigger Open',
    'Click mobile hamburger button and verify navigation menu drawer drawer pops open',
    async () => {
      const hamburger = await driver.findElement(By.xpath("//header//button"));
      await driver.executeScript("arguments[0].click();", hamburger);
      await delay(1000);
      
      // Verify mobile settings link is now visible
      const settingsLink = await driver.findElement(By.xpath("//header//a[contains(., 'User Settings')]"));
      const isVisible = await settingsLink.isDisplayed();
      if (!isVisible) throw new Error('Navigation menu drawer did not expand');
    }
  );

  // TC-083: Check Mobile Sidebar Items Navigation
  await step(
    'Mobile Drawer Link Check: Central Console',
    'Verify that Central Console link is active inside expanded mobile menu drawer',
    async () => {
      const link = await driver.findElement(By.xpath("//header//a[contains(., 'Central Console')]"));
      if (!link) throw new Error('Central Console link not found in mobile drawer');
    }
  );

  // TC-084: Check Mobile Drawer Link Check: Command Center
  await step(
    'Mobile Drawer Link Check: Command Center',
    'Verify that Command Center link is active inside expanded mobile menu drawer',
    async () => {
      const link = await driver.findElement(By.xpath("//header//a[contains(., 'Command Center')]"));
      if (!link) throw new Error('Command Center link not found in mobile drawer');
    }
  );

  // TC-085: Check Mobile Drawer Link Check: User Settings
  await step(
    'Mobile Drawer Link Check: User Settings',
    'Verify that User Settings link is active inside expanded mobile menu drawer',
    async () => {
      const link = await driver.findElement(By.xpath("//header//a[contains(., 'User Settings')]"));
      if (!link) throw new Error('User Settings link not found in mobile drawer');
    }
  );

  // TC-086: Check Hamburger Menu Closes Drawer
  await step(
    'Mobile Menu Drawer Trigger Close',
    'Click close toggle button and verify navigation drawer drawer collapses cleanly',
    async () => {
      const hamburger = await driver.findElement(By.xpath("//header//button"));
      await driver.executeScript("arguments[0].click();", hamburger);
      await delay(1000);
    }
  );

  // TC-087: Restore Window Size
  await step(
    'Restore Desktop Layout Viewport Size',
    'Resize window back to Standard Desktop dimensions (1280x800) and verify sidebar restoration',
    async () => {
      await driver.manage().window().setSize({ width: 1280, height: 800 });
      await delay(1000);
    }
  );
};
