const express = require('express');
const db = require('../db/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.post('/', verifyToken, (req, res) => {
  const { deliveryAddress, stripePaymentId, items } = req.body;
  if (!deliveryAddress || !items || !items.length) {
    return res.status(400).json({ error: 'Delivery address and items are required' });
  }

  let orderId;
  db.exec('BEGIN');
  try {
    let total = 0;
    const enriched = items.map(item => {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
      total += product.price * item.quantity;
      return { ...item, price: product.price };
    });

    const order = db.prepare(
      'INSERT INTO orders (consumer_id, total_amount, delivery_address, stripe_payment_id) VALUES (?, ?, ?, ?)'
    ).run(req.user.id, total, JSON.stringify(deliveryAddress), stripePaymentId || null);
    orderId = order.lastInsertRowid;

    for (const item of enriched) {
      db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)').run(
        orderId, item.productId, item.quantity, item.price
      );
      db.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?').run(item.quantity, item.productId);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    console.error(err);
    return res.status(400).json({ error: err.message || 'Order creation failed' });
  }

  const order = db.prepare(`
    SELECT o.*, u.name as consumer_name,
           json_group_array(json_object(
             'id', oi.id, 'product_id', oi.product_id,
             'product_name', p.name, 'quantity', oi.quantity,
             'price_at_purchase', oi.price_at_purchase,
             'farm_name', f.farm_name, 'image_path', p.image_path
           )) as items
    FROM orders o
    JOIN users u ON o.consumer_id = u.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    JOIN farms f ON p.farm_id = f.id
    WHERE o.id = ?
    GROUP BY o.id
  `).get(orderId);

  try { order.items = JSON.parse(order.items); } catch {}
  try { order.delivery_address = JSON.parse(order.delivery_address); } catch {}
  res.status(201).json(order);
});

router.get('/', verifyToken, (req, res) => {
  let orders;

  if (req.user.role === 'consumer') {
    orders = db.prepare(`
      SELECT o.*,
             json_group_array(json_object(
               'product_name', p.name, 'quantity', oi.quantity,
               'price_at_purchase', oi.price_at_purchase,
               'farm_name', f.farm_name, 'image_path', p.image_path
             )) as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      JOIN farms f ON p.farm_id = f.id
      WHERE o.consumer_id = ?
      GROUP BY o.id ORDER BY o.created_at DESC
    `).all(req.user.id);
  } else {
    orders = db.prepare(`
      SELECT DISTINCT o.id, o.total_amount, o.status, o.created_at, o.delivery_address,
             u.name as consumer_name, u.email as consumer_email,
             json_group_array(json_object(
               'product_name', p.name, 'quantity', oi.quantity,
               'price_at_purchase', oi.price_at_purchase
             )) as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      JOIN farms f ON p.farm_id = f.id
      JOIN users u ON o.consumer_id = u.id
      WHERE f.user_id = ?
      GROUP BY o.id ORDER BY o.created_at DESC
    `).all(req.user.id);
  }

  orders = orders.map(o => {
    try { o.items = JSON.parse(o.items); } catch {}
    try { o.delivery_address = JSON.parse(o.delivery_address); } catch {}
    return o;
  });
  res.json(orders);
});

router.put('/:id/status', verifyToken, (req, res) => {
  if (req.user.role !== 'farmer') return res.status(403).json({ error: 'Farmers only' });

  const { status } = req.body;
  const valid = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const owns = db.prepare(`
    SELECT 1 FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN farms f ON p.farm_id = f.id
    WHERE oi.order_id = ? AND f.user_id = ? LIMIT 1
  `).get(req.params.id, req.user.id);
  if (!owns) return res.status(403).json({ error: 'Not authorized' });

  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true, status });
});

module.exports = router;
