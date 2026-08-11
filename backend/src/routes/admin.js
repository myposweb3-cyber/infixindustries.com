const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/multer');
const slugify = require('slugify');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const makeAbsoluteUrl = (baseUrl, value) => {
  if (!value) return null;
  if (value.startsWith('http')) return value;
  return `${baseUrl}${value.startsWith('/') ? '' : '/'}${value}`;
};

// Admin-only check middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

  // Helper: Check if image is a placeholder
  const isPlaceholderImage = (value) => {
    if (!value || typeof value !== 'string') return false;
    return /placeholder\.com|placehold\.it/.test(value);
  };

  // Helper: Get first image from gallery
  const getFirstGalleryImage = (baseUrl, images) => {
    if (!images) return null;
    const imgs = typeof images === 'string' ? JSON.parse(images) : images;
    if (!Array.isArray(imgs) || imgs.length === 0) return null;
    const first = imgs[0];
    if (!first) return null;
    if (typeof first === 'string') return makeAbsoluteUrl(baseUrl, first);
    return makeAbsoluteUrl(baseUrl, first.url || first.thumb || '');
  };

  // Helper: Get product image with fallback to gallery
  const getProductImage = (baseUrl, image, images) => {
    if (image && !isPlaceholderImage(image)) return makeAbsoluteUrl(baseUrl, image);
    const galleryImage = getFirstGalleryImage(baseUrl, images);
    return galleryImage || makeAbsoluteUrl(baseUrl, image);
  };

const refreshProductReviewStats = async (productId) => {
  const statsResult = await pool.query(
    `SELECT AVG(rating)::numeric(10,2) AS avg_rating, COUNT(*) AS count
     FROM product_reviews WHERE product_id = $1`,
    [productId]
  );
  const stats = statsResult.rows[0];
  const rating = stats.count > 0 ? stats.avg_rating : 0;
  const reviewCount = parseInt(stats.count, 10) || 0;
  await pool.query(
    'UPDATE products SET rating = $1, review_count = $2 WHERE id = $3',
    [rating, reviewCount, productId]
  );
};

// Helper function to generate thumbnail
const generateThumbnail = async (imagePath) => {
  try {
    const fullPath = path.join(__dirname, '..', '..', imagePath);
    const ext = path.extname(imagePath);
    const thumbPath = imagePath.replace(ext, `-thumb${ext}`);
    const thumbFullPath = path.join(__dirname, '..', '..', thumbPath);

    // Generate 200x200 thumbnail
    await sharp(fullPath)
      .resize(200, 200, { fit: 'cover', position: 'center' })
      .toFile(thumbFullPath);
    
    return thumbPath;
  } catch (error) {
    console.warn('Thumbnail generation failed:', error.message);
    return null; // Return null if thumbnail fails; image still uploaded
  }
};

