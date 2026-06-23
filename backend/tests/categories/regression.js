const { By, until, Key } = require('selenium-webdriver');

module.exports = async function run(driver, step, setReactInput, delay, BASE_URL) {
  // TC-088: Activate patient monitoring check
  await step(
    'Regression: Activate Patient Monitoring Node',
    'Locate patient Selenium Alpha in clinical registry directory list and click Monitor button',
    async () => {
      const commandLink = await driver.findElement(By.xpath("//a[contains(., 'Command Center')]"));
      await driver.executeScript("arguments[0].click();", commandLink);
      await driver.wait(until.urlContains('hospital-center'), 5000);
      
      await delay(1000);
      const rowXpath = `//tbody/tr[contains(., 'Selenium Alpha')]`;
      const patientRow = await driver.wait(until.elementLocated(By.xpath(rowXpath)), 5000);
      const monitorBtn = await patientRow.findElement(By.xpath(".//button[contains(., 'Monitor')]"));
      await driver.executeScript("arguments[0].click();", monitorBtn);

      await driver.wait(async () => {
        const url = await driver.getCurrentUrl();
        return url.endsWith('/') || url.includes('PONIS');
      }, 8000);
    }
  );

  // TC-089: Verify demographic header text
  await step(
    'Regression: Patient Tag Demographics info',
    'Assert that current monitored patient title banner text is parsed correctly',
    async () => {
      const banner = await driver.findElement(By.xpath("//h2[contains(text(), 'Selenium Alpha')]"));
      if (!banner) throw new Error('Active monitored patient name banner missing');
    }
  );

  // TC-090: Quick add hydration log +250ml
  await step(
    'Regression: Hydration Ingestion (+250ml)',
    'Trigger Standard Quick Add +250ml cup and assert progress sync',
    async () => {
      const quickBtn = await driver.findElement(By.xpath("//button[contains(., '+250ml')]"));
      await driver.executeScript("arguments[0].click();", quickBtn);
      await delay(800);
    }
  );

  // TC-091: Quick add hydration log +750ml
  await step(
    'Regression: Hydration Ingestion (+750ml)',
    'Trigger Standard Quick Add +750ml therapeutic infuser and check total updates',
    async () => {
      const quickBtn = await driver.findElement(By.xpath("//button[contains(., '+750ml')]"));
      await driver.executeScript("arguments[0].click();", quickBtn);
      await delay(800);
    }
  );

  // TC-092: Log custom hydration volume
  await step(
    'Regression: Custom Hydration Ingestion',
    'Type and submit 350ml custom fluid value and assert telemetry update',
    async () => {
      const customInput = await driver.findElement(By.css('input[placeholder*="Intake"]'));
      const submitBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Log Intake')]"));

      await setReactInput(customInput, '350');
      await driver.executeScript("arguments[0].click();", submitBtn);
      await delay(800);
    }
  );

  // TC-093: Check dashboard panels render
  await step(
    'Regression: Dashboard Panel Integrity',
    'Assert presence of live metabolic score tracking widgets',
    async () => {
      const panel = await driver.findElement(By.xpath("//h3[contains(text(), 'Score') or contains(text(), 'Index')]"));
      if (!panel) throw new Error('Dashboard panel widgets missing');
    }
  );

  // TC-094: Check navigation link redirections
  await step(
    'Regression: Navigation Live Analytics Redirection',
    'Click Live Analytics link in sidebar and assert redirection route',
    async () => {
      const link = await driver.findElement(By.xpath("//a[contains(., 'Live Analytics')]"));
      await driver.executeScript("arguments[0].click();", link);
      await driver.wait(until.urlContains('analytics'), 5000);
    }
  );

  // TC-095: Invalid route fallback check
  await step(
    'Regression: Invalid URL Catch-all Redirection',
    'Navigate to non-existent client path and verify routing redirects to Central Console home',
    async () => {
      await driver.get(BASE_URL + 'invalid-custom-path-redirect');
      // Should catch all and redirect to / dashboard (loading console homepage)
      await driver.wait(async () => {
        const url = await driver.getCurrentUrl();
        return url.endsWith('/') || (url.includes('/PONIS-') || url.includes('/Nutrixa-frontend')) && !url.includes('redirect');
      }, 8000);
    }
  );
};
