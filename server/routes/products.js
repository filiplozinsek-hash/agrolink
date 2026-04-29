const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/database');
const { verifyToken, requireFarmer } = require('../middleware/auth');

const router = express.Router();

const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images allowed'));
    }
  }
});

router.get('/', (req, res) => {
  const { category, minPrice, maxPrice, search, farmId, sort, page = 1, limit = 12, inStock } = req.query;

  let where = 'WHERE 1=1';
  const params = [];

  if (category && category !== 'all') { where += ' AND p.category = ?'; params.push(category); }
  if (minPrice) { where += ' AND p.price >= ?'; params.push(parseFloat(minPrice)); }
  if (maxPrice) { where += ' AND p.price <= ?'; params.push(parseFloat(maxPrice)); }
  if (search) { where += ' AND (p.name LIKE ? OR p.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (farmId) { where += ' AND p.farm_id = ?'; params.push(parseInt(farmId)); }
  if (inStock === 'true') { where += ' AND p.stock > 0'; }

  const orderBy = {
    'price-asc': 'ORDER BY p.price ASC',
    'price-desc': 'ORDER BY p.price DESC',
    'popular': 'ORDER BY p.created_at DESC',
    'newest': 'ORDER BY p.created_at DESC'
  }[sort] || 'ORDER BY p.created_at DESC';

  const baseQuery = `FROM products p JOIN farms f ON p.farm_id = f.id JOIN users u ON f.user_id = u.id ${where}`;
  const total = db.prepare(`SELECT COUNT(*) as total ${baseQuery}`).get(...params).total;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const products = db.prepare(
    `SELECT p.*, f.farm_name, f.location as farm_location, u.name as farmer_name ${baseQuery} ${orderBy} LIMIT ? OFFSET ?`
  ).all(...params, parseInt(limit), offset);

  res.json({ products, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
});

router.get('/:id', (req, res) => {
  const product = db.prepare(`
    SELECT p.*, f.farm_name, f.location as farm_location, f.bio as farm_bio,
           f.id as farm_id, f.founded_year, u.name as farmer_name
    FROM products p
    JOIN farms f ON p.farm_id = f.id
    JOIN users u ON f.user_id = u.id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!product) return res.status(404).json({ error: 'Product not found' });

  const related = db.prepare(`
    SELECT p.*, f.farm_name FROM products p JOIN farms f ON p.farm_id = f.id
    WHERE p.farm_id = ? AND p.id != ? ORDER BY p.created_at DESC LIMIT 4
  `).all(product.farm_id, product.id);

  res.json({ product, related });
});

router.post('/', requireFarmer, upload.single('image'), (req, res) => {
  const { name, description, category, price, unit, stock } = req.body;
  if (!name || !category || !price || !unit) {
    return res.status(400).json({ error: 'Name, category, price, and unit are required' });
  }

  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  const result = db.prepare(
    'INSERT INTO products (farm_id, name, description, category, price, unit, stock, image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(req.user.farmId, name, description || null, category, parseFloat(price), unit, parseInt(stock) || 0, imagePath);

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(product);
});

router.put('/:id', requireFarmer, upload.single('image'), (req, res) => {
  const product = db.prepare('SELECT p.*, f.user_id FROM products p JOIN farms f ON p.farm_id = f.id WHERE p.id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (product.user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

  const { name, description, category, price, unit, stock } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : product.image_path;

  db.prepare(
    'UPDATE products SET name=?, description=?, category=?, price=?, unit=?, stock=?, image_path=? WHERE id=?'
  ).run(
    name || product.name,
    description !== undefined ? description : product.description,
    category || product.category,
    price ? parseFloat(price) : product.price,
    unit || product.unit,
    stock !== undefined ? parseInt(stock) : product.stock,
    imagePath,
    req.params.id
  );

  res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id));
});

router.delete('/:id', requireFarmer, (req, res) => {
  const product = db.prepare('SELECT p.*, f.user_id FROM products p JOIN farms f ON p.farm_id = f.id WHERE p.id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (product.user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
