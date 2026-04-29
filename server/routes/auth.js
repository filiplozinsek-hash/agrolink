const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/register', (req, res) => {
  const { email, password, name, role, farmName, location, bio, foundedYear, deliveryAddress } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Email, password, name, and role are required' });
  }
  if (!['farmer', 'consumer'].includes(role)) {
    return res.status(400).json({ error: 'Role must be farmer or consumer' });
  }
  if (role === 'farmer' && (!farmName || !location)) {
    return res.status(400).json({ error: 'Farm name and location are required for farmers' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(400).json({ error: 'This email is already registered' });

  const passwordHash = bcrypt.hashSync(password, 10);

  let userId, farmId = null;
  db.exec('BEGIN');
  try {
    const r = db.prepare(
      'INSERT INTO users (email, password_hash, name, role, delivery_address) VALUES (?, ?, ?, ?, ?)'
    ).run(email, passwordHash, name, role, deliveryAddress ? JSON.stringify(deliveryAddress) : null);
    userId = r.lastInsertRowid;

    if (role === 'farmer') {
      const fr = db.prepare(
        'INSERT INTO farms (user_id, farm_name, location, bio, founded_year) VALUES (?, ?, ?, ?, ?)'
      ).run(userId, farmName, location, bio || null, foundedYear ? parseInt(foundedYear) : null);
      farmId = fr.lastInsertRowid;
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    console.error(err);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }

  const token = jwt.sign({ id: userId, email, name, role, farmId }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id: userId, email, name, role, farmId } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  let farmId = null;
  if (user.role === 'farmer') {
    const farm = db.prepare('SELECT id FROM farms WHERE user_id = ?').get(user.id);
    farmId = farm ? farm.id : null;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role, farmId },
    JWT_SECRET, { expiresIn: '7d' }
  );
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, farmId } });
});

router.get('/me', verifyToken, (req, res) => {
  const user = db.prepare('SELECT id, email, name, role, delivery_address, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let farm = null;
  if (user.role === 'farmer') {
    farm = db.prepare('SELECT * FROM farms WHERE user_id = ?').get(user.id);
  }
  if (user.delivery_address) {
    try { user.delivery_address = JSON.parse(user.delivery_address); } catch {}
  }
  res.json({ ...user, farm });
});

router.put('/me', verifyToken, (req, res) => {
  const { name, deliveryAddress } = req.body;
  db.prepare('UPDATE users SET name = ?, delivery_address = ? WHERE id = ?')
    .run(name || req.user.name, deliveryAddress ? JSON.stringify(deliveryAddress) : null, req.user.id);
  const updated = db.prepare('SELECT id, email, name, role, delivery_address FROM users WHERE id = ?').get(req.user.id);
  if (updated.delivery_address) {
    try { updated.delivery_address = JSON.parse(updated.delivery_address); } catch {}
  }
  res.json(updated);
});

module.exports = router;
