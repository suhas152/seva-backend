const express = require('express');
const router = express.Router();
const { checkout, checkin, getLogs } = require('../controllers/movementController');
const { protect } = require('../middleware/authMiddleware');

router.post('/checkout', protect, checkout);
router.put('/checkin', protect, checkin);
router.get('/', protect, getLogs);

module.exports = router;
