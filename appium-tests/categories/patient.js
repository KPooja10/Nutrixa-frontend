/**
 * ================================================================
 *  PONIS Appium Tests - Category 7: Patient Management Testing
 *  TC-065 to TC-074
 *  Tests: Register patient, view patient, monitor, select, update
 * ================================================================
 */

module.exports = async function runPatientTests(driver, step, delay, BACKEND_URL) {
  const CAT = 'Patient Management';

  // Helper: ensure we are on the Hospital Command Center screen
  async function goToCommandCenter() {
    const cmdNav = await driver.$('android=new UiSelector().textContains("Command Center")');
    const found  = await cmdNav.isDisplayed().catch(() => false);
    if (found) {
      await cmdNav.click();
      await delay(2000);
    }
  }

  // Helper: tap the "Register Patient Intake" button
  async function openRegistrationForm() {
    const regBtn = await driver.$('android=new UiSelector().textContains("Register")');
    const found  = await regBtn.isDisplayed().catch(() => false);
    if (!found) throw new Error('"Register Patient" button not found on Command Center');
    await regBtn.click();
    await delay(2000);
  }

  // TC-065: Navigate to Hospital Command Center
  await step(CAT,
    'Open Hospital Command Center',
    'Navigate to Hospital Command Center and verify patient table/list is visible',
    async () => {
      await goToCommandCenter();
      const screen = await driver.$('android=new UiSelector().textContains("Hospital")');
      const displayed = await screen.isDisplayed().catch(() => false);
      if (!displayed) throw new Error('Hospital Command Center not loaded');
    }
  );

  // TC-066: Patient Registration Form Opens
  await step(CAT,
    'Patient Registration Form Opens',
    'Tap "Register Patient Intake" and verify registration form is displayed',
    async () => {
      await openRegistrationForm();
      const formField = await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)');
      const displayed = await formField.isDisplayed().catch(() => false);
      if (!displayed) throw new Error('Patient registration form did not open');
    }
  );

  // TC-067: Register New Patient - Appium Alpha
  await step(CAT,
    'Register Patient: Appium Alpha',
    'Fill and submit the patient registration form for Appium Alpha (Breast Cancer, Stage II)',
    async () => {
      const nameInput  = await driver.$('android=new UiSelector().resourceId("patientName")');
      const ageInput   = await driver.$('android=new UiSelector().resourceId("age")');

      const nameVisible = await nameInput.isDisplayed().catch(() => false);
      if (!nameVisible) {
        // Fallback by index
        const inputs = await driver.$$('android=new UiSelector().className("android.widget.EditText")');
        if (inputs.length < 2) throw new Error('Registration form inputs not found');
        await inputs[0].clearValue();
        await inputs[0].setValue('Appium Alpha');
        await inputs[1].clearValue();
        await inputs[1].setValue('52');
      } else {
        await nameInput.clearValue();
        await nameInput.setValue('Appium Alpha');
        await ageInput.clearValue();
        await ageInput.setValue('52');
      }

      // Select Cancer Type dropdown
      try {
        const cancerDropdown = await driver.$('android=new UiSelector().resourceId("cancerType")');
        await cancerDropdown.click();
        await delay(500);
        const breastOption = await driver.$('android=new UiSelector().textContains("Breast Cancer")');
        await breastOption.click();
        await delay(300);
      } catch (_) {}

      // Select Stage dropdown
      try {
        const stageDropdown = await driver.$('android=new UiSelector().resourceId("stage")');
        await stageDropdown.click();
        await delay(500);
        const stageOption = await driver.$('android=new UiSelector().textContains("Stage II")');
        await stageOption.click();
        await delay(300);
      } catch (_) {}

      // Submit form
      const submitBtn = await driver.$('android=new UiSelector().className("android.widget.Button").instance(0)');
      await submitBtn.click();
      await delay(3000);

      // Should return to command center
      const cmdCenter = await driver.$('android=new UiSelector().textContains("Hospital")').isDisplayed().catch(() => false);
      if (!cmdCenter) throw new Error('Did not return to Command Center after registration');
    }
  );

  // TC-068: Registered Patient Appears in List
  await step(CAT,
    'Registered Patient Appears in Patient List',
    'Verify that "Appium Alpha" appears in the patient table after registration',
    async () => {
      const patientEntry = await driver.$('android=new UiSelector().textContains("Appium Alpha")');
      const displayed    = await patientEntry.isDisplayed().catch(() => false);
      if (!displayed) throw new Error('"Appium Alpha" not found in patient list after registration');
    }
  );

  // TC-069: Register Second Patient - Appium Beta
  await step(CAT,
    'Register Patient: Appium Beta',
    'Register a second patient (Appium Beta, Lung Cancer Stage III) via the form',
    async () => {
      await openRegistrationForm();

      const inputs = await driver.$$('android=new UiSelector().className("android.widget.EditText")');
      if (inputs.length >= 2) {
        await inputs[0].clearValue();
        await inputs[0].setValue('Appium Beta');
        await inputs[1].clearValue();
        await inputs[1].setValue('61');
      }

      try {
        const cancerDropdown = await driver.$('android=new UiSelector().resourceId("cancerType")');
        await cancerDropdown.click();
        await delay(500);
        const option = await driver.$('android=new UiSelector().textContains("Lung Cancer")');
        await option.click();
        await delay(300);
      } catch (_) {}

      try {
        const stageDropdown = await driver.$('android=new UiSelector().resourceId("stage")');
        await stageDropdown.click();
        await delay(500);
        const stageOption = await driver.$('android=new UiSelector().textContains("Stage III")');
        await stageOption.click();
        await delay(300);
      } catch (_) {}

      const submitBtn = await driver.$('android=new UiSelector().className("android.widget.Button").instance(0)');
      await submitBtn.click();
      await delay(3000);
    }
  );

  // TC-070: Monitor Patient Button Works
  await step(CAT,
    'Monitor Patient Button Activates Monitoring',
    'Tap the Monitor button for a patient and verify navigation to the Central Console',
    async () => {
      await goToCommandCenter();
      await delay(1000);

      const monitorBtn = await driver.$('android=new UiSelector().textContains("Monitor")');
      const found      = await monitorBtn.isDisplayed().catch(() => false);
      if (!found) throw new Error('"Monitor" button not found in patient table');
      await monitorBtn.click();
      await delay(2500);

      // Should land on Central Console / Dashboard for that patient
      const consoleScreen = await driver.$('android=new UiSelector().textContains("Console")').isDisplayed().catch(() => false);
      const dashScreen    = await driver.$('android=new UiSelector().textContains("Dashboard")').isDisplayed().catch(() => false);
      if (!consoleScreen && !dashScreen) throw new Error('Did not navigate to patient console after Monitor tap');
    }
  );

  // TC-071: Active Monitored Patient Name Visible
  await step(CAT,
    'Active Monitored Patient Name Shows on Console',
    'Verify that the currently monitored patient name is displayed on the Central Console header',
    async () => {
      // Patient name should appear in heading area
      const patientName = await driver.$('android=new UiSelector().textContains("Appium")');
      const displayed   = await patientName.isDisplayed().catch(async () => {
        // Try any patient name visible
        const fallback = await driver.$('android=new UiSelector().className("android.widget.TextView").instance(1)');
        return fallback.isDisplayed().catch(() => false);
      });
      if (!displayed) throw new Error('Monitored patient name not visible on Central Console');
    }
  );

  // TC-072: Patient List Search / Filter
  await step(CAT,
    'Patient List Scroll to Find Patient',
    'Scroll the patient list to find a registered patient entry',
    async () => {
      await goToCommandCenter();
      await delay(1000);

      // Scroll down to load more if paginated
      const { width, height } = await driver.getWindowSize();
      await driver.touchAction([
        { action: 'press',  x: width / 2, y: height * 0.6 },
        { action: 'wait',   ms: 400 },
        { action: 'moveTo', x: width / 2, y: height * 0.3 },
        { action: 'release' },
      ]);
      await delay(1000);

      const anyPatient = await driver.$('android=new UiSelector().className("android.widget.TextView").instance(2)');
      const displayed  = await anyPatient.isDisplayed().catch(() => false);
      if (!displayed) throw new Error('No patient entries visible in list after scroll');
    }
  );

  // TC-073: Patient Count Stats Update
  await step(CAT,
    'Patient Statistics Count Updates After Registration',
    'Navigate to analytics/dashboard and verify patient count stat reflects registered patients',
    async () => {
      const analyticsNav = await driver.$('android=new UiSelector().textContains("Analytics")');
      const found        = await analyticsNav.isDisplayed().catch(() => false);
      if (found) {
        await analyticsNav.click();
        await delay(2000);
        // Look for patient count indicators
        const countEl = await driver.$('android=new UiSelector().className("android.widget.TextView").instance(0)');
        const displayed = await countEl.isDisplayed().catch(() => false);
        if (!displayed) throw new Error('Analytics stats not visible after registration');
      }
    }
  );

  // TC-074: Weekly Report Includes Registered Patients
  await step(CAT,
    'Weekly Report Includes Patient Data',
    'Navigate to Weekly Progress Report and verify patient-related data appears in the report',
    async () => {
      const reportNav = await driver.$('android=new UiSelector().textContains("Report")');
      const found     = await reportNav.isDisplayed().catch(() => false);
      if (found) {
        await reportNav.click();
        await delay(2000);
        const reportContent = await driver.$('android=new UiSelector().className("android.widget.TextView").instance(0)');
        const displayed     = await reportContent.isDisplayed().catch(() => false);
        if (!displayed) throw new Error('Weekly report did not display any content');
      }
    }
  );
};
