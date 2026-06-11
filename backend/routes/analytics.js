const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, analyticsController.getPatientAnalytics);
router.get('/hospital-summary', authMiddleware, analyticsController.getHospitalSummary);

module.exports = router;
