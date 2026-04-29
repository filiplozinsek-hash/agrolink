const express = require('express');
const db = require('../db/database');
const { requireFarmer } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const farms = db.prepare(`
    SELECT f.*, u.name as farmer_name,
           COUNT(p.id) as product_count
    FROM farms f
    JOIN users u ON f.user_id = u.id
    LEFT JOIN products p ON f.id = p.farm_id
    GROUP BY f.id
    ORDER BY f.created_at DESC
  `).all();
  res.json(farms);
});

router.get('/:id', (req, res) => {
  const farm = db.prepare(`
    SELECT f.*, u.name as farmer_name, u.email as farmer_email
    FROM farms f JOIN users u ON f.user_id = u.id WHERE f.id = ?
  `).get(req.params.id);
  if (!farm) return res.status(404).json({ error: 'Farm not found' });

  const products = db.prepare('SELECT * FROM products WHERE farm_id = ? ORDER BY created_at DESC').all(farm.id);
  const stats = {
    totalProducts: products.length,
    inStock: products.filter(p => p.stock > 0).length
  };
  res.json({ farm, products, stats });
});

router.put('/:id', requireFarmer, (req, res) => {
  const farm = db.prepare('SELECT * FROM farms WHERE id = ?').get(req.params.id);
  if (!farm) return res.status(404).json({ error: 'Farm not found' });
  if (farm.user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

  const { farmName, location, bio, foundedYear } = req.body;
  db.prepare('UPDATE farms SET farm_name=?, location=?, bio=?, founded_year=? WHERE id=?').run(
    farmName || farm.farm_name,
    location || farm.location,
    bio !== undefined ? bio : farm.bio,
    foundedYear ? parseInt(foundedYear) : farm.founded_year,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM farms WHERE id = ?').get(req.params.id));
});

module.exports = router;
