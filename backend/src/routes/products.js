const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const upload = require('../middleware/multer');

router.get('/', productCtrl.list);
router.get('/slug/:slug', productCtrl.getBySlug);
router.get('/:id', productCtrl.getById);

// Protected routes for admins
router.post('/', authenticate, authorize('admin'), upload.single('image'), productCtrl.create);
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), productCtrl.update);
router.delete('/:id', authenticate, authorize('admin'), productCtrl.remove);

module.exports = router;
