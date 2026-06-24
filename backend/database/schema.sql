-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'patient'
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  "patientName" TEXT NOT NULL,
  age INTEGER NOT NULL,
  "cancerType" TEXT NOT NULL,
  stage TEXT NOT NULL
);

-- Create meal_logs table
CREATE TABLE IF NOT EXISTS meal_logs (
  id SERIAL PRIMARY KEY,
  "patientId" INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  "mealType" TEXT NOT NULL,
  "mealName" TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  "nutritionScore" INTEGER NOT NULL,
  "loggedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create water_logs table
CREATE TABLE IF NOT EXISTS water_logs (
  id SERIAL PRIMARY KEY,
  "patientId" INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  intake INTEGER NOT NULL,
  "loggedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id SERIAL PRIMARY KEY,
  "patientId" INTEGER UNIQUE NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  energy INTEGER NOT NULL,
  hydration INTEGER NOT NULL,
  recovery INTEGER NOT NULL,
  risk TEXT NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id SERIAL PRIMARY KEY,
  "patientId" INTEGER UNIQUE NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  "fatigueRisk" TEXT NOT NULL,
  "recoveryForecast" INTEGER NOT NULL,
  "deficiencyRisk" TEXT NOT NULL,
  "energyTrend" TEXT NOT NULL DEFAULT 'stable',
  "hydrationTrend" TEXT NOT NULL DEFAULT 'stable'
);
