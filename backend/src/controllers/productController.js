const db = require('../db');
const path = require('path');
const fs = require('fs');

function makeAbsoluteUrl(baseUrl, value) {
  if (!value) return null;
  if (value.startsWith('http')) return value;
  return `${baseUrl}${value.startsWith('/') ? '' : '/'}${value}`;
}

function isPlaceholderImage(value) {
  if (!value || typeof value !== 'string') return false;
  return /placeholder\.com|placehold\.it/.test(value);
}

function getFirstGalleryImage(baseUrl, images) {
  if (!images) return null;
  const imgs = typeof images === 'string' ? JSON.parse(images) : images;
  if (!Array.isArray(imgs) || imgs.length === 0) return null;
  const first = imgs[0];
  if (!first) return null;
  if (typeof first === 'string') return makeAbsoluteUrl(baseUrl, first);
  return makeAbsoluteUrl(baseUrl, first.url || first.thumb || '');
}

function getProductImage(baseUrl, image, images) {
  if (image && !isPlaceholderImage(image)) return makeAbsoluteUrl(baseUrl, image);
  const galleryImage = getFirstGalleryImage(baseUrl, images);
  return galleryImage || makeAbsoluteUrl(baseUrl, image);
}

function buildWhere(query, paramsStartIndex = 1) {
  const clauses = [];
  const params = [];
  let idx = paramsStartIndex;

  if (query.q) {
    clauses.push(`(title ILIKE $${idx} OR description ILIKE $${idx})`);
    params.push(`%${query.q}%`);
    idx++;
  }

  if (query.category) {
    // accept numeric id or slug
    if (/^\d+$/.test(String(query.category))) {
      clauses.push(`category = $${idx++}`);
      params.push(parseInt(query.category, 10));
    } else {
      clauses.push(`category IN (SELECT id FROM categories WHERE slug = $${idx++})`);
      params.push(query.category);
    }
  }

  if (query.brand) {
    if (/^\d+$/.test(String(query.brand))) {
      clauses.push(`brand = $${idx++}`);
      params.push(parseInt(query.brand, 10));
    } else {
      clauses.push(`brand IN (SELECT id FROM brands WHERE slug = $${idx++})`);
      params.push(query.brand);
    }
  }

  if (query.minPrice) {
    clauses.push(`price >= $${idx++}`);
    params.push(parseFloat(query.minPrice));
  }
  if (query.maxPrice) {
    clauses.push(`price <= $${idx++}`);
    params.push(parseFloat(query.maxPrice));
  }
  if (query.inStock === 'true') {
    clauses.push(`stock > 0`);
  }
  if (query.featured === 'true') {
    clauses.push(`is_featured = true`);
  }
  if (query.best_seller === 'true') {
    clauses.push(`is_best_seller = true`);
  }

  return { clauses, params };
}

