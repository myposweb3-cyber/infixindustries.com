const express = require('express');
const router = express.Router();
const { createPaymentIntent, createOrder } = require('../controllers/checkoutController');
const { authenticate } = require('../middleware/auth');

// Create Stripe PaymentIntent (requires STRIPE_SECRET on server)
// Allow both authenticated and guest users
router.post('/create-payment-intent', createPaymentIntent);

// Create order (COD or after payment)
// Allow both authenticated and guest users
router.post('/order', createOrder);

module.exports = router;
