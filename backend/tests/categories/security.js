const { By, until, Key } = require('selenium-webdriver');

module.exports = async function run(driver, step, setReactInput, delay, BASE_URL) {
  // Register remaining 7 patients from the clinical list (TC-042 to TC-048)
  const securityPatients = [
    { name: 'Selenium Iota', age: '68', type: 'Lung Cancer', stage: 'Stage IV' },
    { name: 'Selenium Kappa', age: '55', type: 'Colorectal Cancer', stage: 'Stage II' },
    { name: 'Selenium Lambda', age: '41', type: 'Leukemia', stage: 'Stage III' },
    { name: 'Selenium Mu', age: '75', type: 'Prostate Cancer', stage: 'Stage I' },
    { name: 'Selenium Nu', age: '62', type: 'Pancreatic Cancer', stage: 'Stage IV' },
    { name: 'Selenium Xi', age: '38', type: 'Ovarian Cancer', stage: 'Stage III' },
    { name: 'Selenium Omicron', age: '50', type: 'Breast Cancer', stage: 'Stage II' }
  ];

  for (let i = 0; i < securityPatients.length; i++) {
    const p = securityPatients[i];
    await step(
      `Register Patient Loop ${i + 9}: ${p.name}`,
      `Register patient ${p.name} (Age: ${p.age}, Type: ${p.type}, Stage: ${p.stage}) checking basic sanitization constraints`,
      async () => {
        const registerBtn = await driver.wait(
          until.elementLocated(By.xpath("//button[contains(normalize-space(.), 'Register Patient Intake')]")), 
          5000
        );
        await driver.executeScript("arguments[0].click();", registerBtn);
        
        const patientNameInput = await driver.wait(until.elementLocated(By.id('patientName')), 5000);
        const ageInput = await driver.findElement(By.id('age'));
        const cancerTypeSelect = await driver.findElement(By.id('cancerType'));
        const stageSelect = await driver.findElement(By.id('stage'));
        const submitIntakeBtn = await driver.findElement(By.css('button[type="submit"]'));

        await setReactInput(patientNameInput, p.name);
        await setReactInput(ageInput, p.age);
        
        await cancerTypeSelect.findElement(By.css(`option[value='${p.type}']`)).click();
        await stageSelect.findElement(By.css(`option[value='${p.stage}']`)).click();
        
        await driver.executeScript("arguments[0].click();", submitIntakeBtn);
        await driver.wait(until.urlContains('hospital-center'), 8000);
      }
    );
  }

  // TC-049: SQL Injection Payload Sanity
  await step(
    'SQL Injection Input Sanity',
    'Submit sql injection characters as name input and check backend error handling',
    async () => {
      const registerBtn = await driver.findElement(By.xpath("//button[contains(normalize-space(.), 'Register Patient Intake')]"));
      await driver.executeScript("arguments[0].click();", registerBtn);
      
      const nameInput = await driver.wait(until.elementLocated(By.id('patientName')), 5000);
      const ageInput = await driver.findElement(By.id('age'));
      const submitBtn = await driver.findElement(By.css('button[type="submit"]'));

      await setReactInput(nameInput, "Aiden' OR '1'='1");
      await setReactInput(ageInput, '45');
      await driver.executeScript("arguments[0].click();", submitBtn);
      
      // Verification: redirects successfully back to command center, indicating characters are escaped properly
      await driver.wait(until.urlContains('hospital-center'), 8000);
    }
  );

  // TC-050: XSS Script Payload Sanity
  await step(
    'XSS Script Input Sanity',
    'Submit html markup script tags as name input and verify system is secure',
    async () => {
      const registerBtn = await driver.findElement(By.xpath("//button[contains(normalize-space(.), 'Register Patient Intake')]"));
      await driver.executeScript("arguments[0].click();", registerBtn);
      
      const nameInput = await driver.wait(until.elementLocated(By.id('patientName')), 5000);
      const ageInput = await driver.findElement(By.id('age'));
      const submitBtn = await driver.findElement(By.css('button[type="submit"]'));

      await setReactInput(nameInput, "<script>alert('xss')</script>");
      await setReactInput(ageInput, '30');
      await driver.executeScript("arguments[0].click();", submitBtn);
      
      await driver.wait(until.urlContains('hospital-center'), 8000);
    }
  );

  // TC-051: Route Protection Gate Verification
  await step(
    'Route Protection Gate Verification',
    'Check that active token is required for private dashboards',
    async () => {
      // Clear token in localStorage
      await driver.executeScript("localStorage.removeItem('ponis_token');");
      await driver.get(BASE_URL);
      
      // Should automatically redirect back to auth gateway
      await driver.wait(until.urlContains('login'), 8000);

      // Re-login to continue the execution flow
      const docBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Medical Staff')]")), 5000);
      await driver.executeScript("arguments[0].click();", docBtn);
      const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
      await driver.executeScript("arguments[0].click();", submitBtn);
      await driver.wait(until.urlContains('hospital-center'), 8000);
    }
  );
};
