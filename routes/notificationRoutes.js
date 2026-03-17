const express = require('express');
const { sendNextDayMealSummary } = require('../controllers/notificationController');
const { protectAdminOrCron } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/next-day-meals', protectAdminOrCron, sendNextDayMealSummary);
router.post('/next-day-meals', protectAdminOrCron, sendNextDayMealSummary);

module.exports = router;
