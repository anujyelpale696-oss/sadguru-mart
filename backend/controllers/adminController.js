const User = require('../models/User');
const Shop = require('../models/Shop');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get Admin Overview Stats & System Usage
// @route   GET /api/admin/overview
// @access  Private (Admin only)
exports.getAdminOverview = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'shopkeeper' });
    const activeUsers = await User.countDocuments({ role: 'shopkeeper', isActive: true });
    const totalShops = await Shop.countDocuments();
    const totalProductsInSystem = await Product.countDocuments();
    const totalSalesTransactions = await Sale.countDocuments();

    // Aggregated platform sales volume
    const salesTotalAgg = await Sale.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalProfit: { $sum: '$totalProfit' } } },
    ]);
    const platformTotalRevenue = salesTotalAgg[0] ? salesTotalAgg[0].totalRevenue : 0;

    // Daily, Weekly, Monthly Logins / Activity
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todayLogins = await ActivityLog.countDocuments({
      action: { $regex: 'Log', $options: 'i' },
      createdAt: { $gte: todayStart },
    });

    const weeklyActiveUsersCount = await User.countDocuments({
      role: 'shopkeeper',
      lastLogin: { $gte: weekAgo },
    });

    const monthlyActiveUsersCount = await User.countDocuments({
      role: 'shopkeeper',
      lastLogin: { $gte: monthAgo },
    });

    // 7 Days User Growth & Activity Trend
    const last7DaysData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const daySignups = await User.countDocuments({
        role: 'shopkeeper',
        createdAt: { $gte: dayStart, $lte: dayEnd },
      });

      const dayLogins = await ActivityLog.countDocuments({
        action: { $regex: 'Log', $options: 'i' },
        createdAt: { $gte: dayStart, $lte: dayEnd },
      });

      const daySalesCount = await Sale.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd },
      });

      last7DaysData.push({
        day: dayName,
        date: d.toISOString().slice(0, 10),
        signups: daySignups,
        logins: dayLogins,
        salesCount: daySalesCount,
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        totalShops,
        totalProductsInSystem,
        totalSalesTransactions,
        platformTotalRevenue,
        todayLogins,
        weeklyActiveUsers: weeklyActiveUsersCount,
        monthlyActiveUsers: monthlyActiveUsersCount,
      },
      charts: {
        usageTrend: last7DaysData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Registered Shopkeepers List
// @route   GET /api/admin/shopkeepers
// @access  Private (Admin only)
exports.getShopkeepers = async (req, res, next) => {
  try {
    const { search, status } = req.query;

    const query = { role: 'shopkeeper' };

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const shopkeepers = await User.find(query)
      .populate('shop')
      .sort({ createdAt: -1 });

    // Enhance each with product & sales counts
    const enrichedShopkeepers = await Promise.all(
      shopkeepers.map(async (u) => {
        const shopId = u.shop ? u.shop._id : null;
        let productCount = 0;
        let salesCount = 0;

        if (shopId) {
          productCount = await Product.countDocuments({ shop: shopId });
          salesCount = await Sale.countDocuments({ shop: shopId });
        }

        return {
          id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          isActive: u.isActive,
          role: u.role,
          lastLogin: u.lastLogin,
          createdAt: u.createdAt,
          shop: u.shop
            ? {
                id: u.shop._id,
                name: u.shop.name,
                address: u.shop.address,
                phone: u.shop.phone,
                gstNumber: u.shop.gstNumber,
              }
            : null,
          productCount,
          salesCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedShopkeepers.length,
      shopkeepers: enrichedShopkeepers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Shopkeeper Active Status (Activate / Deactivate)
// @route   PUT /api/admin/shopkeepers/:id/status
// @access  Private (Admin only)
exports.toggleShopkeeperStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot deactivate admin accounts' });
    }

    user.isActive = req.body.isActive !== undefined ? req.body.isActive : !user.isActive;
    await user.save();

    if (user.shop) {
      await Shop.findByIdAndUpdate(user.shop, {
        status: user.isActive ? 'active' : 'inactive',
      });
    }

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      action: `Admin ${user.isActive ? 'Activated' : 'Deactivated'} User Account`,
      module: 'Admin',
      details: `User: ${user.name} (${user.email})`,
    });

    res.status(200).json({
      success: true,
      message: `Shopkeeper account successfully ${user.isActive ? 'activated' : 'deactivated'}`,
      isActive: user.isActive,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get System Audit / Activity Logs
// @route   GET /api/admin/activity-logs
// @access  Private (Admin only)
exports.getActivityLogs = async (req, res, next) => {
  try {
    const { module, limit = 50 } = req.query;
    const query = {};
    if (module && module !== 'All') {
      query.module = module;
    }

    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('user', 'name email role')
      .populate('shop', 'name');

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};
