const db = require('../database/connection');
const aiService = require('../services/aiService');

exports.getPatientMeals = (req, res) => {
  const { patientId } = req.query;

  if (!patientId) {
    return res.status(400).json({ error: 'Patient ID is required.' });
  }

  try {
    const meals = db.prepare('SELECT * FROM meal_logs WHERE patientId = ? ORDER BY id DESC').all(patientId);
    res.status(200).json(meals);
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
    db.prepare(`
      INSERT INTO meal_logs (patientId, mealType, mealName, completed, nutritionScore)
      VALUES (?, ?, ?, ?, ?)
    `).run([patientId, mealType, mealName, completed ? 1 : 0, nutritionScore]);

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
    // 1. Fetch meal details first to get patientId
    // Standard SELECT to extract fields
    const query = 'SELECT * FROM meal_logs WHERE id = ' + parseInt(mealId);
    // Let's use simple statement to get details
    let meal = db.prepare('SELECT * FROM meal_logs').all().find(m => m.id === parseInt(mealId));

    if (!meal) {
      return res.status(404).json({ error: 'Meal log record not found.' });
    }

    const patientId = meal.patientId;

    // 2. Perform UPDATE
    db.prepare('UPDATE meal_logs SET completed = ? WHERE id = ?').run([completed ? 1 : 0, mealId]);

    // 3. Recalculate predictive indexes
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

exports.getWaterLogs = (req, res) => {
  const { patientId } = req.query;

  if (!patientId) {
    return res.status(400).json({ error: 'Patient ID is required.' });
  }

  try {
    const water = db.prepare('SELECT * FROM water_logs WHERE patientId = ? ORDER BY id DESC').all(patientId);
    res.status(200).json(water);
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
    db.prepare('INSERT INTO water_logs (patientId, intake) VALUES (?, ?)').run([patientId, parseInt(intake)]);

    // Recalculate predictive indices based on hydration updates
    await aiService.calculatePatientPredictions(patientId);

    res.status(201).json({ success: true, message: 'Water ingestion volume logged successfully.' });
  } catch (error) {
    console.error('Log Water Error:', error);
    res.status(500).json({ error: 'Server error logging water intake.' });
  }
};
