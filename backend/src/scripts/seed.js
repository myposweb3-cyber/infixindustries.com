const db = require('../db');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    console.log('Seeding comprehensive data...');

    // Clear existing data (for development)
    await db.query('DELETE FROM order_items;');
    await db.query('DELETE FROM orders;');
    await db.query('DELETE FROM product_reviews;');
    await db.query('DELETE FROM cart_items;');
    await db.query('DELETE FROM wishlist;');
    await db.query('DELETE FROM products;');
    await db.query('DELETE FROM categories;');
    await db.query('DELETE FROM brands;');
    await db.query('DELETE FROM banners;');
    await db.query('DELETE FROM blog_posts;');
    await db.query('DELETE FROM users;');

    // Seed brands
    const brands = [
      { name: 'Makita', slug: 'makita', logo: 'https://via.placeholder.com/100?text=Makita' },
      { name: 'Bosch', slug: 'bosch', logo: 'https://via.placeholder.com/100?text=Bosch' },
      { name: 'DeWalt', slug: 'dewalt', logo: 'https://via.placeholder.com/100?text=DeWalt' },
      { name: 'Milwaukee', slug: 'milwaukee', logo: 'https://via.placeholder.com/100?text=Milwaukee' },
      { name: 'Stanley', slug: 'stanley', logo: 'https://via.placeholder.com/100?text=Stanley' },
      { name: 'Hilti', slug: 'hilti', logo: 'https://via.placeholder.com/100?text=Hilti' }
    ];

    const brandIds = {};
    for (const brand of brands) {
      const { rows } = await db.query(
        'INSERT INTO brands (name, slug, logo) VALUES ($1,$2,$3) RETURNING id',
        [brand.name, brand.slug, brand.logo]
      );
      brandIds[brand.slug] = rows[0].id;
    }

    // Seed categories
    const categories = [
      { name: 'Power Tools', slug: 'power-tools', parent: null },
      { name: 'Hand Tools', slug: 'hand-tools', parent: null },
      { name: 'Electrical', slug: 'electrical', parent: null },
      { name: 'Plumbing', slug: 'plumbing', parent: null },
      { name: 'Paint & Coatings', slug: 'paint-coatings', parent: null },
      { name: 'Building Materials', slug: 'building-materials', parent: null },
      { name: 'Garden', slug: 'garden', parent: null },
      { name: 'Safety Equipment', slug: 'safety-equipment', parent: null }
    ];

    const categoryIds = {};
    for (const cat of categories) {
      const { rows } = await db.query(
        'INSERT INTO categories (name, slug, parent_id, image) VALUES ($1,$2,$3,$4) RETURNING id',
        [cat.name, cat.slug, cat.parent, `https://via.placeholder.com/300?text=${cat.name}`]
      );
      categoryIds[cat.slug] = rows[0].id;
    }

    // Seed products with realistic hardware/construction items
    const products = [
      // Power Tools
      { title: 'Cordless Drill 18V', slug: 'cordless-drill-18v', price: 129.99, discount: null, brand: 'makita', category: 'power-tools', stock: 50, is_featured: true, is_best_seller: true, is_new: false },
      { title: 'Impact Driver Set', slug: 'impact-driver-set', price: 179.99, discount: 149.99, brand: 'dewalt', category: 'power-tools', stock: 35, is_featured: true, is_best_seller: false, is_new: true },
      { title: 'Circular Saw 7.25 inch', slug: 'circular-saw-7-25', price: 89.99, discount: null, brand: 'bosch', category: 'power-tools', stock: 22, is_featured: false, is_best_seller: true, is_new: false },
      { title: 'Rotary Hammer SDS+', slug: 'rotary-hammer-sds', price: 299.99, discount: 269.99, brand: 'hilti', category: 'power-tools', stock: 15, is_featured: true, is_best_seller: false, is_new: true },
      { title: 'Jigsaw Variable Speed', slug: 'jigsaw-variable', price: 99.99, discount: null, brand: 'makita', category: 'power-tools', stock: 28, is_featured: false, is_best_seller: false, is_new: false },

      // Hand Tools
      { title: 'Hammer Claw 16oz', slug: 'hammer-claw-16', price: 14.99, discount: null, brand: 'stanley', category: 'hand-tools', stock: 200, is_featured: false, is_best_seller: true, is_new: false },
      { title: 'Screwdriver Set 25pc', slug: 'screwdriver-set-25', price: 24.99, discount: 19.99, brand: 'stanley', category: 'hand-tools', stock: 150, is_featured: true, is_best_seller: false, is_new: false },
      { title: 'Adjustable Wrench Set', slug: 'wrench-set', price: 34.99, discount: null, brand: 'stanley', category: 'hand-tools', stock: 80, is_featured: false, is_best_seller: false, is_new: false },
      { title: 'Tape Measure 25ft', slug: 'tape-measure-25', price: 12.99, discount: null, brand: 'stanley', category: 'hand-tools', stock: 120, is_featured: false, is_best_seller: true, is_new: false },
      { title: 'Socket Wrench Set 40pc', slug: 'socket-wrench-40', price: 59.99, discount: 49.99, brand: 'stanley', category: 'hand-tools', stock: 45, is_featured: true, is_best_seller: false, is_new: true },

      // Electrical
      { title: 'LED Work Light', slug: 'led-work-light', price: 39.99, discount: null, brand: 'makita', category: 'electrical', stock: 60, is_featured: true, is_best_seller: false, is_new: false },
      { title: 'Heavy Duty Outlet Strip', slug: 'outlet-strip', price: 19.99, discount: null, brand: null, category: 'electrical', stock: 100, is_featured: false, is_best_seller: true, is_new: false },
      { title: 'Voltage Tester', slug: 'voltage-tester', price: 9.99, discount: null, brand: null, category: 'electrical', stock: 80, is_featured: false, is_best_seller: false, is_new: false },
      { title: 'Extension Cord 50ft', slug: 'extension-cord-50', price: 29.99, discount: 24.99, brand: null, category: 'electrical', stock: 75, is_featured: true, is_best_seller: false, is_new: false },
      { title: 'Cordless Flashlight LED', slug: 'cordless-flashlight', price: 44.99, discount: null, brand: 'dewalt', category: 'electrical', stock: 40, is_featured: false, is_best_seller: false, is_new: true },

      // Plumbing
      { title: 'Copper Pipe Wrench', slug: 'pipe-wrench', price: 22.99, discount: null, brand: 'stanley', category: 'plumbing', stock: 55, is_featured: false, is_best_seller: false, is_new: false },
      { title: 'Plunger Professional Grade', slug: 'plunger-pro', price: 16.99, discount: null, brand: null, category: 'plumbing', stock: 90, is_featured: false, is_best_seller: true, is_new: false },
      { title: 'Tap & Die Set', slug: 'tap-die-set', price: 49.99, discount: 39.99, brand: 'stanley', category: 'plumbing', stock: 30, is_featured: true, is_best_seller: false, is_new: false },
      { title: 'PTFE Tape Roll', slug: 'ptfe-tape', price: 4.99, discount: null, brand: null, category: 'plumbing', stock: 200, is_featured: false, is_best_seller: true, is_new: false },

      // Paint
      { title: 'Premium Interior Paint Gallon', slug: 'interior-paint-gallon', price: 34.99, discount: 29.99, brand: null, category: 'paint-coatings', stock: 70, is_featured: true, is_best_seller: false, is_new: false },
      { title: 'Exterior Deck Stain', slug: 'deck-stain', price: 44.99, discount: null, brand: null, category: 'paint-coatings', stock: 45, is_featured: false, is_best_seller: false, is_new: true },
      { title: 'Paint Roller Kit', slug: 'paint-roller-kit', price: 19.99, discount: null, brand: null, category: 'paint-coatings', stock: 120, is_featured: false, is_best_seller: true, is_new: false },

      // Building Materials
      { title: '2x4 Lumber 8ft', slug: '2x4-lumber-8', price: 8.99, discount: null, brand: null, category: 'building-materials', stock: 500, is_featured: false, is_best_seller: true, is_new: false },
      { title: 'Drywall Sheet 4x8 5/8"', slug: 'drywall-4x8', price: 14.99, discount: null, brand: null, category: 'building-materials', stock: 300, is_featured: false, is_best_seller: false, is_new: false },
      { title: 'Concrete Screws 100pc', slug: 'concrete-screws-100', price: 12.99, discount: 9.99, brand: null, category: 'building-materials', stock: 150, is_featured: true, is_best_seller: false, is_new: false },

      // Garden
      { title: 'Garden Shovel', slug: 'garden-shovel', price: 19.99, discount: null, brand: 'stanley', category: 'garden', stock: 80, is_featured: false, is_best_seller: false, is_new: false },
      { title: 'Lawn Mower Electric', slug: 'lawn-mower-electric', price: 299.99, discount: 249.99, brand: 'makita', category: 'garden', stock: 20, is_featured: true, is_best_seller: false, is_new: true },
      { title: 'Garden Hose 50ft', slug: 'garden-hose-50', price: 29.99, discount: null, brand: null, category: 'garden', stock: 60, is_featured: false, is_best_seller: true, is_new: false },

      // Safety
      { title: 'Safety Glasses UV Block', slug: 'safety-glasses', price: 9.99, discount: null, brand: null, category: 'safety-equipment', stock: 200, is_featured: false, is_best_seller: true, is_new: false },
      { title: 'Work Gloves Nitrile Coated', slug: 'work-gloves-nitrile', price: 14.99, discount: 11.99, brand: null, category: 'safety-equipment', stock: 250, is_featured: true, is_best_seller: false, is_new: false },
      { title: 'Safety Helmet Hard Hat', slug: 'safety-helmet', price: 19.99, discount: null, brand: null, category: 'safety-equipment', stock: 100, is_featured: false, is_best_seller: false, is_new: false }
    ];

    for (const prod of products) {
      const brandId = prod.brand ? brandIds[prod.brand] : null;
      const catId = categoryIds[prod.category];
      const image = `https://via.placeholder.com/500?text=${prod.title.replace(/ /g, '+')}`;
      
      await db.query(
        `INSERT INTO products (title, slug, description, price, discount_price, brand, category, stock, image, is_featured, is_best_seller, is_new)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          prod.title,
          prod.slug,
          `High-quality ${prod.title}. Perfect for professionals and DIY enthusiasts.`,
          prod.price,
          prod.discount || null,
          brandId,
          catId,
          prod.stock,
          image,
          prod.is_featured,
          prod.is_best_seller,
          prod.is_new
        ]
      );
    }

    // Seed banners
    const banners = [
      { title: 'Summer Sale - 30% Off', image: 'https://via.placeholder.com/1200x300?text=Summer+Sale' },
      { title: 'New Power Tools Arrival', image: 'https://via.placeholder.com/1200x300?text=New+Tools' },
      { title: 'Free Shipping on Orders $50+', image: 'https://via.placeholder.com/1200x300?text=Free+Shipping' }
    ];

    for (let i = 0; i < banners.length; i++) {
      await db.query(
        'INSERT INTO banners (title, image, order_num, active) VALUES ($1,$2,$3,$4)',
        [banners[i].title, banners[i].image, i, true]
      );
    }

    // Seed users
    const adminPass = await bcrypt.hash('admin123', 10);
    const userPass = await bcrypt.hash('user123', 10);

    const { rows: adminRows } = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1,$2,$3,$4) RETURNING id`,
      ['Admin User', 'admin@infix.local', adminPass, 'admin']
    );

    const { rows: userRows } = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1,$2,$3,$4) RETURNING id`,
      ['John Doe', 'john@example.com', userPass, 'customer']
    );

    const userId = userRows[0].id;

    // Seed reviews
    const { rows: productRows } = await db.query('SELECT id FROM products LIMIT 5');
    for (const prod of productRows) {
      await db.query(
        `INSERT INTO product_reviews (product_id, user_id, rating, title, comment)
         VALUES ($1,$2,$3,$4,$5)`,
        [prod.id, userId, 5, 'Excellent product!', 'Great quality and fast delivery. Highly recommend!']
      );
      await db.query(
        `INSERT INTO product_reviews (product_id, user_id, rating, title, comment)
         VALUES ($1,$2,$3,$4,$5)`,
        [prod.id, userId, 4, 'Very good', 'Good value for money, works as expected.']
      );
    }

    console.log('✓ Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
