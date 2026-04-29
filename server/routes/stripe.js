const express = require('express');
const db = require('../db/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.startsWith('sk_test_your')) return null;
  return require('stripe')(key);
}

router.post('/create-payment-intent', verifyToken, async (req, res) => {
  const { items } = req.body;
  if (!items || !items.length) {
    return res.status(400).json({ error: 'Cart items are required' });
  }

  let total = 0;
  for (const item of items) {
    const product = db.prepare('SELECT price, stock FROM products WHERE id = ?').get(item.productId);
    if (!product) return res.status(400).json({ error: `Product ${item.productId} not found` });
    total += product.price * item.quantity;
  }

  const stripe = getStripe();
  if (!stripe) {
    return res.json({
      clientSecret: null,
      amount: total,
      demoMode: true
    });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'eur',
      metadata: { userId: String(req.user.id) }
    });
    res.json({ clientSecret: paymentIntent.client_secret, amount: total, demoMode: false });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Payment setup failed. Check your Stripe keys.' });
  }
});

module.exports = router;
