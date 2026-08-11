const db = require('../db');
let stripe;
try { stripe = require('stripe')(process.env.STRIPE_SECRET); } catch (e) { stripe = null; }

async function createPaymentIntent(req, res) {
  try {
    const { items, shipping } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'No items' });

    // calculate total
    let total = 0;
    for (const it of items) {
      const price = parseFloat(it.price || 0);
      const qty = parseInt(it.quantity || 1, 10);
      total += price * qty;
    }

    if (!stripe) return res.status(500).json({ error: 'Stripe not configured on server' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: process.env.STRIPE_CURRENCY || 'usd',
      metadata: { integration_check: 'accept_a_payment' }
    });

    res.json({ clientSecret: paymentIntent.client_secret, total });
  } catch (err) {
    console.error('createPaymentIntent error', err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function createOrder(req, res) {
  try {
    const userId = req.user ? req.user.id : null;
    const { items, shipping, payment_method } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'No items' });

    let total = 0;
    for (const it of items) {
      total += (parseFloat(it.price || 0) * parseInt(it.quantity || 1, 10));
    }

    const orderNumber = `ORD-${Date.now()}`;
    const q = `INSERT INTO orders (order_number, user_id, total_price, status, payment_method, shipping_address) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`;
    const { rows } = await db.query(q, [orderNumber, userId, total, payment_method || 'pending', payment_method || 'cod', JSON.stringify(shipping || {})]);
    const orderId = rows[0].id;

    for (const it of items) {
      const price = parseFloat(it.price || 0);
      const qty = parseInt(it.quantity || 1, 10);
      await db.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1,$2,$3,$4)', [orderId, it.productId || it.product_id || null, qty, price]);
    }

    // optionally clear cart for authenticated users
    if (userId) {
      await db.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    }

    res.json({ orderNumber, orderId, total });
  } catch (err) {
    console.error('createOrder error', err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { createPaymentIntent, createOrder };
