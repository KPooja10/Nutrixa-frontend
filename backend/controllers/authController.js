const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'ponis_clinical_secret_key_2026_xyz';

exports.register = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password credentials are required.' });
  }

  try {
    const { rows: existing } = await db.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username already registered in database.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const assignedRole = role || 'patient';

    const { rows } = await db.query(
      'INSERT INTO users (username, "passwordHash", role) VALUES ($1, $2, $3) RETURNING id',
      [username, passwordHash, assignedRole]
    );

    res.status(201).json({
      success: true,
      message: 'Account successfully registered.',
      userId: rows[0].id
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Server error encountered during registration.' });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password credentials are required.' });
  }

  try {
    const { rows } = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid username credentials.' });
    }

    const validPassword = bcrypt.compareSync(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid password credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error encountered during authentication.' });
  }
};
