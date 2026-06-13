const db = require('./database/connection');
const user = db.prepare('SELECT * FROM users WHERE username = ?').get('doctor');
console.log('User found:', user);
