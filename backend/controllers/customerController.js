const Customer = require('../models/Customer');
const Sale = require('../models/Sale');

// @desc    Get all customers for shopkeeper
// @route   GET /api/customers
// @access  Private (Shopkeeper)
exports.getCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { shop: req.user.shop };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single customer & purchase history
// @route   GET /api/customers/:id
// @access  Private (Shopkeeper)
exports.getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, shop: req.user.shop });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const salesHistory = await Sale.find({ customer: customer._id, shop: req.user.shop }).sort({
      date: -1,
    });

    res.status(200).json({
      success: true,
      customer,
      salesHistory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create customer
// @route   POST /api/customers
// @access  Private (Shopkeeper)
exports.createCustomer = async (req, res, next) => {
  try {
    const { name, phone, email, address, notes } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Customer name is required' });
    }

    const customer = await Customer.create({
      shop: req.user.shop,
      name,
      phone: phone || '',
      email: email || '',
      address: address || '',
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Customer added successfully',
      customer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private (Shopkeeper)
exports.updateCustomer = async (req, res, next) => {
  try {
    let customer = await Customer.findOne({ _id: req.params.id, shop: req.user.shop });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      customer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private (Shopkeeper)
exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, shop: req.user.shop });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
