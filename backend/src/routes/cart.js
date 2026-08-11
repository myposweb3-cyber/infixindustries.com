const express = require('express');
const router = express.Router();
const cart = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, cart.getCart);
router.post('/', authenticate, cart.addItem);
router.put('/:id', authenticate, cart.updateItem);
router.delete('/:id', authenticate, cart.removeItem);

module.exports = router;
