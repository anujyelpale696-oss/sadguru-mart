const Product = require('../models/Product');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all products for logged-in shopkeeper
// @route   GET /api/products
// @access  Private (Shopkeeper)
exports.getProducts = async (req, res, next) => {
  try {
    const { search, category, status, sortBy, order } = req.query;

    const query = { shop: req.user.shop, isActive: true };

    // Search by name, SKU or brand
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    let sortOptions = { createdAt: -1 };
    if (sortBy) {
      sortOptions = { [sortBy]: order === 'asc' ? 1 : -1 };
    }

    let products = await Product.find(query).sort(sortOptions).populate('supplier');

    // Filter by stock status if requested
    if (status) {
      if (status === 'Out of Stock') {
        products = products.filter((p) => p.currentStock <= 0);
      } else if (status === 'Low Stock') {
        products = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStockLevel);
      } else if (status === 'In Stock') {
        products = products.filter((p) => p.currentStock > p.minStockLevel);
      }
    }

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private (Shopkeeper)
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      shop: req.user.shop,
    }).populate('supplier');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Shopkeeper)
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      sku,
      category,
      brand,
      purchasePrice,
      sellingPrice,
      currentStock,
      minStockLevel,
      unit,
      supplier,
      supplierName,
      imageUrl,
      expiryDate,
      description,
    } = req.body;

    if (!name || !category || purchasePrice === undefined || sellingPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product name, category, purchase price, and selling price.',
      });
    }

    // Auto-generate SKU if not provided
    const productSku = sku || `SKU-${Date.now().toString().slice(-6)}`;

    // Check SKU duplicate within this shop
    const existingSku = await Product.findOne({ shop: req.user.shop, sku: productSku });
    if (existingSku) {
      return res.status(400).json({
        success: false,
        message: `A product with SKU '${productSku}' already exists in your inventory.`,
      });
    }

    const product = await Product.create({
      shop: req.user.shop,
      name,
      sku: productSku,
      category,
      brand: brand || '',
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      currentStock: Number(currentStock || 0),
      minStockLevel: Number(minStockLevel !== undefined ? minStockLevel : 5),
      unit: unit || 'pcs',
      supplier: supplier || null,
      supplierName: supplierName || '',
      imageUrl: imageUrl || '',
      expiryDate: expiryDate || null,
      description: description || '',
    });

    // Check if initial stock is low or out of stock
    if (product.currentStock <= 0) {
      await Notification.create({
        shop: req.user.shop,
        title: 'Out of Stock Alert',
        message: `Product "${product.name}" was added with 0 stock.`,
        type: 'danger',
        link: '/dashboard/inventory',
      });
    } else if (product.currentStock <= product.minStockLevel) {
      await Notification.create({
        shop: req.user.shop,
        title: 'Low Stock Alert',
        message: `Product "${product.name}" has stock (${product.currentStock} ${product.unit}) at or below minimum level (${product.minStockLevel}).`,
        type: 'warning',
        link: '/dashboard/inventory',
      });
    }

    await ActivityLog.create({
      user: req.user._id,
      shop: req.user.shop,
      userName: req.user.name,
      action: 'Added Product',
      module: 'Product',
      details: `${product.name} (SKU: ${product.sku})`,
    });

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Shopkeeper)
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findOne({
      _id: req.params.id,
      shop: req.user.shop,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const updates = { ...req.body };
    if (updates.purchasePrice !== undefined) updates.purchasePrice = Number(updates.purchasePrice);
    if (updates.sellingPrice !== undefined) updates.sellingPrice = Number(updates.sellingPrice);
    if (updates.currentStock !== undefined) updates.currentStock = Number(updates.currentStock);
    if (updates.minStockLevel !== undefined) updates.minStockLevel = Number(updates.minStockLevel);

    // If SKU changed, check uniqueness in shop
    if (updates.sku && updates.sku !== product.sku) {
      const existing = await Product.findOne({
        shop: req.user.shop,
        sku: updates.sku,
        _id: { $ne: product._id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `SKU '${updates.sku}' is already used by another product.`,
        });
      }
    }

    product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    await ActivityLog.create({
      user: req.user._id,
      shop: req.user.shop,
      userName: req.user.name,
      action: 'Updated Product',
      module: 'Product',
      details: `${product.name} (SKU: ${product.sku})`,
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (soft delete or hard delete)
// @route   DELETE /api/products/:id
// @access  Private (Shopkeeper)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      shop: req.user.shop,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await ActivityLog.create({
      user: req.user._id,
      shop: req.user.shop,
      userName: req.user.name,
      action: 'Deleted Product',
      module: 'Product',
      details: `${product.name} (SKU: ${product.sku})`,
    });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock and out of stock products
// @route   GET /api/products/alerts/low-stock
// @access  Private (Shopkeeper)
exports.getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      shop: req.user.shop,
      isActive: true,
      $expr: { $lte: ['$currentStock', '$minStockLevel'] },
    }).sort({ currentStock: 1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product categories
// @route   GET /api/products/meta/categories
// @access  Private (Shopkeeper)
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category', { shop: req.user.shop });
    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};
