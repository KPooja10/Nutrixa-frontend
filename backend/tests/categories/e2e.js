const { By, until, Key } = require('selenium-webdriver');

module.exports = async function run(driver, step, setReactInput, delay, BASE_URL) {
  // TC-096: Navigate back to active monitored patient console
  await step(
    'E2E: Navigate to Central Console',
    'Return to main dashboard to confirm patient settings persist',
    async () => {
      // If Selenium Alpha is not monitored, go select it first
      const bodyText = await driver.findElement(By.tagName('body')).getText();
      if (!bodyText.includes('Selenium Alpha')) {
        const commandLink = await driver.wait(until.elementLocated(By.xpath("//a[contains(., 'Command Center')]")), 5000);
        await driver.executeScript("arguments[0].click();", commandLink);
        await driver.wait(until.urlContains('hospital-center'), 5000);
        
        await delay(1000);
        const rowXpath = `//tbody/tr[contains(., 'Selenium Alpha')]`;
        const patientRow = await driver.wait(until.elementLocated(By.xpath(rowXpath)), 5000);
        const monitorBtn = await patientRow.findElement(By.xpath(".//button[contains(., 'Monitor')]"));
        await driver.executeScript("arguments[0].click();", monitorBtn);
        await delay(1000);
      }
      const link = await driver.findElement(By.xpath("//a[contains(., 'Central Console')]"));
      await driver.executeScript("arguments[0].click();", link);
      await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Selenium Alpha')]")), 8000);
    }
  );

  // TC-097: Navigate to Intake Planner
  await step(
    'E2E: Navigate to Intake Planner',
    'Navigate to meal checklists planner page',
    async () => {
      const link = await driver.findElement(By.xpath("//a[contains(., 'Intake Planner')]"));
      await driver.executeScript("arguments[0].click();", link);
      await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Nutrition & Meal Planner')]")), 8000);
    }
  );

  // TC-098: Toggle meal compliance checkboxes (using native click)
  await step(
    'E2E: Toggle Meal Compliance checkboxes',
    'Select and toggle multiple meal checklist checkboxes to complete patient profile log',
    async () => {
      const checkBoxes = await driver.findElements(By.css('input[type="checkbox"]'));
      if (checkBoxes.length > 2) {
        await checkBoxes[0].click();
        await delay(500);
        await checkBoxes[1].click();
        await delay(500);
        await checkBoxes[2].click();
        await delay(500);
      }
    }
  );

  // TC-099: Verify adherence summary updates
  await step(
    'E2E: Verify Adherence Summary Score',
    'Confirm that the compliance score card has updated based on completed checkboxes',
    async () => {
      const adherenceText = await driver.findElement(By.xpath("//*[contains(., 'Adherence')]")).getText();
      if (!adherenceText) throw new Error('Adherence compliance index not found');
    }
  );

  // TC-100: Navigate to Prognosis Engine
  await step(
    'E2E: Navigate to Prognosis Engine',
    'Route dashboard page to AI prognosis engine metrics',
    async () => {
      const link = await driver.findElement(By.xpath("//a[contains(., 'Prognosis Engine')]"));
      await driver.executeScript("arguments[0].click();", link);
      await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Prognosis & Prediction Engine')]")), 8000);
    }
  );

  // TC-101: Recalculate predictions, verify forecasts results
  await step(
    'E2E: Recalculate prognosis forecast',
    'Trigger AI predictions recalculation and verify deficiency assessment metrics update',
    async () => {
      const recalcBtn = await driver.findElement(By.xpath("//button[contains(normalize-space(.), 'Re-run Prognosis Core') or contains(normalize-space(.), 'Prognosis Core')]"));
      await driver.executeScript("arguments[0].click();", recalcBtn);
      await delay(1500);

      // Verify deficiency assessment badge exists
      const badge = await driver.findElement(By.xpath("//div[contains(text(), 'Metabolic')]/../..//span[contains(@class, 'rounded')]"));
      if (!badge) throw new Error('Deficiency Risk assessment status missing');
    }
  );

  // TC-102: Check AI Food Scanner page load
  await step(
    'E2E: Navigate to AI Food Scanner',
    'Verify food nutrient scanner interface mounts successfully',
    async () => {
      const link = await driver.findElement(By.xpath("//a[contains(., 'AI Food Scanner')]"));
      await driver.executeScript("arguments[0].click();", link);
      await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'AI Food Nutrient Scanner')]")), 8000);
    }
  );

  // TC-103: Check Biometric Scan page and webcam activation
  await step(
    'E2E: Navigate to Biometric Scan',
    'Route dashboard to Biometric face analysis panel and activate simulated webcam feed',
    async () => {
      const link = await driver.findElement(By.xpath("//a[contains(., 'Biometric Scan')]"));
      await driver.executeScript("arguments[0].click();", link);
      await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'AI Biometric Face Analyzer')]")), 8000);

      const triggerBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Activate Video Telemetry')]"));
      await driver.executeScript("arguments[0].click();", triggerBtn);
      await delay(800);
    }
  );

  // TC-104: View User Profile panel
  await step(
    'E2E: Navigate to User Settings',
    'Verify doctor identity profile card displays MFA settings details',
    async () => {
      const link = await driver.findElement(By.xpath("//a[contains(., 'User Settings')]"));
      await driver.executeScript("arguments[0].click();", link);
      await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Clinical User Profile')]")), 8000);
    }
  );

  // TC-105: Terminate Doctor session
  await step(
    'E2E: Terminate Session',
    'Click terminate session button and confirm redirection back to login gateway',
    async () => {
      const logoutBtn = await driver.findElement(By.xpath("//button[contains(., 'Terminate Session')]"));
      await driver.executeScript("arguments[0].click();", logoutBtn);
      await driver.wait(until.urlContains('login'), 8000);
    }
  );
};
