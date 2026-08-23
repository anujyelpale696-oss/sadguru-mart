const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getProfitLossReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard-summary', getDashboardSummary);
router.get('/profit-loss', getProfitLossReport);

module.exports = router;
