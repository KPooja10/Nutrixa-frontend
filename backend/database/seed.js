const bcrypt = require('bcryptjs');
const db = require('./connection');
const fs = require('fs');
const path = require('path');

function runSeed() {
  console.log('[PONIS DB] Checking database and seeding initial clinical data...');

  try {
    // 1. Initialize schema if running native SQLite
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      db.exec(sql);
    }
  } catch (err) {
    console.error('Error applying SQL schema:', err);
  }

  // 2. Check if users are already seeded
  const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get('doctor');
  if (existingUser) {
    console.log('[PONIS DB] Database already contains data. Seeding skipped.');
    return;
  }

  console.log('[PONIS DB] Seeding default clinical profiles and authentication accounts...');

  // Hashing default credentials
  const salt = bcrypt.genSaltSync(10);
  const doctorHash = bcrypt.hashSync('doctor123', salt);
  const patientHash = bcrypt.hashSync('patient123', salt);

  // Insert Users
  db.prepare('INSERT INTO users (username, passwordHash, role) VALUES (?, ?, ?)').run(['doctor', doctorHash, 'doctor']);
  db.prepare('INSERT INTO users (username, passwordHash, role) VALUES (?, ?, ?)').run(['patient', patientHash, 'patient']);

  // Insert Patients
  const patientsToInsert = [
    { name: 'Alexander Vance', age: 58, cancer: 'Lung Cancer', stage: 'Stage III' },
    { name: 'Elena Rostova', age: 42, cancer: 'Breast Cancer', stage: 'Stage II' },
    { name: 'Marcus Chen', age: 67, cancer: 'Colorectal Cancer', stage: 'Stage IV' },
    { name: 'Sarah Jenkins', age: 31, cancer: 'Leukemia', stage: 'Stage I' }
  ];

  const addedPatients = [];
  for (const p of patientsToInsert) {
    const res = db.prepare('INSERT INTO patients (patientName, age, cancerType, stage) VALUES (?, ?, ?, ?)').run([
      p.name, p.age, p.cancer, p.stage
    ]);
    addedPatients.push({ id: res.lastInsertId, ...p });
  }

  // Insert Analytics for each patient
  const patientAnalytics = [
    { pId: addedPatients[0].id, energy: 65, hydration: 78, recovery: 70, risk: 'Medium' }, // Alexander Vance
    { pId: addedPatients[1].id, energy: 85, hydration: 92, recovery: 88, risk: 'Low' },    // Elena Rostova
    { pId: addedPatients[2].id, energy: 40, hydration: 55, recovery: 48, risk: 'High' },   // Marcus Chen
    { pId: addedPatients[3].id, energy: 75, hydration: 80, recovery: 82, risk: 'Low' }     // Sarah Jenkins
  ];

  for (const a of patientAnalytics) {
    db.prepare('INSERT OR REPLACE INTO analytics (patientId, energy, hydration, recovery, risk) VALUES (?, ?, ?, ?, ?)').run([
      a.pId, a.energy, a.hydration, a.recovery, a.risk
    ]);
  }

  // Insert AI Predictions for each patient
  const patientPredictions = [
    { pId: addedPatients[0].id, fatigueRisk: 'Medium', recoveryForecast: 74, deficiencyRisk: 'Mild', energyTrend: 'stable', hydrationTrend: 'improving' },
    { pId: addedPatients[1].id, fatigueRisk: 'Low', recoveryForecast: 91, deficiencyRisk: 'None', energyTrend: 'improving', hydrationTrend: 'stable' },
    { pId: addedPatients[2].id, fatigueRisk: 'High', recoveryForecast: 52, deficiencyRisk: 'Severe', energyTrend: 'declining', hydrationTrend: 'declining' },
    { pId: addedPatients[3].id, fatigueRisk: 'Low', recoveryForecast: 85, deficiencyRisk: 'None', energyTrend: 'improving', hydrationTrend: 'improving' }
  ];

  for (const p of patientPredictions) {
    db.prepare('INSERT OR REPLACE INTO predictions (patientId, fatigueRisk, recoveryForecast, deficiencyRisk, energyTrend, hydrationTrend) VALUES (?, ?, ?, ?, ?, ?)').run([
      p.pId, p.fatigueRisk, p.recoveryForecast, p.deficiencyRisk, p.energyTrend, p.hydrationTrend
    ]);
  }

  // Insert standard meal logs & water logs to show dynamic compliance charts
  const mealTypes = [
    { type: 'early_morning', name: 'Warm Ginger Tea & Almonds', score: 95 },
    { type: 'breakfast', name: 'High-Protein Oatmeal with Berries', score: 90 },
    { type: 'snacks', name: 'Avocado & Chia Seed Pudding', score: 85 },
    { type: 'lunch', name: 'Steamed Salmon with Quinoa and Broccolini', score: 95 },
    { type: 'evening_drink', name: 'Fortified Whey Protein Shake', score: 90 },
    { type: 'dinner', name: 'Light Turkey Broth with Spinach', score: 80 }
  ];

  for (const patient of addedPatients) {
    // Generate logs for last 3 days
    for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
      for (const meal of mealTypes) {
        // High risk patient (Marcus) misses some meals, low risk patient completes all
        let completed = 1;
        if (patient.id === addedPatients[2].id && (meal.type === 'breakfast' || meal.type === 'dinner') && dayOffset === 0) {
          completed = 0; // Missed
        }
        if (patient.id === addedPatients[0].id && meal.type === 'evening_drink' && dayOffset === 1) {
          completed = 0; // Missed
        }

        db.prepare('INSERT INTO meal_logs (patientId, mealType, mealName, completed, nutritionScore) VALUES (?, ?, ?, ?, ?)').run([
          patient.id, meal.type, meal.name, completed, meal.score
        ]);
      }

      // Add water intake logs
      const waterIntake = patient.id === addedPatients[2].id ? 1200 : 2500;
      db.prepare('INSERT INTO water_logs (patientId, intake) VALUES (?, ?)').run([
        patient.id, waterIntake + (dayOffset * 100)
      ]);
    }
  }

  console.log('[PONIS DB] Seeding completed successfully!');
}

module.exports = runSeed;
