const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, predictionController.getPatientPredictions);
router.post('/recalculate', authMiddleware, predictionController.recalculatePredictions);
router.post('/scan-food', authMiddleware, predictionController.scanFoodImage);
router.post('/scan-face', authMiddleware, predictionController.scanFaceAnalysis);

module.exports = router;
