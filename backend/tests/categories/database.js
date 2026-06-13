const { By, until, Key } = require('selenium-webdriver');

module.exports = async function run(driver, step, setReactInput, delay, BASE_URL) {
  // Helper to fetch database registries directly from the frontend services mapping
  async function getPatientsData() {
    return await driver.executeAsyncScript((callback) => {
      const token = localStorage.getItem('ponis_token');
      fetch('/api/patients', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      .then(r => r.json())
      .then(data => callback(data))
      .catch(() => callback([]));
    });
  }

  let dbPatients = [];

  // TC-062: Load DB Records for verification
  await step(
    'Load Database Patient Records',
    'Fetch clinical demographics list from database to begin validation checks',
    async () => {
      dbPatients = await getPatientsData();
      if (!dbPatients || dbPatients.length === 0) {
        throw new Error('Database returned empty patients table');
      }
    }
  );

  // TC-063: Verify Patient record insertion exists
  await step(
    'Verify Insertion: Selenium Alpha',
    'Assert that Selenium Alpha profile row exists in the database records',
    async () => {
      const found = dbPatients.some(p => p.patientName === 'Selenium Alpha');
      if (!found) throw new Error('Selenium Alpha database entry missing');
    }
  );

  // TC-064: Verify Patient record insertion parameters
  await step(
    'Verify Demographics: Selenium Alpha Age',
    'Assert that Selenium Alpha age is set correctly to 45 in the database',
    async () => {
      const p = dbPatients.find(p => p.patientName === 'Selenium Alpha');
      if (p.age !== 45) throw new Error(`Expected age 45 but found ${p.age}`);
    }
  );

  // TC-065: Verify Patient stage insertion parameter
  await step(
    'Verify Demographics: Selenium Alpha Stage',
    'Assert that Selenium Alpha staging is set to Stage I in the database',
    async () => {
      const p = dbPatients.find(p => p.patientName === 'Selenium Alpha');
      if (p.stage !== 'Stage I') throw new Error(`Expected Stage I but found ${p.stage}`);
    }
  );

  // TC-066: Verify Patient classification parameter
  await step(
    'Verify Demographics: Selenium Alpha Classification',
    'Assert that Selenium Alpha cancerType is Breast Cancer in the database',
    async () => {
      const p = dbPatients.find(p => p.patientName === 'Selenium Alpha');
      if (p.cancerType !== 'Breast Cancer') throw new Error(`Expected Breast Cancer but found ${p.cancerType}`);
    }
  );

  // TC-067: Verify Patient ID uniqueness
  await step(
    'Verify Patient ID uniqueness',
    'Assert that all patients inserted in the database have unique IDs',
    async () => {
      const ids = dbPatients.map(p => p.id);
      const uniqueIds = new Set(ids);
      if (ids.length !== uniqueIds.size) throw new Error('Database contains duplicate patient ID entries');
    }
  );

  // TC-068: Verify Patient insertion: Selenium Omicron
  await step(
    'Verify Insertion: Selenium Omicron',
    'Assert that the 15th registered patient Selenium Omicron row exists in database',
    async () => {
      const found = dbPatients.some(p => p.patientName === 'Selenium Omicron');
      if (!found) throw new Error('Selenium Omicron database entry missing');
    }
  );

  // TC-069: Verify Patient telemetry analytics row pre-population
  await step(
    'Verify Analytics Row Pre-population',
    'Assert that analytics table references have been correctly created for all patients',
    async () => {
      dbPatients.forEach(p => {
        if (p.energy === undefined || p.hydration === undefined) {
          throw new Error(`Analytics parameters not bound for patient ID: ${p.id}`);
        }
      });
    }
  );

  // TC-070: Verify Patient risk level validation
  await step(
    'Verify Analytics Risk Paradigm',
    'Assert that standard initialized risk parameter is mapped on new patient listings',
    async () => {
      const p = dbPatients.find(p => p.patientName === 'Selenium Alpha');
      if (!p.risk) throw new Error('Risk parameter missing in patient analytics join');
    }
  );

  // TC-071: Verify Database Seed constraints
  await step(
    'Verify Database Roster Seeds',
    'Assert that the total active patients in database is greater than or equal to 15',
    async () => {
      if (dbPatients.length < 15) {
        throw new Error(`Expected at least 15 patients but found: ${dbPatients.length}`);
      }
    }
  );
};
