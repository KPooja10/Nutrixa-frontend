const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ponis_clinical_secret_key_2026_xyz';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Access Denied: Missing authorization headers.' });
  }

  const token = authHeader.split(' ')[1]; // Extract from Bearer <token>
  if (!token) {
    return res.status(401).json({ error: 'Access Denied: Bearer token format invalid.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Contains id, username, role
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Session Expired or Invalid Signature.' });
  }
}

module.exports = authMiddleware;
