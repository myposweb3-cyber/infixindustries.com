const db = require('../db');

async function cleanup() {
  try {
    console.log('Dropping old tables...');
    
    const dropQueries = [
      'DROP TABLE IF EXISTS order_items CASCADE;',
      'DROP TABLE IF EXISTS orders CASCADE;',
      'DROP TABLE IF EXISTS product_reviews CASCADE;',
      'DROP TABLE IF EXISTS cart_items CASCADE;',
      'DROP TABLE IF EXISTS wishlist CASCADE;',
      'DROP TABLE IF EXISTS products CASCADE;',
      'DROP TABLE IF EXISTS banners CASCADE;',
      'DROP TABLE IF EXISTS blog_posts CASCADE;',
      'DROP TABLE IF EXISTS coupons CASCADE;',
      'DROP TABLE IF EXISTS categories CASCADE;',
      'DROP TABLE IF EXISTS brands CASCADE;',
      'DROP TABLE IF EXISTS refresh_tokens CASCADE;',
      'DROP TABLE IF EXISTS users CASCADE;'
    ];

    for (const query of dropQueries) {
      await db.query(query);
    }

    console.log('✓ Tables dropped');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup error:', err.message);
    process.exit(1);
  }
}

cleanup();
