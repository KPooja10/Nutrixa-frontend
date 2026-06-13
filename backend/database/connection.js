const fs = require('fs');
const path = require('path');

let dbInstance = null;
let useFallback = false;

// Path to fallback database file
const fallbackDbPath = path.join(__dirname, 'db_fallback.json');

// Helper to load/save JSON database fallback
function readFallbackDb() {
  if (!fs.existsSync(fallbackDbPath)) {
    const initialDb = {
      users: [],
      patients: [],
      meal_logs: [],
      water_logs: [],
      analytics: [],
      predictions: []
    };
    fs.writeFileSync(fallbackDbPath, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
  try {
    return JSON.parse(fs.readFileSync(fallbackDbPath, 'utf8'));
  } catch (err) {
    console.error("Error reading JSON database. Creating new database.", err);
    return { users: [], patients: [], meal_logs: [], water_logs: [], analytics: [], predictions: [] };
  }
}

function writeFallbackDb(data) {
  fs.writeFileSync(fallbackDbPath, JSON.stringify(data, null, 2));
}

// Proactively check if we can import better-sqlite3
try {
  const Database = require('better-sqlite3');
  const dbFile = path.join(__dirname, 'ponis.db');
  dbInstance = new Database(dbFile);
  console.log('[PONIS DB] Successfully connected to native SQLite database at: ' + dbFile);
} catch (error) {
  console.warn('[PONIS DB WARNING] Failed to initialize better-sqlite3 native binary.');
  console.warn('[PONIS DB WARNING] Fallback Mode Activated: Using highly resilient, pure JS JSON file database instead.');
  useFallback = true;
}

// Implement unified SQLite + JSON Database execution wrapper
const db = {
  exec: (sql) => {
    if (!useFallback) {
      dbInstance.exec(sql);
    } else {
      console.log(`[JSON DB Exec]: ${sql.substring(0, 80)}...`);
      // Initial tables setup happens via schema execution. Fallback initializes tables automatically anyway.
    }
  },

  prepare: (sql) => {
    if (!useFallback) {
      const stmt = dbInstance.prepare(sql);
      return {
        run: (...args) => {
          // Normalize if args is passed as single array
          const flatArgs = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
          const result = stmt.run(...flatArgs);
          return { lastInsertId: result.lastInsertRowid, changes: result.changes };
        },
        all: (...args) => {
          const flatArgs = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
          return stmt.all(...flatArgs);
        },
        get: (...args) => {
          const flatArgs = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
          return stmt.get(...flatArgs);
        }
      };
    } else {
      // Clean SQL queries to understand basic requests
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();
      
      return {
        run: (...args) => {
          const flatArgs = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
          const dbData = readFallbackDb();

          // Handle INSERT INTO users
          if (normalizedSql.startsWith('INSERT INTO users')) {
            const newUser = {
              id: dbData.users.length + 1,
              username: flatArgs[0],
              passwordHash: flatArgs[1],
              role: flatArgs[2] || 'patient'
            };
            dbData.users.push(newUser);
            writeFallbackDb(dbData);
            return { lastInsertId: newUser.id, changes: 1 };
          }

          // Handle INSERT INTO patients
          if (normalizedSql.startsWith('INSERT INTO patients')) {
            const newPatient = {
              id: dbData.patients.length + 1,
              patientName: flatArgs[0],
              age: parseInt(flatArgs[1]),
              cancerType: flatArgs[2],
              stage: flatArgs[3]
            };
            dbData.patients.push(newPatient);
            writeFallbackDb(dbData);
            return { lastInsertId: newPatient.id, changes: 1 };
          }

          // Handle INSERT INTO meal_logs
          if (normalizedSql.startsWith('INSERT INTO meal_logs')) {
            let patientId, mealType, mealName, completed, nutritionScore;
            if (normalizedSql.includes('0, ?') || normalizedSql.includes('0,?')) {
              patientId = parseInt(flatArgs[0]);
              mealType = flatArgs[1];
              mealName = flatArgs[2];
              completed = 0;
              nutritionScore = parseInt(flatArgs[3]);
            } else {
              patientId = parseInt(flatArgs[0]);
              mealType = flatArgs[1];
              mealName = flatArgs[2];
              completed = flatArgs[3] === 1 || flatArgs[3] === true ? 1 : 0;
              nutritionScore = parseInt(flatArgs[4]);
            }
            const newMeal = {
              id: dbData.meal_logs.length + 1,
              patientId,
              mealType,
              mealName,
              completed,
              nutritionScore,
              loggedAt: new Date().toISOString()
            };
            dbData.meal_logs.push(newMeal);
            writeFallbackDb(dbData);
            return { lastInsertId: newMeal.id, changes: 1 };
          }

          // Handle UPDATE meal_logs (completion toggle)
          if (normalizedSql.startsWith('UPDATE meal_logs SET completed')) {
            // "UPDATE meal_logs SET completed = ? WHERE id = ?"
            const completedVal = flatArgs[0] === 1 || flatArgs[0] === true ? 1 : 0;
            const mealId = parseInt(flatArgs[1]);
            let count = 0;
            dbData.meal_logs = dbData.meal_logs.map(meal => {
              if (meal.id === mealId) {
                count++;
                return { ...meal, completed: completedVal };
              }
              return meal;
            });
            writeFallbackDb(dbData);
            return { lastInsertId: null, changes: count };
          }

          // Handle INSERT INTO water_logs
          if (normalizedSql.startsWith('INSERT INTO water_logs')) {
            const newWater = {
              id: dbData.water_logs.length + 1,
              patientId: parseInt(flatArgs[0]),
              intake: parseInt(flatArgs[1]),
              loggedAt: new Date().toISOString()
            };
            dbData.water_logs.push(newWater);
            writeFallbackDb(dbData);
            return { lastInsertId: newWater.id, changes: 1 };
          }

          // Handle INSERT/UPDATE INTO analytics
          if (normalizedSql.startsWith('INSERT INTO analytics') || normalizedSql.startsWith('INSERT OR REPLACE INTO analytics')) {
            // INSERT OR REPLACE INTO analytics (patientId, energy, hydration, recovery, risk) VALUES (?, ?, ?, ?, ?)
            const patientId = parseInt(flatArgs[0]);
            const energy = parseInt(flatArgs[1]);
            const hydration = parseInt(flatArgs[2]);
            const recovery = parseInt(flatArgs[3]);
            const risk = flatArgs[4];

            let foundIdx = dbData.analytics.findIndex(a => a.patientId === patientId);
            const entry = {
              id: foundIdx >= 0 ? dbData.analytics[foundIdx].id : dbData.analytics.length + 1,
              patientId,
              energy,
              hydration,
              recovery,
              risk,
              updatedAt: new Date().toISOString()
            };

            if (foundIdx >= 0) {
              dbData.analytics[foundIdx] = entry;
            } else {
              dbData.analytics.push(entry);
            }
            writeFallbackDb(dbData);
            return { lastInsertId: entry.id, changes: 1 };
          }

          // Handle INSERT/UPDATE INTO predictions
          if (normalizedSql.startsWith('INSERT INTO predictions') || normalizedSql.startsWith('INSERT OR REPLACE INTO predictions')) {
            // (patientId, fatigueRisk, recoveryForecast, deficiencyRisk, energyTrend, hydrationTrend)
            const patientId = parseInt(flatArgs[0]);
            const fatigueRisk = flatArgs[1];
            const recoveryForecast = parseInt(flatArgs[2]);
            const deficiencyRisk = flatArgs[3];
            const energyTrend = flatArgs[4] || 'stable';
            const hydrationTrend = flatArgs[5] || 'stable';

            let foundIdx = dbData.predictions.findIndex(p => p.patientId === patientId);
            const entry = {
              id: foundIdx >= 0 ? dbData.predictions[foundIdx].id : dbData.predictions.length + 1,
              patientId,
              fatigueRisk,
              recoveryForecast,
              deficiencyRisk,
              energyTrend,
              hydrationTrend
            };

            if (foundIdx >= 0) {
              dbData.predictions[foundIdx] = entry;
            } else {
              dbData.predictions.push(entry);
            }
            writeFallbackDb(dbData);
            return { lastInsertId: entry.id, changes: 1 };
          }

          return { lastInsertId: null, changes: 0 };
        },

        all: (...args) => {
          const flatArgs = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
          const dbData = readFallbackDb();

          // SELECT * FROM patients
          if (normalizedSql.startsWith('SELECT * FROM patients')) {
            return dbData.patients;
          }

          // SELECT * FROM users
          if (normalizedSql.startsWith('SELECT * FROM users')) {
            return dbData.users;
          }

          // SELECT * FROM meal_logs
          if (normalizedSql.startsWith('SELECT * FROM meal_logs') && !normalizedSql.includes('WHERE')) {
            return dbData.meal_logs;
          }

          // SELECT * FROM meal_logs WHERE patientId = ?
          if (normalizedSql.startsWith('SELECT * FROM meal_logs WHERE patientId')) {
            const patientId = parseInt(flatArgs[0]);
            return dbData.meal_logs.filter(meal => meal.patientId === patientId);
          }

          // SELECT * FROM water_logs WHERE patientId = ?
          if (normalizedSql.startsWith('SELECT * FROM water_logs WHERE patientId')) {
            const patientId = parseInt(flatArgs[0]);
            return dbData.water_logs.filter(water => water.patientId === patientId);
          }

          // SELECT * FROM analytics
          if (normalizedSql.startsWith('SELECT * FROM analytics') && !normalizedSql.includes('WHERE')) {
            return dbData.analytics;
          }

          // SELECT * FROM analytics WHERE patientId = ?
          if (normalizedSql.startsWith('SELECT * FROM analytics WHERE patientId')) {
            const patientId = parseInt(flatArgs[0]);
            return dbData.analytics.filter(a => a.patientId === patientId);
          }

          // SELECT * FROM predictions WHERE patientId = ?
          if (normalizedSql.startsWith('SELECT * FROM predictions WHERE patientId')) {
            const patientId = parseInt(flatArgs[0]);
            return dbData.predictions.filter(p => p.patientId === patientId);
          }

          return [];
        },

        get: (...args) => {
          const flatArgs = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
          const dbData = readFallbackDb();

          // SELECT * FROM users WHERE username = ?
          if (normalizedSql.includes('FROM users WHERE username =')) {
            const username = flatArgs[0];
            return dbData.users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
          }

          // SELECT * FROM users WHERE id = ?
          if (normalizedSql.includes('FROM users WHERE id =')) {
            const id = parseInt(flatArgs[0]);
            return dbData.users.find(u => u.id === id) || null;
          }

          // SELECT * FROM patients WHERE id = ?
          if (normalizedSql.includes('FROM patients WHERE id =')) {
            const id = parseInt(flatArgs[0]);
            return dbData.patients.find(p => p.id === id) || null;
          }

          // SELECT * FROM analytics WHERE patientId = ?
          if (normalizedSql.includes('FROM analytics WHERE patientId =')) {
            const patientId = parseInt(flatArgs[0]);
            return dbData.analytics.find(a => a.patientId === patientId) || null;
          }

          // SELECT * FROM predictions WHERE patientId = ?
          if (normalizedSql.includes('FROM predictions WHERE patientId =')) {
            const patientId = parseInt(flatArgs[0]);
            return dbData.predictions.find(p => p.patientId === patientId) || null;
          }

          return null;
        }
      };
    }
  }
};

module.exports = db;
