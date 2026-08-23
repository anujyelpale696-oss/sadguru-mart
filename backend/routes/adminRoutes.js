const express = require('express');
const router = express.Router();
const {
  getAdminOverview,
  getShopkeepers,
  toggleShopkeeperStatus,
  getActivityLogs,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// All admin routes require login + admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/overview', getAdminOverview);
router.get('/shopkeepers', getShopkeepers);
router.put('/shopkeepers/:id/status', toggleShopkeeperStatus);
router.get('/activity-logs', getActivityLogs);

module.exports = router;
