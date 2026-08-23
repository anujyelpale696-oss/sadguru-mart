const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all sales for shopkeeper with filters
// @route   GET /api/sales
// @access  Private (Shopkeeper)
exports.getSales = async (req, res, next) => {
  try {
    const { search, paymentMethod, startDate, endDate, customerId, limit = 100 } = req.query;

    const query = { shop: req.user.shop };

    if (paymentMethod && paymentMethod !== 'All') {
      query.paymentMethod = paymentMethod;
    }

    if (customerId) {
      query.customer = customerId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { 'items.name': { $regex: search, $options: 'i' } },
      ];
    }

    const sales = await Sale.find(query)
      .sort({ date: -1 })
      .limit(Number(limit))
      .populate('customer');

    // Aggregate metrics
    let totalSalesCount = sales.length;
    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;

    sales.forEach((s) => {
      totalRevenue += s.totalAmount || 0;
      totalCost += s.totalCost || 0;
      totalProfit += s.totalProfit || 0;
    });

    res.status(200).json({
      success: true,
      count: totalSalesCount,
      summary: {
        totalSalesCount,
        totalRevenue,
        totalCost,
        totalProfit,
      },
      sales,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Private (Shopkeeper)
exports.getSaleById = async (req, res, next) => {
  try {
    const sale = await Sale.findOne({
      _id: req.params.id,
      shop: req.user.shop,
    }).populate('customer');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale transaction not found',
      });
    }

    res.status(200).json({
      success: true,
      sale,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new Sale (POS Terminal / Record Sale)
// @route   POST /api/sales
// @access  Private (Shopkeeper)
exports.createSale = async (req, res, next) => {
  try {
    const {
      customer,
      customerName,
      customerPhone,
      items,
      paymentMethod,
      discount = 0,
      tax = 0,
      notes,
      date,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least one product item to the sale.',
      });
    }

    let calculatedItems = [];
    let grandRevenue = 0;
    let grandCost = 0;
    let grandProfit = 0;

    // Validate each item and check inventory stock
    for (const item of items) {
      const product = await Product.findOne({
        _id: item.productId || item.product,
        shop: req.user.shop,
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product "${item.name || 'Unknown'}" not found in inventory.`,
        });
      }

      const qty = Number(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for product "${product.name}".`,
        });
      }

      if (product.currentStock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Requested: ${qty} ${product.unit}, Available in stock: ${product.currentStock} ${product.unit}.`,
        });
      }

      const sellingPrice = item.sellingPrice !== undefined ? Number(item.sellingPrice) : product.sellingPrice;
      const purchasePrice = item.purchasePrice !== undefined ? Number(item.purchasePrice) : product.purchasePrice;

      const itemRevenue = sellingPrice * qty;
      const itemCost = purchasePrice * qty;
      const itemProfit = itemRevenue - itemCost;

      calculatedItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity: qty,
        unit: product.unit,
        purchasePrice,
        sellingPrice,
        totalCost: itemCost,
        totalRevenue: itemRevenue,
        profit: itemProfit,
      });

      grandRevenue += itemRevenue;
      grandCost += itemCost;
      grandProfit += itemProfit;
    }

    // Apply overall discount & tax
    const numDiscount = Number(discount) || 0;
    const numTax = Number(tax) || 0;
    const finalAmount = Math.max(0, grandRevenue - numDiscount + numTax);
    const finalProfit = grandProfit - numDiscount;

    // Generate unique invoice number: INV-YYMMDD-XXXX
    const now = new Date();
    const datePrefix = now.toISOString().slice(2, 10).replace(/-/g, '');
    const countToday = await Sale.countDocuments({ shop: req.user.shop });
    const invoiceNumber = `INV-${datePrefix}-${String(countToday + 1).padStart(4, '0')}`;

    // Deduct stock for all items
    for (const item of calculatedItems) {
      const product = await Product.findById(item.product);
      product.currentStock -= item.quantity;
      await product.save();

      // Check stock status & trigger notification
      if (product.currentStock <= 0) {
        await Notification.create({
          shop: req.user.shop,
          title: 'Out of Stock Alert ❌',
          message: `Product "${product.name}" is now out of stock after sale ${invoiceNumber}!`,
          type: 'danger',
          link: '/dashboard/inventory',
        });
      } else if (product.currentStock <= product.minStockLevel) {
        await Notification.create({
          shop: req.user.shop,
          title: 'Low Stock Alert ⚠️',
          message: `Product "${product.name}" is running low (${product.currentStock} ${product.unit} remaining).`,
          type: 'warning',
          link: '/dashboard/inventory',
        });
      }
    }

    // Update customer total purchases if customer is linked
    if (customer) {
      const customerDoc = await Customer.findOne({ _id: customer, shop: req.user.shop });
      if (customerDoc) {
        customerDoc.totalPurchases = (customerDoc.totalPurchases || 0) + finalAmount;
        await customerDoc.save();
      }
    }

    // Create Sale record
    const sale = await Sale.create({
      shop: req.user.shop,
      invoiceNumber,
      customer: customer || null,
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || '',
      items: calculatedItems,
      totalAmount: finalAmount,
      totalCost: grandCost,
      totalProfit: finalProfit,
      paymentMethod: paymentMethod || 'Cash',
      paymentStatus: 'Paid',
      discount: numDiscount,
      tax: numTax,
      date: date ? new Date(date) : new Date(),
      notes: notes || '',
    });

    await ActivityLog.create({
      user: req.user._id,
      shop: req.user.shop,
      userName: req.user.name,
      action: 'Recorded Sale',
      module: 'Sale',
      details: `Invoice: ${invoiceNumber} | ₹${finalAmount.toLocaleString('en-IN')} | Profit: ₹${finalProfit.toLocaleString('en-IN')}`,
    });

    res.status(201).json({
      success: true,
      message: 'Sale recorded successfully',
      sale,
    });
  } catch (error) {
    next(error);
  }
};
