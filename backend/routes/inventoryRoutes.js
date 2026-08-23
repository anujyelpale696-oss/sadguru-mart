const express = require('express');
const router = express.Router();
const { getInventory, adjustStock } = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getInventory);
router.post('/adjust', adjustStock);

module.exports = router;
