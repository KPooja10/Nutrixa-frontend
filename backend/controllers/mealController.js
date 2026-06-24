const db = require('../database/connection');
const aiService = require('../services/aiService');

exports.getPatientMeals = async (req, res) => {
  const { patientId } = req.query;

  if (!patientId) {
    return res.status(400).json({ error: 'Patient ID is required.' });
  }

  try {
    const { rows } = await db.query(
      'SELECT * FROM meal_logs WHERE "patientId" = $1 ORDER BY id DESC',
      [patientId]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Fetch Meals Error:', error);
    res.status(500).json({ error: 'Server error retrieving meal tracking history.' });
  }
};

exports.logMeal = async (req, res) => {
  const { patientId, mealType, mealName, completed, nutritionScore } = req.body;

  if (!patientId || !mealType || !mealName || nutritionScore === undefined) {
    return res.status(400).json({ error: 'Missing meal logging parameters.' });
  }

  try {
    await db.query(
      `INSERT INTO meal_logs ("patientId", "mealType", "mealName", completed, "nutritionScore")
       VALUES ($1, $2, $3, $4, $5)`,
      [patientId, mealType, mealName, completed ? true : false, nutritionScore]
    );

    // Dynamic AI prognosis update
    await aiService.calculatePatientPredictions(patientId);

    res.status(201).json({ success: true, message: 'Meal entry successfully logged.' });
  } catch (error) {
    console.error('Log Meal Error:', error);
    res.status(500).json({ error: 'Server error saving meal log entry.' });
  }
};

exports.toggleMealCompletion = async (req, res) => {
  const { mealId } = req.params;
  const { completed } = req.body;

  if (completed === undefined) {
    return res.status(400).json({ error: 'Completion status required.' });
  }

  try {
    // Fetch meal details to get patientId
    const { rows } = await db.query(
      'SELECT * FROM meal_logs WHERE id = $1',
      [parseInt(mealId)]
    );
    const meal = rows[0];

    if (!meal) {
      return res.status(404).json({ error: 'Meal log record not found.' });
    }

    const patientId = meal.patientId;

    // Perform UPDATE
    await db.query(
      'UPDATE meal_logs SET completed = $1 WHERE id = $2',
      [completed ? true : false, mealId]
    );

    // Recalculate predictive indexes
    await aiService.calculatePatientPredictions(patientId);

    res.status(200).json({
      success: true,
      message: `Meal status updated to ${completed ? 'Completed' : 'Skipped'}.`
    });
  } catch (error) {
    console.error('Toggle Meal Error:', error);
    res.status(500).json({ error: 'Server error updating meal compliance state.' });
  }
};

exports.getWaterLogs = async (req, res) => {
  const { patientId } = req.query;

  if (!patientId) {
    return res.status(400).json({ error: 'Patient ID is required.' });
  }

  try {
    const { rows } = await db.query(
      'SELECT * FROM water_logs WHERE "patientId" = $1 ORDER BY id DESC',
      [patientId]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Fetch Water Logs Error:', error);
    res.status(500).json({ error: 'Server error retrieving water ingestion history.' });
  }
};

exports.logWaterIntake = async (req, res) => {
  const { patientId, intake } = req.body;

  if (!patientId || !intake) {
    return res.status(400).json({ error: 'Missing water logging parameters.' });
  }

  try {
    await db.query(
      'INSERT INTO water_logs ("patientId", intake) VALUES ($1, $2)',
      [patientId, parseInt(intake)]
    );

    // Recalculate predictive indices based on hydration updates
    await aiService.calculatePatientPredictions(patientId);

    res.status(201).json({ success: true, message: 'Water ingestion volume logged successfully.' });
  } catch (error) {
    console.error('Log Water Error:', error);
    res.status(500).json({ error: 'Server error logging water intake.' });
  }
};
