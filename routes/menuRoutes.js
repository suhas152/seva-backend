const express = require('express');
const router = express.Router();
const { getMenus, createOrUpdateMenu } = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getMenus);
router.post('/', protect, authorize('admin', 'cook'), createOrUpdateMenu);

module.exports = router;
