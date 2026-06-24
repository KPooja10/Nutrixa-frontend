require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const runSeed = require('./database/seed');

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const mealRoutes = require('./routes/meals');
const analyticsRoutes = require('./routes/analytics');
const predictionRoutes = require('./routes/predictions');

const app = express();
const PORT = process.env.PORT || 5000;

// Apply Middlewares
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, adb or curl)
    if (!origin) return callback(null, true);
    // Allow localhost, local IPs, and the github pages domain
    if (origin.startsWith('http://localhost') || 
        origin.startsWith('http://127.0.0.1') || 
        origin.startsWith('http://172.') || 
        origin.startsWith('http://192.') || 
        origin.startsWith('http://10.') || 
        origin === 'https://kpooja10.github.io') {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define API Endpoints
app.use('/auth', authRoutes);
app.use('/patients', patientRoutes);
app.use('/meals', mealRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/predictions', predictionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Predictive Oncology Nutrition Intelligence System REST API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]:', err);
  res.status(500).json({ error: 'An unexpected internal error has occurred.' });
});

// Start Express Listener and seed database
(async () => {
  try {
    await runSeed();
  } catch (error) {
    console.error('[PONIS DB] Critical error seeding tables:', error);
  }

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 PONIS REST API server successfully booted and online`);
    console.log(`   Local Address: http://localhost:${PORT}`);
    console.log(`   Health Check:  http://localhost:${PORT}/health`);
    console.log(`=======================================================`);
  });
})();
