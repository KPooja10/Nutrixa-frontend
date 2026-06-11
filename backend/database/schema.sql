-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'patient'
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patientName TEXT NOT NULL,
  age INTEGER NOT NULL,
  cancerType TEXT NOT NULL,
  stage TEXT NOT NULL
);

-- Create meal_logs table
CREATE TABLE IF NOT EXISTS meal_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patientId INTEGER NOT NULL,
  mealType TEXT NOT NULL,
  mealName TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  nutritionScore INTEGER NOT NULL,
  loggedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
);

-- Create water_logs table
CREATE TABLE IF NOT EXISTS water_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patientId INTEGER NOT NULL,
  intake INTEGER NOT NULL,
  loggedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patientId INTEGER UNIQUE NOT NULL,
  energy INTEGER NOT NULL,
  hydration INTEGER NOT NULL,
  recovery INTEGER NOT NULL,
  risk TEXT NOT NULL,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
);

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patientId INTEGER UNIQUE NOT NULL,
  fatigueRisk TEXT NOT NULL,
  recoveryForecast INTEGER NOT NULL,
  deficiencyRisk TEXT NOT NULL,
  energyTrend TEXT NOT NULL DEFAULT 'stable',
  hydrationTrend TEXT NOT NULL DEFAULT 'stable',
  FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
);
