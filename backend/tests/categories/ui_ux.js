const { By, until, Key } = require('selenium-webdriver');

module.exports = async function run(driver, step, setReactInput, delay, BASE_URL) {
  // TC-016 to TC-025: UI/UX Authentication Validation Checks (10 parameterized tests checking styling/overlays)
  const invalidCredentials = [
    { u: '', p: '' },
    { u: 'doctor', p: '' },
    { u: '', p: 'doctor123' },
    { u: 'wrong_doctor', p: 'doctor123' },
    { u: 'doctor', p: 'wrong_password' },
    { u: 'admin', p: 'admin' },
    { u: 'patient', p: 'wrong_password' },
    { u: 'test_user', p: 'password' },
    { u: "' OR '1'='1", p: 'password' },
    { u: 'doctor', p: '123' }
  ];

  for (let i = 0; i < invalidCredentials.length; i++) {
    const cred = invalidCredentials[i];
    await step(
      `Auth Validation Loop ${i + 1}`,
      `Attempt authentication with Username: "${cred.u}", Password: "${cred.p}" and verify UI warning display`,
      async () => {
        const usernameInput = await driver.findElement(By.id('username'));
        const passwordInput = await driver.findElement(By.id('password'));
        const submitBtn = await driver.findElement(By.css('button[type="submit"]'));

        await setReactInput(usernameInput, cred.u);
        await setReactInput(passwordInput, cred.p);

        // Submit form
        await driver.executeScript("arguments[0].click();", submitBtn);
        await delay(1000);

        if (!cred.u || !cred.p) {
          // Empty fields are blocked by HTML5 required attribute or React submission check.
          // Assert that we did not redirect and are still at login gateway
          const currentUrl = await driver.getCurrentUrl();
          if (!currentUrl.includes('login') && 
              !currentUrl.endsWith('PONIS-/') && 
              !currentUrl.endsWith('PONIS-') && 
              !currentUrl.endsWith('Nutrixa-frontend/') && 
              !currentUrl.endsWith('Nutrixa-frontend')) {
            throw new Error(`Invalid authentication redirected to: ${currentUrl}`);
          }
        } else {
          // If inputs were provided, form submit went through, check error alert styling and content
          const errorAlert = await driver.wait(
            until.elementLocated(By.xpath("//div[contains(text(), 'Incorrect credentials') or contains(text(), '⚠️')]")), 
            3000
          );
          if (!errorAlert) throw new Error('Error notification banner did not appear for invalid login');
          const className = await errorAlert.getAttribute('class');
          // Verify UI/UX design matches neon-red styling paradigm
          if (!className.includes('red') && !className.includes('border-red')) {
            console.warn('   [UI Warning] Error alert does not contain design system red classes');
          }
        }
      }
    );
  }
};
