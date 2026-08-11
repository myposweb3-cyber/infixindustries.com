const db = require('../db');

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

async function getFeatured(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT id, title, slug, price, discount_price, image, images, rating, review_count, is_featured
       FROM products WHERE is_featured = true LIMIT 12`
    );
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const items = rows.map(r => ({
        ...r,
        image: getProductImage(baseUrl, r.image, r.images)
      }));
      res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getNewArrivals(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT id, title, slug, price, discount_price, image, images, rating, review_count
       FROM products WHERE is_new = true ORDER BY created_at DESC LIMIT 10`
    );
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const items = rows.map(r => ({
        ...r,
        image: getProductImage(baseUrl, r.image, r.images)
      }));
      res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getBestSellers(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT id, title, slug, price, discount_price, image, images, rating, review_count
       FROM products WHERE is_best_seller = true ORDER BY review_count DESC LIMIT 10`
    );
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const items = rows.map(r => ({
        ...r,
        image: getProductImage(baseUrl, r.image, r.images)
      }));
      res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getBanners(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT id, title, image, link FROM banners WHERE active = true ORDER BY order_num ASC`
    );
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const items = rows.map(r => ({
        ...r,
        image: makeAbsoluteUrl(baseUrl, r.image)
      }));
      res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getCategories(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT id, name, slug, image FROM categories WHERE parent_id IS NULL`
    );
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const items = rows.map(r => ({
        ...r,
        image: makeAbsoluteUrl(baseUrl, r.image)
      }));
      res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getCategory(req, res) {
  try {
    const { slug } = req.params;
    const { rows } = await db.query(
      `SELECT id, name, slug FROM categories WHERE slug = $1`,
      [slug]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Category not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getBrands(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT id, name, slug, logo FROM brands LIMIT 20`
    );
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const items = rows.map(r => ({
        ...r,
        logo: makeAbsoluteUrl(baseUrl, r.logo)
      }));
      res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getHeroSlides(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT id, title, link, image_url AS image, thumb, created_at FROM hero_slides ORDER BY created_at DESC`
    );
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const slides = rows.map(slide => ({
      ...slide,
      image: makeAbsoluteUrl(baseUrl, slide.image),
      thumb: makeAbsoluteUrl(baseUrl, slide.thumb)
    }));
    res.json(slides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getFeatured, getNewArrivals, getBestSellers, getBanners, getCategories, getCategory, getBrands, getHeroSlides };
