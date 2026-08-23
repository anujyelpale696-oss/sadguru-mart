const Product = require('../models/Product');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get complete inventory summary & table
// @route   GET /api/inventory
// @access  Private (Shopkeeper)
exports.getInventory = async (req, res, next) => {
  try {
    const products = await Product.find({ shop: req.user.shop, isActive: true })
      .populate('supplier')
      .sort({ currentStock: 1 });

    let totalProducts = products.length;
    let totalStockUnits = 0;
    let totalInventoryCost = 0;
    let totalInventoryValue = 0;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      totalStockUnits += p.currentStock;
      totalInventoryCost += p.currentStock * p.purchasePrice;
      totalInventoryValue += p.currentStock * p.sellingPrice;

      if (p.currentStock <= 0) {
        outOfStockCount++;
      } else if (p.currentStock <= p.minStockLevel) {
        lowStockCount++;
      } else {
        inStockCount++;
      }
    });

    const potentialProfit = totalInventoryValue - totalInventoryCost;

    res.status(200).json({
      success: true,
      summary: {
        totalProducts,
        totalStockUnits,
        totalInventoryCost,
        totalInventoryValue,
        potentialProfit,
        inStockCount,
        lowStockCount,
        outOfStockCount,
      },
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Adjust product stock (Add Stock / Manual adjustment)
// @route   POST /api/inventory/adjust
// @access  Private (Shopkeeper)
exports.adjustStock = async (req, res, next) => {
  try {
    const { productId, adjustmentType, quantity, reason, purchasePrice } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and quantity are required.',
      });
    }

    const product = await Product.findOne({ _id: productId, shop: req.user.shop });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in your shop inventory.',
      });
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number.',
      });
    }

    const previousStock = product.currentStock;
    let newStock = previousStock;

    if (adjustmentType === 'add') {
      newStock += qty;
    } else if (adjustmentType === 'subtract') {
      if (previousStock < qty) {
        return res.status(400).json({
          success: false,
          message: `Cannot subtract ${qty} units. Current stock is only ${previousStock} units.`,
        });
      }
      newStock -= qty;
    } else if (adjustmentType === 'set') {
      newStock = qty;
    }

    product.currentStock = newStock;
    if (purchasePrice !== undefined && purchasePrice !== null && Number(purchasePrice) > 0) {
      product.purchasePrice = Number(purchasePrice);
    }
    await product.save();

    // Check alerts
    if (newStock <= 0) {
      await Notification.create({
        shop: req.user.shop,
        title: 'Out of Stock Alert ❌',
        message: `Product "${product.name}" is now out of stock!`,
        type: 'danger',
        link: '/dashboard/inventory',
      });
    } else if (newStock <= product.minStockLevel) {
      await Notification.create({
        shop: req.user.shop,
        title: 'Low Stock Alert ⚠️',
        message: `Product "${product.name}" is running low (${newStock} ${product.unit} left).`,
        type: 'warning',
        link: '/dashboard/inventory',
      });
    } else if (adjustmentType === 'add') {
      await Notification.create({
        shop: req.user.shop,
        title: 'Stock Added 📦',
        message: `Added ${qty} ${product.unit} to "${product.name}". Updated stock: ${newStock} ${product.unit}.`,
        type: 'success',
        link: '/dashboard/inventory',
      });
    }

    await ActivityLog.create({
      user: req.user._id,
      shop: req.user.shop,
      userName: req.user.name,
      action: 'Adjusted Stock',
      module: 'Inventory',
      details: `${product.name}: ${previousStock} -> ${newStock} (${adjustmentType} ${qty}) Reason: ${reason || 'Manual Adjustment'}`,
    });

    res.status(200).json({
      success: true,
      message: `Stock updated successfully. Current stock: ${newStock} ${product.unit}`,
      product,
    });
  } catch (error) {
    next(error);
  }
};
