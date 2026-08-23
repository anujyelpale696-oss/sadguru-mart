const User = require('../models/User');
const Shop = require('../models/Shop');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

// @desc    Register a new Shopkeeper & Create Shop
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, shopName, shopAddress, gstNumber } = req.body;

    if (!name || !email || !password || !shopName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Name, Email, Password, and Shop Name.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in.',
      });
    }

    // Create Shop first
    const shop = await Shop.create({
      name: shopName,
      email: email.toLowerCase(),
      phone: phone || '',
      address: shopAddress || '',
      gstNumber: gstNumber || '',
    });

    // Create User
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: 'shopkeeper',
      shop: shop._id,
      lastLogin: new Date(),
    });

    // Update shop owner
    shop.owner = user._id;
    await shop.save();

    // Create welcome notification
    await Notification.create({
      shop: shop._id,
      user: user._id,
      title: 'Welcome to Sadguru Mart! 🎉',
      message: `Welcome, ${name}! Your store '${shopName}' is ready. Start by adding your first product or exploring sample inventory.`,
      type: 'success',
      link: '/dashboard/products',
    });

    // Log Activity
    await ActivityLog.create({
      user: user._id,
      shop: shop._id,
      userName: user.name,
      userEmail: user.email,
      action: 'Registered new shopkeeper account',
      module: 'Auth',
      details: `Shop: ${shopName}`,
      ip: req.ip,
    });

    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      shop: {
        id: shop._id,
        name: shop.name,
        address: shop.address,
        phone: shop.phone,
        currency: shop.currency,
        currencySymbol: shop.currencySymbol,
        gstNumber: shop.gstNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Shopkeeper / Standard Login
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('shop');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    await ActivityLog.create({
      user: user._id,
      shop: user.shop ? user.shop._id : null,
      userName: user.name,
      userEmail: user.email,
      action: 'User Logged In',
      module: 'Auth',
      ip: req.ip,
    });

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      shop: user.shop
        ? {
            id: user.shop._id,
            name: user.shop.name,
            address: user.shop.address,
            phone: user.shop.phone,
            currency: user.shop.currency,
            currencySymbol: user.shop.currencySymbol,
            gstNumber: user.shop.gstNumber,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Login
// @route   POST /api/auth/admin-login
// @access  Public
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.',
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This account does not possess administrator privileges.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    await ActivityLog.create({
      user: user._id,
      userName: user.name,
      userEmail: user.email,
      action: 'Admin Logged In',
      module: 'Admin',
      ip: req.ip,
    });

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user & shop details
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('shop');

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        lastLogin: user.lastLogin,
      },
      shop: user.shop,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile & shop information
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, shopName, shopAddress, gstNumber } = req.body;

    const user = await User.findById(req.user.id);
    if (name) user.name = name;
    if (phone) user.phone = phone;
    await user.save();

    let updatedShop = null;
    if (user.shop) {
      const shop = await Shop.findById(user.shop);
      if (shop) {
        if (shopName) shop.name = shopName;
        if (shopAddress !== undefined) shop.address = shopAddress;
        if (gstNumber !== undefined) shop.gstNumber = gstNumber;
        if (phone) shop.phone = phone;
        await shop.save();
        updatedShop = shop;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      shop: updatedShop,
    });
  } catch (error) {
    next(error);
  }
};
