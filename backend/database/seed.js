const bcrypt = require('bcryptjs');
const db = require('./connection');
const fs = require('fs');
const path = require('path');

async function runSeed() {
  console.log('[PONIS DB] Checking database and seeding initial clinical data...');

  try {
    // 1. Initialize schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await db.exec(sql);
      console.log('[PONIS DB] Schema applied successfully.');
    }
  } catch (err) {
    console.error('Error applying SQL schema:', err);
  }

  // 2. Check if users are already seeded
  const { rows: existingUsers } = await db.query(
    'SELECT id FROM users WHERE username = $1',
    ['doctor']
  );
  if (existingUsers.length > 0) {
    console.log('[PONIS DB] Database already contains data. Seeding skipped.');
    return;
  }

  console.log('[PONIS DB] Seeding default clinical profiles and authentication accounts...');

  // Hashing default credentials
  const salt = bcrypt.genSaltSync(10);
  const doctorHash = bcrypt.hashSync('doctor123', salt);
  const patientHash = bcrypt.hashSync('patient123', salt);

  // Insert Users
  await db.query(
    'INSERT INTO users (username, "passwordHash", role) VALUES ($1, $2, $3)',
    ['doctor', doctorHash, 'doctor']
  );
  await db.query(
    'INSERT INTO users (username, "passwordHash", role) VALUES ($1, $2, $3)',
    ['patient', patientHash, 'patient']
  );

  // Insert Patients
  const patientsToInsert = [
    { name: 'Alexander Vance', age: 58, cancer: 'Lung Cancer', stage: 'Stage III' },
    { name: 'Elena Rostova', age: 42, cancer: 'Breast Cancer', stage: 'Stage II' },
    { name: 'Marcus Chen', age: 67, cancer: 'Colorectal Cancer', stage: 'Stage IV' },
    { name: 'Sarah Jenkins', age: 31, cancer: 'Leukemia', stage: 'Stage I' }
  ];

  const addedPatients = [];
  for (const p of patientsToInsert) {
    const { rows } = await db.query(
      `INSERT INTO patients ("patientName", age, "cancerType", stage)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [p.name, p.age, p.cancer, p.stage]
    );
    addedPatients.push({ id: rows[0].id, ...p });
  }

  // Insert Analytics for each patient
  const patientAnalytics = [
    { pId: addedPatients[0].id, energy: 65, hydration: 78, recovery: 70, risk: 'Medium' },
    { pId: addedPatients[1].id, energy: 85, hydration: 92, recovery: 88, risk: 'Low' },
    { pId: addedPatients[2].id, energy: 40, hydration: 55, recovery: 48, risk: 'High' },
    { pId: addedPatients[3].id, energy: 75, hydration: 80, recovery: 82, risk: 'Low' }
  ];

  for (const a of patientAnalytics) {
    await db.query(
      `INSERT INTO analytics ("patientId", energy, hydration, recovery, risk)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT ("patientId") DO UPDATE
         SET energy = EXCLUDED.energy,
             hydration = EXCLUDED.hydration,
             recovery = EXCLUDED.recovery,
             risk = EXCLUDED.risk`,
      [a.pId, a.energy, a.hydration, a.recovery, a.risk]
    );
  }

  // Insert AI Predictions for each patient
  const patientPredictions = [
    { pId: addedPatients[0].id, fatigueRisk: 'Medium', recoveryForecast: 74, deficiencyRisk: 'Mild', energyTrend: 'stable', hydrationTrend: 'improving' },
    { pId: addedPatients[1].id, fatigueRisk: 'Low', recoveryForecast: 91, deficiencyRisk: 'None', energyTrend: 'improving', hydrationTrend: 'stable' },
    { pId: addedPatients[2].id, fatigueRisk: 'High', recoveryForecast: 52, deficiencyRisk: 'Severe', energyTrend: 'declining', hydrationTrend: 'declining' },
    { pId: addedPatients[3].id, fatigueRisk: 'Low', recoveryForecast: 85, deficiencyRisk: 'None', energyTrend: 'improving', hydrationTrend: 'improving' }
  ];

  for (const p of patientPredictions) {
    await db.query(
      `INSERT INTO predictions ("patientId", "fatigueRisk", "recoveryForecast", "deficiencyRisk", "energyTrend", "hydrationTrend")
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT ("patientId") DO UPDATE
         SET "fatigueRisk" = EXCLUDED."fatigueRisk",
             "recoveryForecast" = EXCLUDED."recoveryForecast",
             "deficiencyRisk" = EXCLUDED."deficiencyRisk",
             "energyTrend" = EXCLUDED."energyTrend",
             "hydrationTrend" = EXCLUDED."hydrationTrend"`,
      [p.pId, p.fatigueRisk, p.recoveryForecast, p.deficiencyRisk, p.energyTrend, p.hydrationTrend]
    );
  }

  // Insert standard meal logs & water logs
  const mealTypes = [
    { type: 'early_morning', name: 'Warm Ginger Tea & Almonds', score: 95 },
    { type: 'breakfast', name: 'High-Protein Oatmeal with Berries', score: 90 },
    { type: 'snacks', name: 'Avocado & Chia Seed Pudding', score: 85 },
    { type: 'lunch', name: 'Steamed Salmon with Quinoa and Broccolini', score: 95 },
    { type: 'evening_drink', name: 'Fortified Whey Protein Shake', score: 90 },
    { type: 'dinner', name: 'Light Turkey Broth with Spinach', score: 80 }
  ];

  for (const patient of addedPatients) {
    for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
      for (const meal of mealTypes) {
        let completed = true;
        if (patient.id === addedPatients[2].id && (meal.type === 'breakfast' || meal.type === 'dinner') && dayOffset === 0) {
          completed = false;
        }
        if (patient.id === addedPatients[0].id && meal.type === 'evening_drink' && dayOffset === 1) {
          completed = false;
        }

        await db.query(
          `INSERT INTO meal_logs ("patientId", "mealType", "mealName", completed, "nutritionScore")
           VALUES ($1, $2, $3, $4, $5)`,
          [patient.id, meal.type, meal.name, completed, meal.score]
        );
      }

      const waterIntake = patient.id === addedPatients[2].id ? 1200 : 2500;
      await db.query(
        'INSERT INTO water_logs ("patientId", intake) VALUES ($1, $2)',
        [patient.id, waterIntake + (dayOffset * 100)]
      );
    }
  }

  console.log('[PONIS DB] Seeding completed successfully!');
}

module.exports = runSeed;