async function list(req, res) {
  try {
    // Pagination via page/limit
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(parseInt(req.query.limit || '24', 10), 100);
    const offset = (page - 1) * limit;

    // Build where clauses
    const { clauses, params } = buildWhere(req.query, 1);
    const where = clauses.length ? ' WHERE ' + clauses.join(' AND ') : '';

    // Sorting
    let orderBy = 'created_at DESC';
    const sort = req.query.sort || 'newest';
    if (sort === 'price_asc') orderBy = 'price ASC';
    else if (sort === 'price_desc') orderBy = 'price DESC';
    else if (sort === 'newest') orderBy = 'created_at DESC';

    // Total count
    const countSql = `SELECT COUNT(*) as total FROM products${where}`;
    const countRes = await db.query(countSql, params);
    const total = parseInt(countRes.rows[0].total, 10);

    const sql = `SELECT id, title, slug, description, price::text, discount_price::text, stock, image, images, rating, review_count FROM products${where} ORDER BY ${orderBy} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const finalParams = params.concat([limit, offset]);
    const { rows } = await db.query(sql, finalParams);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const items = rows.map(r => ({
      ...r,
      image: getProductImage(baseUrl, r.image, r.images)
    }));

    res.json({ items, total, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getById(req, res) {
  try {
    const id = req.params.id;
    const { rows } = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const product = rows[0];
    product.image = getProductImage(baseUrl, product.image, product.images);
    // normalize images array (could be JSON string or already array)
    if (product.images) {
      const imgs = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      product.images = imgs.map(i => {
        if (typeof i === 'string') return makeAbsoluteUrl(baseUrl, i);
        return {
          ...i,
          url: makeAbsoluteUrl(baseUrl, i.url),
          thumb: makeAbsoluteUrl(baseUrl, i.thumb)
        };
      });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function create(req, res) {
  try {
    const { title, slug, description, price, brand, category, stock, sku, is_featured, is_best_seller } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const q = `INSERT INTO products (title, slug, description, price, brand, category, stock, sku, image, is_featured, is_best_seller) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`;
    const { rows } = await db.query(q, [
      title,
      slug,
      description,
      price || 0,
      brand || null,
      category || null,
      stock || 0,
      sku || null,
      image,
      is_featured === 'true' || is_featured === true,
      is_best_seller === 'true' || is_best_seller === true
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function update(req, res) {
  try {
    const id = req.params.id;
    const fields = ['title','slug','description','price','brand','category','stock','sku','is_featured','is_best_seller'];
    const sets = [];
    const params = [];
    let idx = 1;

    // Handle image upload separately if present
    if (req.file) {
      const current = await db.query('SELECT image FROM products WHERE id = $1', [id]);
      const currentImage = current.rows[0]?.image;
      if (currentImage && currentImage.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, '..', '..', currentImage);
        fs.unlink(filePath, (err) => { if (err) console.warn('Failed to delete old product image:', err.message); });
      }
      sets.push(`image = $${idx++}`);
      params.push(`/uploads/${req.file.filename}`);
    }

    for (const f of fields) {
      if (f in req.body) {
        sets.push(`${f} = $${idx++}`);
        let value = req.body[f];
        if (value === '') {
          value = null;
        } else if (f === 'is_featured' || f === 'is_best_seller') {
          value = value === 'true' || value === true;
        } else if (f === 'price') {
          value = value === null ? null : parseFloat(value);
          if (Number.isNaN(value)) value = null;
        } else if (f === 'brand' || f === 'category' || f === 'stock') {
          value = value === null ? null : parseInt(value, 10);
          if (Number.isNaN(value)) value = null;
        } else if (f === 'sku') {
          value = value === null ? null : String(value).trim();
          if (value === '') value = null;
        } else {
          value = String(value);
        }
        params.push(value);
      }
    }
    if (!sets.length) return res.status(400).json({ error: 'No fields to update' });
    params.push(id);
    const sql = `UPDATE products SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`;
    const { rows } = await db.query(sql, params);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function remove(req, res) {
  try {
    const id = req.params.id;
    await db.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getBySlug(req, res) {
  try {
    const { slug } = req.params;
    const { rows } = await db.query('SELECT * FROM products WHERE slug = $1', [slug]);
    if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const product = rows[0];
    product.image = getProductImage(baseUrl, product.image, product.images);
    if (product.images) {
      const imgs = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      product.images = imgs.map(i => {
        if (typeof i === 'string') return makeAbsoluteUrl(baseUrl, i);
        return {
          ...i,
          url: makeAbsoluteUrl(baseUrl, i.url),
          thumb: makeAbsoluteUrl(baseUrl, i.thumb)
        };
      });
    }

    const { rows: reviews } = await db.query(
      `SELECT r.id, r.rating, r.title, r.comment, r.created_at, u.name as user_name
       FROM product_reviews r LEFT JOIN users u ON r.user_id = u.id WHERE r.product_id = $1 ORDER BY r.created_at DESC`,
      [product.id]
    );

    const { rows: related } = await db.query(
      `SELECT id, title, slug, price::text, discount_price::text, image FROM products WHERE category = $1 AND id != $2 LIMIT 6`,
      [product.category, product.id]
    );

    // prefix related images
    const relatedPrefixed = related.map(r => ({
      ...r,
      image: makeAbsoluteUrl(baseUrl, r.image)
    }));
    res.json({ product, reviews, related: relatedPrefixed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { list, getById, create, update, remove, getBySlug }; 
