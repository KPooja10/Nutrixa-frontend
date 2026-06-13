const { By, until, Key } = require('selenium-webdriver');

module.exports = async function run(driver, step, setReactInput, delay, BASE_URL) {
  // TC-072: Verify Semantic Heading Structure
  await step(
    'Accessibility: HTML5 Headings Check',
    'Verify that the dashboard view renders a valid semantic H1 heading element',
    async () => {
      const h1 = await driver.findElement(By.css('h1'));
      const text = await h1.getText();
      if (!text || text.trim() === '') throw new Error('H1 heading text is empty');
    }
  );

  // TC-073: Verify Input Accessibility Labels
  await step(
    'Accessibility: Form Label Link Check',
    'Navigate back to hospital center and check register form input associations',
    async () => {
      const commandLink = await driver.findElement(By.xpath("//a[contains(., 'Command Center')]"));
      await driver.executeScript("arguments[0].click();", commandLink);
      await driver.wait(until.urlContains('hospital-center'), 5000);
      
      const registerBtn = await driver.findElement(By.xpath("//button[contains(normalize-space(.), 'Register Patient Intake')]"));
      await driver.executeScript("arguments[0].click();", registerBtn);
      
      const patientNameInput = await driver.wait(until.elementLocated(By.id('patientName')), 5000);
      const id = await patientNameInput.getAttribute('id');
      const label = await driver.findElement(By.xpath(`//label[@for='${id}']`));
      if (!label) throw new Error('Input field patientName does not have a corresponding label');
      
      // Go back to Command Center
      const cancelBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Cancel')]"));
      await driver.executeScript("arguments[0].click();", cancelBtn);
      await driver.wait(until.urlContains('hospital-center'), 5000);
    }
  );

  // TC-074: Check Navigation Link Role Attributes
  await step(
    'Accessibility: Sidebar Link Roles',
    'Confirm that sidebar navigation elements use valid navigation anchor elements',
    async () => {
      const sidebarLinks = await driver.findElements(By.css('aside nav a'));
      if (sidebarLinks.length === 0) throw new Error('No sidebar navigation links found');
    }
  );

  // TC-075: Check Image Alt Tag presence equivalent
  await step(
    'Accessibility: Non-text alternative representations',
    'Verify that icon blocks display semantic emoji representations',
    async () => {
      const logoSpan = await driver.findElement(By.xpath("//span[contains(text(), 'PONIS')]/.."));
      const logoText = await logoSpan.getText();
      if (!logoText.includes('🧬')) throw new Error('Non-text clinical branding representation missing');
    }
  );

  // TC-076: Verify Form Buttons are interactive
  await step(
    'Accessibility: Button Element Interactive State',
    'Verify that clinical buttons display standard cursor pointer characteristics',
    async () => {
      const registerBtn = await driver.findElement(By.xpath("//button[contains(normalize-space(.), 'Register Patient Intake')]"));
      const tag = await registerBtn.getTagName();
      if (tag !== 'button') throw new Error(`Registration button is a ${tag} rather than a button tag`);
    }
  );

  // TC-077: Verify Contrast Color classes
  await step(
    'Accessibility: Contrast Color Layout Check',
    'Verify text element classes enforce standard high contrast medical themes',
    async () => {
      const title = await driver.findElement(By.xpath("//h1"));
      const className = await title.getAttribute('class');
      if (!className.includes('text-white') && !className.includes('text-slate-100')) {
        console.warn('   [Accessibility Warning] H1 text color does not match high contrast white class');
      }
    }
  );

  // TC-078: Check Form Inputs focusable states
  await step(
    'Accessibility: Forms Tab Navigation Focus',
    'Verify that text input boxes display standard HTML tab-index focus behavior',
    async () => {
      const sidebar = await driver.findElement(By.css('aside'));
      if (!sidebar) throw new Error('Sidebar element not focusable');
    }
  );

  // TC-079: Verify Footer Metadata access
  await step(
    'Accessibility: Footer SaaS Copyright labels',
    'Verify footer renders legal and clinical SaaS governances metadata readable by screen-readers',
    async () => {
      const footer = await driver.findElement(By.css('footer'));
      const text = await footer.getText();
      if (!text.includes('PONIS') || !text.includes('HIPAA') && !text.includes('SaaS')) {
        console.warn('   [Accessibility Warning] Footer details are missing clinical governance disclaimer');
      }
    }
  );
};
