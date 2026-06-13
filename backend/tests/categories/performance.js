const { By, until, Key } = require('selenium-webdriver');

module.exports = async function run(driver, step, setReactInput, delay, BASE_URL) {
  // First 8 patients of our clinical roster
  const performancePatients = [
    { name: 'Selenium Alpha', age: '45', type: 'Breast Cancer', stage: 'Stage I' },
    { name: 'Selenium Beta', age: '52', type: 'Lung Cancer', stage: 'Stage II' },
    { name: 'Selenium Gamma', age: '63', type: 'Colorectal Cancer', stage: 'Stage III' },
    { name: 'Selenium Delta', age: '34', type: 'Leukemia', stage: 'Stage I' },
    { name: 'Selenium Epsilon', age: '71', type: 'Prostate Cancer', stage: 'Stage IV' },
    { name: 'Selenium Zeta', age: '58', type: 'Pancreatic Cancer', stage: 'Stage III' },
    { name: 'Selenium Eta', age: '49', type: 'Ovarian Cancer', stage: 'Stage II' },
    { name: 'Selenium Theta', age: '29', type: 'Breast Cancer', stage: 'Stage I' }
  ];

  for (let i = 0; i < performancePatients.length; i++) {
    const p = performancePatients[i];
    const index = 34 + i;
    await step(
      `Register Patient Loop ${i + 1}: ${p.name}`,
      `Measure latency of registering patient ${p.name} (Age: ${p.age}, Type: ${p.type}, Stage: ${p.stage})`,
      async () => {
        const registerBtn = await driver.wait(
          until.elementLocated(By.xpath("//button[contains(normalize-space(.), 'Register Patient Intake')]")), 
          5000
        );
        
        const startTime = Date.now();
        await driver.executeScript("arguments[0].click();", registerBtn);
        
        const patientNameInput = await driver.wait(until.elementLocated(By.id('patientName')), 5000);
        await driver.wait(until.elementIsVisible(patientNameInput), 5000);
        
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

        const latency = Date.now() - startTime;
        console.log(`   [Performance Metric] Intake registration latency: ${latency}ms`);
        if (latency > 6000) {
          console.warn(`   [Performance Warning] Registration latency ${latency}ms exceeds SLA limit`);
        }
      }
    );
  }
};
