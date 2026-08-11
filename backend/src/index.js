const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const homeRoutes = require('./routes/home');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const adminRoutes = require('./routes/admin');
const path = require('path');
const db = require('./db');

dotenv.config();
const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }));
// Stripe webhook needs the raw body to verify signature
app.post('/api/checkout/webhook', express.raw({ type: 'application/json' }), require('./routes/webhook').handler);

app.use(express.json());

// serve uploaded files
app.use('/uploads', helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/admin', adminRoutes);

// Public categories endpoint
app.get('/api/categories', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, slug, parent_id, image, description FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch categories error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
