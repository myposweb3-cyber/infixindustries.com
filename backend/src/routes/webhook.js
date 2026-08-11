const stripe = require('stripe')(process.env.STRIPE_SECRET);
const db = require('../db');

async function handler(req, res) {
  try {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('Stripe webhook received:', event.type);

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      const orderId = pi.metadata?.order_id;
      if (orderId) {
        await db.query('UPDATE orders SET status=$1 WHERE id=$2', ['paid', orderId]);
        console.log(`Order ${orderId} marked as paid`);
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error', err);
    res.status(500).end();
  }
}

module.exports = { handler };