// Apply auth middleware to all admin routes
router.use(authenticate, adminOnly);

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // Total orders
    const ordersResult = await pool.query('SELECT COUNT(*) as total FROM orders');
    const totalOrders = parseInt(ordersResult.rows[0].total);

    // Total revenue (paid orders only)
    const revenueResult = await pool.query(
      "SELECT SUM(total_price)::float as revenue FROM orders WHERE status = 'paid' OR status = 'completed'"
    );
    const totalRevenue = parseFloat(revenueResult.rows[0].revenue) || 0;

    // Pending orders
    const pendingResult = await pool.query("SELECT COUNT(*) as pending FROM orders WHERE status = 'pending'");
    const pendingOrders = parseInt(pendingResult.rows[0].pending);

    // Total products
    const productsResult = await pool.query('SELECT COUNT(*) as total FROM products');
    const totalProducts = parseInt(productsResult.rows[0].total);

    // Top products (by quantity sold)
    const topProductsResult = await pool.query(`
      SELECT p.id, p.title AS name, p.image, SUM(oi.quantity)::int as quantity_sold, SUM(oi.price * oi.quantity)::float as revenue
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id, p.title, p.image
      ORDER BY quantity_sold DESC NULLS LAST
      LIMIT 5
    `);

    // Recent orders
    const recentOrdersResult = await pool.query(`
      SELECT id, order_number, total_price::float AS total, status, created_at, user_id
      FROM orders
      ORDER BY created_at DESC
      LIMIT 10
    `);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({
      stats: {
        totalOrders,
        totalRevenue,
        pendingOrders,
        totalProducts
      },
      topProducts: topProductsResult.rows.map((r) => ({
        ...r,
        image: makeAbsoluteUrl(baseUrl, r.image)
      })),
      recentOrders: recentOrdersResult.rows
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all orders with pagination
router.get('/orders', async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT id, order_number, total_price::float AS total, status, created_at,
              (CASE WHEN shipping_address IS NOT NULL THEN (shipping_address::json->>'name') ELSE NULL END) AS shipping_name
           FROM orders WHERE 1=1`;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (order_number ILIKE $${params.length} OR (shipping_address::json->>'name') ILIKE $${params.length})`;
      params.push(`%${search}%`);
      query += ` OR (shipping_address::json->>'name') ILIKE $${params.length - 1}`;
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE 1=1';
    const countParams = [];
    if (status) {
      countParams.push(status);
      countQuery += ` AND status = $${countParams.length}`;
    }
    if (search) {
      countParams.push(`%${search}%`);
      countQuery += ` AND (order_number ILIKE $${countParams.length} OR (shipping_address::json->>'name') ILIKE $${countParams.length})`;
      countParams.push(`%${search}%`);
      countQuery += ` OR (shipping_address::json->>'name') ILIKE $${countParams.length - 1}`;
    }
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      orders: result.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Orders list error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get order details (include customer and product info)
router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch order and embed basic customer info (if available)
    const orderResult = await pool.query(
      `SELECT o.id, o.order_number, o.user_id, o.total_price::float AS total, o.status, o.payment_method, o.shipping_address,
              (CASE WHEN o.shipping_address IS NOT NULL THEN (o.shipping_address::json->>'name') ELSE NULL END) AS shipping_name,
              o.created_at,
              u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [id]
    );

    if (!orderResult.rows.length) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Join order_items with products to provide product title/image/slug
    const itemsResult = await pool.query(
      `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price::float AS price,
              p.title AS product_title, p.slug AS product_slug, p.image AS product_image
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const items = itemsResult.rows.map((it) => ({
      ...it,
      product_image: getProductImage(baseUrl, it.product_image, null)
    }));

    res.json({
      order: orderResult.rows[0],
      items
    });
  } catch (error) {
    console.error('Order detail error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update order status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'paid', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order updated', order: result.rows[0] });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all products for management
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.id, p.title AS name, p.slug, p.price, p.discount_price, p.stock, 
             p.image, p.images, p.category AS category_id, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND p.title ILIKE $${params.length}`;
    }

    if (category) {
      params.push(parseInt(category));
      query += ` AND p.category = $${params.length}`;
    }

    query += ' ORDER BY p.id DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const products = result.rows.map(r => ({
      ...r,
      image: getProductImage(baseUrl, r.image, r.images)
    }));

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
    const countParams = [];
    if (search) {
      countParams.push(`%${search}%`);
      countQuery += ` AND title ILIKE $${countParams.length}`;
    }
    if (category) {
      countParams.push(parseInt(category));
      countQuery += ` AND category = $${countParams.length}`;
    }
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      products,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Products list error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single product for editing
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, title AS name, slug, description, price, discount_price, brand, category AS category_id, stock, sku, image, images, rating, review_count, is_featured, is_best_seller, is_new, created_at
       FROM products WHERE id = $1`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const product = result.rows[0];
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

    res.json(product);
  } catch (error) {
    console.error('Product detail error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put('/products/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      name,
      slug,
      description,
      price,
      discount_price,
      stock,
      category_id,
      category,
      brand_id,
      brand,
      sku,
      is_featured,
      is_best_seller
    } = req.body;

    const parsedPrice = typeof price === 'string' && price !== '' ? parseFloat(price) : price;
    const parsedDiscountPrice = typeof discount_price === 'string' && discount_price !== '' ? parseFloat(discount_price) : discount_price;
    const parsedStock = typeof stock === 'string' && stock !== '' ? parseInt(stock, 10) : stock;
    const parsedIsFeatured = is_featured === 'true' || is_featured === true;
    const parsedIsBestSeller = is_best_seller === 'true' || is_best_seller === true;

    // Get current product to preserve image if not updated
    const currentResult = await pool.query('SELECT image FROM products WHERE id = $1', [id]);
    if (!currentResult.rows.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Handle image upload
    let imageUrl = currentResult.rows[0].image;
    if (req.file) {
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      
      const filename = `${Date.now()}-${req.file.originalname}`;
      const filepath = path.join(uploadsDir, filename);
      
      // Move uploaded file
      fs.renameSync(req.file.path, filepath);
      imageUrl = `/uploads/${filename}`;
    }

    const result = await pool.query(
      `UPDATE products 
       SET title = $1, slug = $2, description = $3, price = $4, discount_price = $5, stock = $6, category = $7, brand = $8, sku = $9, image = $10, is_featured = $11, is_best_seller = $12
       WHERE id = $13
       RETURNING id, title, slug, description, price, discount_price, brand, category, stock, sku, image, images, rating, review_count, is_featured, is_best_seller, is_new, created_at`,
      [
        title || name || 'Untitled',
        slug || '',
        description || '',
        parsedPrice != null ? parsedPrice : 0,
        parsedDiscountPrice != null ? parsedDiscountPrice : null,
        parsedStock != null ? parsedStock : 0,
        category_id || category || null,
        brand_id || brand || null,
        sku || null,
        imageUrl,
        parsedIsFeatured,
        parsedIsBestSeller,
        id
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = result.rows[0];
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    product.image = getProductImage(baseUrl, product.image, product.images);
    if (product.images) {
      const imgs = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      product.images = imgs.map((i) => {
        if (typeof i === 'string') return makeAbsoluteUrl(baseUrl, i);
        return {
          ...i,
          url: makeAbsoluteUrl(baseUrl, i.url),
          thumb: makeAbsoluteUrl(baseUrl, i.thumb)
        };
      });
    }

    res.json({ message: 'Product updated', product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM order_items WHERE product_id = $1', [id]);
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload additional images for a product
router.post('/products/:id/images', upload.array('images'), async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ error: 'No images provided' });

    // get existing images
    const prodRes = await pool.query('SELECT images FROM products WHERE id = $1', [id]);
    if (!prodRes.rows.length) return res.status(404).json({ error: 'Product not found' });
    const existing = prodRes.rows[0].images ? JSON.parse(prodRes.rows[0].images) : [];

    // Process each file: generate thumbnail and create image object
    const newImages = [];
    for (const file of files) {
      const imagePath = `/uploads/${file.filename}`;
      const thumbPath = await generateThumbnail(imagePath);
      
      newImages.push({
        url: imagePath,
        thumb: thumbPath,
        order: existing.length + newImages.length
      });
    }

    const updated = [...existing, ...newImages];

    await pool.query('UPDATE products SET images = $1 WHERE id = $2', [JSON.stringify(updated), id]);
    res.json({ message: 'Images uploaded', images: updated });
  } catch (err) {
    console.error('Upload images error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete an image from a product
router.delete('/products/:id/images', async (req, res) => {
  try {
    const { id } = req.params;
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'Image path required' });

    const prodRes = await pool.query('SELECT images FROM products WHERE id = $1', [id]);
    if (!prodRes.rows.length) return res.status(404).json({ error: 'Product not found' });
    const existing = prodRes.rows[0].images ? JSON.parse(prodRes.rows[0].images) : [];
    
    // Filter out the image (handle both string format and object format)
    const updated = existing.filter(i => {
      const imgUrl = typeof i === 'string' ? i : i.url;
      return imgUrl !== image;
    });

    await pool.query('UPDATE products SET images = $1 WHERE id = $2', [JSON.stringify(updated), id]);

    // delete main image file and thumbnail from disk
    if (image.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', '..', image);
      fs.unlink(filePath, (err) => {
        if (err) console.warn('Failed to remove file:', filePath, err.message);
      });
      
      // Also delete thumbnail
      const ext = path.extname(image);
      const thumbPath = image.replace(ext, `-thumb${ext}`);
      const thumbFilePath = path.join(__dirname, '..', '..', thumbPath);
      fs.unlink(thumbFilePath, (err) => {
        if (err) console.warn('Failed to remove thumbnail:', thumbFilePath, err.message);
      });
    }

    res.json({ message: 'Image removed', images: updated });
  } catch (err) {
    console.error('Delete image error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Reorder images
router.patch('/products/:id/images/reorder', async (req, res) => {
  try {
    const { id } = req.params;
    const { imageOrder } = req.body; // Array of image URLs in desired order

    if (!Array.isArray(imageOrder)) {
      return res.status(400).json({ error: 'imageOrder must be an array' });
    }

    const prodRes = await pool.query('SELECT images FROM products WHERE id = $1', [id]);
    if (!prodRes.rows.length) return res.status(404).json({ error: 'Product not found' });
    const existing = prodRes.rows[0].images ? JSON.parse(prodRes.rows[0].images) : [];

    // Build a map of images for quick lookup
    const imageMap = {};
    existing.forEach(img => {
      const imgUrl = typeof img === 'string' ? img : img.url;
      imageMap[imgUrl] = img;
    });

    // Rebuild array in new order with updated order field
    const reordered = imageOrder
      .filter(url => imageMap[url]) // Filter out any invalid URLs
      .map((url, idx) => {
        const img = imageMap[url];
        if (typeof img === 'string') {
          return { url: img, thumb: null, order: idx };
        } else {
          return { ...img, order: idx };
        }
      });

    await pool.query('UPDATE products SET images = $1 WHERE id = $2', [JSON.stringify(reordered), id]);
    res.json({ message: 'Images reordered', images: reordered });
  } catch (err) {
    console.error('Reorder images error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create product (with optional image upload)
router.post('/products', upload.array('images'), async (req, res) => {
  try {
    const {
      title, name, slug, description, price, discount_price, stock, category_id, category, brand, brand_id, sku
    } = req.body;

    // handle multiple images
    const files = req.files || [];
    const imagePath = files.length ? `/uploads/${files[0].filename}` : (req.body.image || null);
    
    // Process all files: generate thumbnails
    const imagesArr = [];
    if (files.length) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = `/uploads/${file.filename}`;
        const thumb = await generateThumbnail(url);
        imagesArr.push({
          url,
          thumb,
          order: i
        });
      }
    } else if (req.body.images) {
      const parsed = JSON.parse(req.body.images);
      imagesArr.push(...parsed);
    }

    const finalTitle = title || name;
    const finalSlug = slug || (finalTitle ? slugify(finalTitle, { lower: true, strict: true }) : null);

    const imagesJson = imagesArr.length ? JSON.stringify(imagesArr) : null;
    const result = await pool.query(
      `INSERT INTO products (title, slug, description, price, discount_price, brand, category, stock, sku, image, images)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [finalTitle, finalSlug, description || null, price || 0, discount_price || null, brand_id || brand || null, category_id || category || null, stock || 0, sku || null, imagePath, imagesJson]
    );

    const product = result.rows[0];
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    product.image = makeAbsoluteUrl(baseUrl, product.image);
    if (product.images) {
      const imgs = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      product.images = imgs.map((i) => {
        if (typeof i === 'string') return makeAbsoluteUrl(baseUrl, i);
        return {
          ...i,
          url: makeAbsoluteUrl(baseUrl, i.url),
          thumb: makeAbsoluteUrl(baseUrl, i.thumb)
        };
      });
    }

    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Review management
router.get('/reviews', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(parseInt(req.query.limit || '20', 10), 100));
    const offset = (page - 1) * limit;
    const search = req.query.search ? String(req.query.search).trim() : '';

    let query = `SELECT r.id, r.product_id, p.title AS product_title, r.user_id, u.name AS user_name,
                       r.rating, r.title, r.comment, r.created_at
                 FROM product_reviews r
                 LEFT JOIN users u ON r.user_id = u.id
                 LEFT JOIN products p ON p.id = r.product_id
                 WHERE 1=1`;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (p.title ILIKE $${params.length} OR u.name ILIKE $${params.length} OR r.title ILIKE $${params.length} OR r.comment ILIKE $${params.length})`;
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    let countQuery = `SELECT COUNT(*) AS total
                      FROM product_reviews r
                      LEFT JOIN users u ON r.user_id = u.id
                      LEFT JOIN products p ON p.id = r.product_id
                      WHERE 1=1`;
    const countParams = [];
    if (search) {
      countParams.push(`%${search}%`);
      countQuery += ` AND (p.title ILIKE $${countParams.length} OR u.name ILIKE $${countParams.length} OR r.title ILIKE $${countParams.length} OR r.comment ILIKE $${countParams.length})`;
    }
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total, 10);

    res.json({
      reviews: result.rows,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Reviews list error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT r.id, r.product_id, p.title AS product_title, r.user_id, u.name AS user_name,
              r.rating, r.title, r.comment, r.created_at
       FROM product_reviews r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN products p ON p.id = r.product_id
       WHERE r.id = $1`,
      [id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Review detail error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;
    if (rating != null && (isNaN(rating) || rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
    }

    const fields = [];
    const params = [];
    let idx = 1;
    if (rating != null) {
      fields.push(`rating = $${idx++}`);
      params.push(rating);
    }
    if (title != null) {
      fields.push(`title = $${idx++}`);
      params.push(title);
    }
    if (comment != null) {
      fields.push(`comment = $${idx++}`);
      params.push(comment);
    }

    if (!fields.length) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);

    const result = await pool.query(
      `UPDATE product_reviews SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await refreshProductReviewStats(result.rows[0].product_id);
    res.json({ message: 'Review updated', review: result.rows[0] });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const reviewResult = await pool.query('SELECT product_id FROM product_reviews WHERE id = $1', [id]);
    if (!reviewResult.rows.length) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const productId = reviewResult.rows[0].product_id;
    await pool.query('DELETE FROM product_reviews WHERE id = $1', [id]);
    await refreshProductReviewStats(productId);

    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- Hero slides management ---
// Get hero slides
router.get('/hero-slides', async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const result = await pool.query('SELECT id, title, link, image_url AS image, thumb, created_at FROM hero_slides ORDER BY id ASC');
    res.json(result.rows.map(slide => ({
      ...slide,
      image: makeAbsoluteUrl(baseUrl, slide.image),
      thumb: makeAbsoluteUrl(baseUrl, slide.thumb)
    })));
  } catch (err) {
    console.error('Fetch hero slides error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Helper to crop image to hero size (1920x600 - 16:9 aspect ratio)
const cropToHeroSize = async (imagePath) => {
  try {
    const fullPath = path.join(__dirname, '..', '..', imagePath);
    
    // Get image metadata
    const metadata = await sharp(fullPath).metadata();
    const { width, height } = metadata;
    
    // Calculate crop dimensions maintaining 16:9 aspect ratio (1920x600)
    const targetAspect = 16 / 9; // 1.777...
    const currentAspect = width / height;
    
    let cropWidth = width;
    let cropHeight = height;
    
    if (currentAspect > targetAspect) {
      // Image is too wide, crop width
      cropWidth = Math.floor(height * targetAspect);
    } else {
      // Image is too tall, crop height
      cropHeight = Math.floor(width / targetAspect);
    }
    
    const left = Math.floor((width - cropWidth) / 2);
    const top = Math.floor((height - cropHeight) / 2);
    
    // Crop and resize to 1920x600
    await sharp(fullPath)
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .resize(1920, 600, { fit: 'fill' })
      .toFile(fullPath);
      
    return true;
  } catch (error) {
    console.warn('Crop to hero size failed:', error.message);
    return false;
  }
};

// Upload a hero slide
router.post('/hero-slides', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'Image file required' });

    const imagePath = `/uploads/${file.filename}`;
    
    // Auto-crop to hero size (1920x600)
    await cropToHeroSize(imagePath);
    
    const thumbPath = await generateThumbnail(imagePath);

    const { title, link } = req.body;
    const insert = await pool.query(
      'INSERT INTO hero_slides (title, link, image_url, thumb) VALUES ($1,$2,$3,$4) RETURNING id, title, link, image_url AS image, thumb, created_at',
      [title || null, link || null, imagePath, thumbPath]
    );

    res.status(201).json(insert.rows[0]);
  } catch (err) {
    console.error('Upload hero slide error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update a hero slide (title and link only)
router.put('/hero-slides/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, link } = req.body;
    
    const update = await pool.query(
      'UPDATE hero_slides SET title = $1, link = $2 WHERE id = $3 RETURNING *',
      [title || null, link || null, id]
    );
    
    if (!update.rows.length) return res.status(404).json({ error: 'Slide not found' });
    res.json(update.rows[0]);
  } catch (err) {
    console.error('Update hero slide error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a hero slide
router.delete('/hero-slides/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cur = await pool.query('SELECT image_url FROM hero_slides WHERE id = $1', [id]);
    if (!cur.rows.length) return res.status(404).json({ error: 'Slide not found' });

    const image = cur.rows[0].image_url;
    await pool.query('DELETE FROM hero_slides WHERE id = $1', [id]);

    // remove files if stored under /uploads/
    if (image && image.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', '..', image);
      fs.unlink(filePath, (err) => { if (err) console.warn('Failed to delete slide file:', err.message); });
      const ext = path.extname(image);
      const thumb = image.replace(ext, `-thumb${ext}`);
      const thumbFull = path.join(__dirname, '..', '..', thumb);
      fs.unlink(thumbFull, (err) => { if (err) console.warn('Failed to delete slide thumb:', err.message); });
    }

    res.json({ message: 'Slide deleted' });
  } catch (err) {
    console.error('Delete hero slide error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Categories CRUD
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, slug, parent_id, image, description, created_at FROM categories ORDER BY created_at DESC');
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const categories = result.rows.map((r) => ({
      ...r,
      image: makeAbsoluteUrl(baseUrl, r.image)
    }));
    res.json(categories);
  } catch (err) {
    console.error('Fetch categories error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/categories', upload.single('image'), async (req, res) => {
  try {
    const { name, slug, description, parent_id } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }
    
    let image = null;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }
    
    const result = await pool.query(
      'INSERT INTO categories (name, slug, parent_id, image, description) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, slug, parent_id || null, image, description || null]
    );
    const category = result.rows[0];
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    category.image = makeAbsoluteUrl(baseUrl, category.image);
    
    res.status(201).json(category);
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/categories/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, parent_id } = req.body;
    
    // Get current category to preserve image if not updated
    const current = await pool.query('SELECT image FROM categories WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    let image = current.rows[0].image;
    if (req.file) {
      // Delete old image if exists
      if (image && image.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, '..', '..', image);
        fs.unlink(filePath, (err) => { if (err) console.warn('Failed to delete old image:', err.message); });
      }
      image = `/uploads/${req.file.filename}`;
    }
    
    const result = await pool.query(
      'UPDATE categories SET name = $1, slug = $2, parent_id = $3, image = $4, description = $5 WHERE id = $6 RETURNING *',
      [name || current.rows[0].name, slug, parent_id || null, image, description, id]
    );
    const category = result.rows[0];
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    category.image = makeAbsoluteUrl(baseUrl, category.image);
    
    res.json(category);
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get category to delete image
    const result = await pool.query('SELECT image FROM categories WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Delete image file
    const image = result.rows[0].image;
    if (image && image.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', '..', image);
      fs.unlink(filePath, (err) => { if (err) console.warn('Failed to delete category image:', err.message); });
    }
    
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
