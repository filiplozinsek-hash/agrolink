const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'agrolink-secret-key-change-in-production';

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireFarmer(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ error: 'Farmers only' });
    }
    next();
  });
}

module.exports = { verifyToken, requireFarmer, JWT_SECRET };
