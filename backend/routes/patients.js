const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, patientController.getAllPatients);
router.get('/:id', authMiddleware, patientController.getPatientById);
router.post('/', authMiddleware, patientController.createPatient);

module.exports = router;
