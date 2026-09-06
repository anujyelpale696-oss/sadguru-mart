const Supplier = require('../models/Supplier');
const Purchase = require('../models/Purchase');

// @desc    Get all suppliers for shopkeeper
// @route   GET /api/suppliers
// @access  Private (Shopkeeper)
exports.getSuppliers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { shop: req.user.shop };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { productsSupplied: { $regex: search, $options: 'i' } },
      ];
    }

    const suppliers = await Supplier.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: suppliers.length,
      suppliers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single supplier & purchase history
// @route   GET /api/suppliers/:id
// @access  Private (Shopkeeper)
exports.getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findOne({ _id: req.params.id, shop: req.user.shop });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const purchases = await Purchase.find({ supplier: supplier._id, shop: req.user.shop }).sort({
      purchaseDate: -1,
    });

    res.status(200).json({
      success: true,
      supplier,
      purchases,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private (Shopkeeper)
exports.createSupplier = async (req, res, next) => {
  try {
    const { name, company, phone, email, address, productsSupplied, gstNumber } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Supplier name is required' });
    }

    const supplier = await Supplier.create({
      shop: req.user.shop,
      name,
      company: company || '',
      phone: phone || '',
      email: email || '',
      address: address || '',
      productsSupplied: productsSupplied || '',
      gstNumber: gstNumber || '',
    });

    res.status(201).json({
      success: true,
      message: 'Supplier added successfully',
      supplier,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private (Shopkeeper)
exports.updateSupplier = async (req, res, next) => {
  try {
    let supplier = await Supplier.findOne({ _id: req.params.id, shop: req.user.shop });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    supplier = await Supplier.findOneAndUpdate(
      { _id: req.params.id, shop: req.user.shop },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      supplier,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (Shopkeeper)
exports.deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findOneAndDelete({ _id: req.params.id, shop: req.user.shop });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
