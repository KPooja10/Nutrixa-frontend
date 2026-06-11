const db = require('../database/connection');

exports.getAllPatients = (req, res) => {
  try {
    const patients = db.prepare('SELECT * FROM patients').all();
    const analytics = db.prepare('SELECT * FROM analytics').all();

    // Map analytics data to patient profiles for consolidated listings
    const patientsWithAnalytics = patients.map(p => {
      const analytic = analytics.find(a => a.patientId === p.id) || {
        energy: 80,
        hydration: 80,
        recovery: 80,
        risk: 'Low'
      };
      return {
        ...p,
        energy: analytic.energy,
        hydration: analytic.hydration,
        recovery: analytic.recovery,
        risk: analytic.risk
      };
    });

    res.status(200).json(patientsWithAnalytics);
  } catch (error) {
    console.error('Fetch Patients Error:', error);
    res.status(500).json({ error: 'Server error retrieving clinical patient listings.' });
  }
};

exports.getPatientById = (req, res) => {
  const { id } = req.params;

  try {
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
    if (!patient) {
      return res.status(404).json({ error: 'Clinical patient record not found.' });
    }

    const analytics = db.prepare('SELECT * FROM analytics WHERE patientId = ?').get(id) || {
      energy: 75,
      hydration: 75,
      recovery: 75,
      risk: 'Low'
    };

    const predictions = db.prepare('SELECT * FROM predictions WHERE patientId = ?').get(id) || {
      fatigueRisk: 'Low',
      recoveryForecast: 75,
      deficiencyRisk: 'None',
      energyTrend: 'stable',
      hydrationTrend: 'stable'
    };

    res.status(200).json({
      ...patient,
      analytics,
      predictions
    });
  } catch (error) {
    console.error('Fetch Patient Details Error:', error);
    res.status(500).json({ error: 'Server error retrieving patient profile details.' });
  }
};

exports.createPatient = (req, res) => {
  const { patientName, age, cancerType, stage } = req.body;

  if (!patientName || !age || !cancerType || !stage) {
    return res.status(400).json({ error: 'Missing clinical demographics parameters.' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO patients (patientName, age, cancerType, stage) 
      VALUES (?, ?, ?, ?)
    `).run([patientName, parseInt(age), cancerType, stage]);

    const patientId = result.lastInsertId;

    // Immediately initialize standard patient analytics
    db.prepare(`
      INSERT OR REPLACE INTO analytics (patientId, energy, hydration, recovery, risk)
      VALUES (?, 75, 80, 78, 'Low')
    `).run(patientId);

    // Immediately initialize standard patient predictions
    db.prepare(`
      INSERT OR REPLACE INTO predictions (patientId, fatigueRisk, recoveryForecast, deficiencyRisk, energyTrend, hydrationTrend)
      VALUES (?, 'Low', 80, 'None', 'stable', 'stable')
    `).run(patientId);

    // Pre-populate some standard meal templates to track completion
    const mealTemplates = [
      { type: 'early_morning', name: 'Warm Ginger Tea & Almonds', score: 95 },
      { type: 'breakfast', name: 'High-Protein Oatmeal with Berries', score: 90 },
      { type: 'snacks', name: 'Avocado & Chia Seed Pudding', score: 85 },
      { type: 'lunch', name: 'Steamed Salmon with Quinoa and Broccolini', score: 95 },
      { type: 'evening_drink', name: 'Fortified Whey Protein Shake', score: 90 },
      { type: 'dinner', name: 'Light Turkey Broth with Spinach', score: 80 }
    ];

    for (const meal of mealTemplates) {
      db.prepare(`
        INSERT INTO meal_logs (patientId, mealType, mealName, completed, nutritionScore)
        VALUES (?, ?, ?, 0, ?)
      `).run([patientId, meal.type, meal.name, meal.score]);
    }

    // Initialize an initial water entry
    db.prepare(`
      INSERT INTO water_logs (patientId, intake)
      VALUES (?, 0)
    `).run([patientId]);

    res.status(201).json({
      success: true,
      message: 'Clinical profile created successfully.',
      patientId
    });
  } catch (error) {
    console.error('Create Patient Error:', error);
    res.status(500).json({ error: 'Server error registering clinical patient profile.' });
  }
};
