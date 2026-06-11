const db = require('../database/connection');
const aiService = require('../services/aiService');

exports.getPatientPredictions = (req, res) => {
  const { patientId } = req.query;

  if (!patientId) {
    return res.status(400).json({ error: 'Patient ID is required.' });
  }

  try {
    const prediction = db.prepare('SELECT * FROM predictions WHERE patientId = ?').get(patientId);
    
    // Provide default safe profile if not yet created in table
    res.status(200).json(prediction || {
      patientId: parseInt(patientId),
      fatigueRisk: 'Low',
      recoveryForecast: 80,
      deficiencyRisk: 'None',
      energyTrend: 'stable',
      hydrationTrend: 'stable'
    });
  } catch (error) {
    console.error('Fetch Predictions Error:', error);
    res.status(500).json({ error: 'Server error retrieving clinical prognostic calculations.' });
  }
};

exports.recalculatePredictions = async (req, res) => {
  const { patientId } = req.body;

  if (!patientId) {
    return res.status(400).json({ error: 'Patient ID is required.' });
  }

  try {
    const updatedPredictions = await aiService.calculatePatientPredictions(patientId);
    res.status(200).json({
      success: true,
      message: 'Clinical prognostic calculations updated successfully.',
      predictions: updatedPredictions
    });
  } catch (error) {
    console.error('Recalculate Predictions Error:', error);
    res.status(500).json({ error: 'Server error recalculating clinical prognostic parameters.' });
  }
};

exports.scanFoodImage = async (req, res) => {
  try {
    // Execute simulated computer vision food scan
    const foodReport = await aiService.classifyFoodImage();
    res.status(200).json(foodReport);
  } catch (error) {
    console.error('AI Food Scanner Error:', error);
    res.status(500).json({ error: 'AI computer vision scanner encountered a processing failure.' });
  }
};

exports.scanFaceAnalysis = async (req, res) => {
  try {
    // Execute simulated face mesh biometrics analysis
    const biometricReport = await aiService.analyzeFaceBiometrics();
    res.status(200).json(biometricReport);
  } catch (error) {
    console.error('AI Face Scanner Error:', error);
    res.status(500).json({ error: 'AI biometric face analysis scanner encountered a processing failure.' });
  }
};
