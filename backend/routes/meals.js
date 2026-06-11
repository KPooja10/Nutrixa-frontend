const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, mealController.getPatientMeals);
router.post('/', authMiddleware, mealController.logMeal);
router.patch('/:mealId/toggle', authMiddleware, mealController.toggleMealCompletion);
router.get('/water', authMiddleware, mealController.getWaterLogs);
router.post('/water', authMiddleware, mealController.logWaterIntake);

module.exports = router;
