const db = require('../db');

async function getCart(req, res) {
  try {
    const userId = req.user.id;
    const { rows } = await db.query(
      `SELECT MIN(c.id) as cart_id, SUM(c.quantity)::int as quantity,
              p.id as product_id, p.title, p.slug, p.price::text,
              p.discount_price::text, p.image
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1
       GROUP BY p.id, p.title, p.slug, p.price, p.discount_price, p.image
       ORDER BY MIN(c.id)`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function addItem(req, res) {
  const client = await db.pool.connect();
  try {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;
    if (!product_id) return res.status(400).json({ error: 'Missing product_id' });
    const qty = parseInt(quantity || 1, 10);
    if (!Number.isInteger(qty) || qty < 1) return res.status(400).json({ error: 'Invalid quantity' });

    await client.query('BEGIN');
    // Serialize additions for this user/product so rapid clicks cannot create duplicates.
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`cart:${userId}:${product_id}`]);
    const { rows } = await client.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2 ORDER BY id FOR UPDATE',
      [userId, product_id]
    );

    if (rows.length) {
      const newQty = rows.reduce((sum, row) => sum + row.quantity, 0) + qty;
      await client.query('UPDATE cart_items SET quantity=$1 WHERE id=$2', [newQty, rows[0].id]);
      if (rows.length > 1) {
        await client.query('DELETE FROM cart_items WHERE user_id=$1 AND product_id=$2 AND id <> $3', [userId, product_id, rows[0].id]);
      }
      await client.query('COMMIT');
      return res.json({ ...rows[0], quantity: newQty });
    }

    const q = 'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1,$2,$3) RETURNING *';
    const { rows: created } = await client.query(q, [userId, product_id, qty]);
    await client.query('COMMIT');
    res.status(201).json(created[0]);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
}

async function updateItem(req, res) {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    const { quantity } = req.body;
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) return res.status(400).json({ error: 'Invalid quantity' });
    const { rows } = await db.query('UPDATE cart_items SET quantity=$1 WHERE id=$2 AND user_id=$3 RETURNING *', [qty, id, userId]);
    if (!rows[0]) return res.status(404).json({ error: 'Item not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function removeItem(req, res) {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    await db.query('DELETE FROM cart_items WHERE id=$1 AND user_id=$2', [id, userId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getCart, addItem, updateItem, removeItem };
