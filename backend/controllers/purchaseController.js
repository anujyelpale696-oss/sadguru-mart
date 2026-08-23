const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all purchases for shopkeeper
// @route   GET /api/purchases
// @access  Private (Shopkeeper)
exports.getPurchases = async (req, res, next) => {
  try {
    const { search, supplierId, startDate, endDate, limit = 100 } = req.query;

    const query = { shop: req.user.shop };

    if (supplierId) {
      query.supplier = supplierId;
    }

    if (startDate || endDate) {
      query.purchaseDate = {};
      if (startDate) query.purchaseDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.purchaseDate.$lte = end;
      }
    }

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { supplierName: { $regex: search, $options: 'i' } },
        { 'items.name': { $regex: search, $options: 'i' } },
      ];
    }

    const purchases = await Purchase.find(query)
      .sort({ purchaseDate: -1 })
      .limit(Number(limit))
      .populate('supplier');

    let totalPurchaseAmount = 0;
    purchases.forEach((p) => {
      totalPurchaseAmount += p.totalAmount || 0;
    });

    res.status(200).json({
      success: true,
      count: purchases.length,
      totalPurchaseAmount,
      purchases,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create purchase (Stock Inflow from Supplier)
// @route   POST /api/purchases
// @access  Private (Shopkeeper)
exports.createPurchase = async (req, res, next) => {
  try {
    const {
      supplier,
      supplierName,
      invoiceNumber,
      items,
      paymentStatus = 'Paid',
      paymentMethod = 'Cash',
      purchaseDate,
      notes,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least one product item to the purchase.',
      });
    }

    let calculatedItems = [];
    let grandTotal = 0;

    for (const item of items) {
      const product = await Product.findOne({
        _id: item.productId || item.product,
        shop: req.user.shop,
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product "${item.name || 'Unknown'}" not found in your inventory.`,
        });
      }

      const qty = Number(item.quantity);
      const purchasePrice = Number(item.purchasePrice || product.purchasePrice);

      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for product "${product.name}".`,
        });
      }

      const itemTotal = qty * purchasePrice;

      calculatedItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity: qty,
        unit: product.unit,
        purchasePrice,
        totalAmount: itemTotal,
      });

      grandTotal += itemTotal;
    }

    // Generate invoice number if not provided
    const invNo = invoiceNumber || `PUR-${Date.now().toString().slice(-6)}`;

    // Increment inventory stock
    for (const item of calculatedItems) {
      const product = await Product.findById(item.product);
      product.currentStock += item.quantity;
      if (item.purchasePrice > 0) {
        product.purchasePrice = item.purchasePrice;
      }
      await product.save();
    }

    // Resolve supplier name if supplier ID provided
    let finalSupplierName = supplierName || 'Direct Vendor';
    if (supplier) {
      const supDoc = await Supplier.findOne({ _id: supplier, shop: req.user.shop });
      if (supDoc) {
        finalSupplierName = supDoc.name + (supDoc.company ? ` (${supDoc.company})` : '');
      }
    }

    const purchase = await Purchase.create({
      shop: req.user.shop,
      invoiceNumber: invNo,
      supplier: supplier || null,
      supplierName: finalSupplierName,
      items: calculatedItems,
      totalAmount: grandTotal,
      paymentStatus,
      paymentMethod,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      notes: notes || '',
    });

    await Notification.create({
      shop: req.user.shop,
      title: 'New Stock Received 📦',
      message: `Purchase invoice ${invNo} recorded from ${finalSupplierName}. Total stock added: ₹${grandTotal.toLocaleString('en-IN')}`,
      type: 'success',
      link: '/dashboard/inventory',
    });

    await ActivityLog.create({
      user: req.user._id,
      shop: req.user.shop,
      userName: req.user.name,
      action: 'Recorded Purchase',
      module: 'Purchase',
      details: `Invoice: ${invNo} | Supplier: ${finalSupplierName} | ₹${grandTotal.toLocaleString('en-IN')}`,
    });

    res.status(201).json({
      success: true,
      message: 'Purchase recorded and inventory updated successfully',
      purchase,
    });
  } catch (error) {
    next(error);
  }
};
