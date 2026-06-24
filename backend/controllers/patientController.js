const db = require('../database/connection');

exports.getAllPatients = async (req, res) => {
  try {
    const { rows: patients } = await db.query('SELECT * FROM patients');
    const { rows: analytics } = await db.query('SELECT * FROM analytics');

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

exports.getPatientById = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows: patientRows } = await db.query(
      'SELECT * FROM patients WHERE id = $1',
      [id]
    );
    if (patientRows.length === 0) {
      return res.status(404).json({ error: 'Clinical patient record not found.' });
    }
    const patient = patientRows[0];

    const { rows: analyticsRows } = await db.query(
      'SELECT * FROM analytics WHERE "patientId" = $1',
      [id]
    );
    const analytics = analyticsRows[0] || {
      energy: 75,
      hydration: 75,
      recovery: 75,
      risk: 'Low'
    };

    const { rows: predictionRows } = await db.query(
      'SELECT * FROM predictions WHERE "patientId" = $1',
      [id]
    );
    const predictions = predictionRows[0] || {
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

exports.createPatient = async (req, res) => {
  const { patientName, age, cancerType, stage } = req.body;

  if (!patientName || !age || !cancerType || !stage) {
    return res.status(400).json({ error: 'Missing clinical demographics parameters.' });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO patients ("patientName", age, "cancerType", stage)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [patientName, parseInt(age), cancerType, stage]
    );
    const patientId = rows[0].id;

    // Immediately initialize standard patient analytics
    await db.query(
      `INSERT INTO analytics ("patientId", energy, hydration, recovery, risk)
       VALUES ($1, 75, 80, 78, 'Low')
       ON CONFLICT ("patientId") DO UPDATE
         SET energy = EXCLUDED.energy,
             hydration = EXCLUDED.hydration,
             recovery = EXCLUDED.recovery,
             risk = EXCLUDED.risk`,
      [patientId]
    );

    // Immediately initialize standard patient predictions
    await db.query(
      `INSERT INTO predictions ("patientId", "fatigueRisk", "recoveryForecast", "deficiencyRisk", "energyTrend", "hydrationTrend")
       VALUES ($1, 'Low', 80, 'None', 'stable', 'stable')
       ON CONFLICT ("patientId") DO UPDATE
         SET "fatigueRisk" = EXCLUDED."fatigueRisk",
             "recoveryForecast" = EXCLUDED."recoveryForecast",
             "deficiencyRisk" = EXCLUDED."deficiencyRisk",
             "energyTrend" = EXCLUDED."energyTrend",
             "hydrationTrend" = EXCLUDED."hydrationTrend"`,
      [patientId]
    );

    // Pre-populate standard meal templates
    const mealTemplates = [
      { type: 'early_morning', name: 'Warm Ginger Tea & Almonds', score: 95 },
      { type: 'breakfast', name: 'High-Protein Oatmeal with Berries', score: 90 },
      { type: 'snacks', name: 'Avocado & Chia Seed Pudding', score: 85 },
      { type: 'lunch', name: 'Steamed Salmon with Quinoa and Broccolini', score: 95 },
      { type: 'evening_drink', name: 'Fortified Whey Protein Shake', score: 90 },
      { type: 'dinner', name: 'Light Turkey Broth with Spinach', score: 80 }
    ];

    for (const meal of mealTemplates) {
      await db.query(
        `INSERT INTO meal_logs ("patientId", "mealType", "mealName", completed, "nutritionScore")
         VALUES ($1, $2, $3, FALSE, $4)`,
        [patientId, meal.type, meal.name, meal.score]
      );
    }

    // Initialize an initial water entry
    await db.query(
      'INSERT INTO water_logs ("patientId", intake) VALUES ($1, 0)',
      [patientId]
    );

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
