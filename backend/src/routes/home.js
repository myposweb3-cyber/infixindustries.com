const express = require('express');
const router = express.Router();
const { getFeatured, getNewArrivals, getBestSellers, getBanners, getCategories, getCategory, getBrands, getHeroSlides } = require('../controllers/homeController');

router.get('/featured', getFeatured);
router.get('/new-arrivals', getNewArrivals);
router.get('/best-sellers', getBestSellers);
router.get('/banners', getBanners);
router.get('/hero-slides', getHeroSlides);
router.get('/categories', getCategories);
router.get('/categories/:slug', getCategory);
router.get('/brands', getBrands);

// Alias for public categories endpoint - used by admin panel
router.get('/', (req, res) => res.json({ message: 'Home API' }));

module.exports = router;
