const Expense = require('../models/Expense');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all expenses for shopkeeper
// @route   GET /api/expenses
// @access  Private (Shopkeeper)
exports.getExpenses = async (req, res, next) => {
  try {
    const { category, startDate, endDate, search } = req.query;

    const query = { shop: req.user.shop };

    if (category && category !== 'All') {
      query.category = category;
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
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const expenses = await Expense.find(query).sort({ date: -1 });

    let totalAmount = 0;
    const categoryTotals = {};

    expenses.forEach((e) => {
      totalAmount += e.amount;
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    res.status(200).json({
      success: true,
      count: expenses.length,
      totalAmount,
      categoryTotals,
      expenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private (Shopkeeper)
exports.createExpense = async (req, res, next) => {
  try {
    const { title, category, amount, paymentMethod, date, description } = req.body;

    if (!title || !category || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide expense title, category, and amount.',
      });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid expense amount.',
      });
    }

    const expense = await Expense.create({
      shop: req.user.shop,
      title,
      category,
      amount: numAmount,
      paymentMethod: paymentMethod || 'Cash',
      date: date ? new Date(date) : new Date(),
      description: description || '',
    });

    await ActivityLog.create({
      user: req.user._id,
      shop: req.user.shop,
      userName: req.user.name,
      action: 'Recorded Expense',
      module: 'Expense',
      details: `${title} (${category}): ₹${numAmount.toLocaleString('en-IN')}`,
    });

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private (Shopkeeper)
exports.updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findOne({ _id: req.params.id, shop: req.user.shop });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private (Shopkeeper)
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      shop: req.user.shop,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
