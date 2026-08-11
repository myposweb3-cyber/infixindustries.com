const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'replace_with_strong_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

async function register(req, res) {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const hashed = await bcrypt.hash(password, 10);
  const q = 'INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role';
  try {
    const { rows } = await db.query(q, [name || null, email, hashed, 'customer']);
    const user = rows[0];
    const { token, refreshToken } = await createTokens(user);
    res.json({ user, token, refreshToken });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already registered' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const { rows } = await db.query('SELECT id, name, email, password_hash, role FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    delete user.password_hash;
    const { token, refreshToken } = await createTokens(user);
      // If client included a guest cart, merge it into user's cart
      const guestCart = req.body.cart;
      if (Array.isArray(guestCart) && guestCart.length > 0) {
        try {
          for (const it of guestCart) {
            const prodId = parseInt(it.productId || it.product_id || it.product_id, 10) || null;
            const qty = parseInt(it.quantity || 1, 10) || 1;
            if (!prodId) continue;
            const exists = await db.query('SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2', [user.id, prodId]);
            if (exists.rows[0]) {
              const newQty = exists.rows[0].quantity + qty;
              await db.query('UPDATE cart_items SET quantity=$1 WHERE id=$2', [newQty, exists.rows[0].id]);
            } else {
              await db.query('INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1,$2,$3)', [user.id, prodId, qty]);
            }
          }
        } catch (mergeErr) {
          console.error('Error merging guest cart:', mergeErr);
        }
      }

      res.json({ user, token, refreshToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function createTokens(user) {
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshTokenStr = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  await db.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)', [user.id, refreshTokenStr, expiresAt]);
  return { token, refreshToken: refreshTokenStr };
}

async function refresh(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
  try {
    const { rows } = await db.query(
      'SELECT user_id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [refreshToken]
    );
    if (!rows[0]) return res.status(401).json({ error: 'Invalid refresh token' });
    const userId = rows[0].user_id;
    const { rows: userRows } = await db.query('SELECT id, role FROM users WHERE id = $1', [userId]);
    const user = userRows[0];
    const newAccessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ token: newAccessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function logout(req, res) {
  const { refreshToken } = req.body;
  try {
    if (refreshToken) {
      await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { register, login, refresh, logout };
