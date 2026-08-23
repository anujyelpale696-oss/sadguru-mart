const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');
const Customer = require('../models/Customer');

// Helper to get start and end of periods
const getDateRanges = () => {
  const now = new Date();

  // Today
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // This Week (Sunday to Saturday or last 7 days)
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  // This Month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // This Year
  const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0);

  return { todayStart, todayEnd, weekStart, monthStart, monthEnd, yearStart, now };
};

// @desc    Get Shopkeeper Main Dashboard Summary & Charts
// @route   GET /api/reports/dashboard-summary
// @access  Private (Shopkeeper)
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const shopId = req.user.shop;
    const { todayStart, todayEnd, weekStart, monthStart, yearStart } = getDateRanges();

    // 1. Total Products & Stock Status
    const products = await Product.find({ shop: shopId, isActive: true });
    const totalProducts = products.length;
    let totalStock = 0;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const lowStockAlerts = [];

    products.forEach((p) => {
      totalStock += p.currentStock;
      if (p.currentStock <= 0) {
        outOfStockCount++;
        lowStockAlerts.push(p);
      } else if (p.currentStock <= p.minStockLevel) {
        lowStockCount++;
        lowStockAlerts.push(p);
      } else {
        inStockCount++;
      }
    });

    // 2. Customers
    const totalCustomers = await Customer.countDocuments({ shop: shopId });

    // 3. Today's Sales, Revenue, Cost, Profit
    const todaySales = await Sale.find({
      shop: shopId,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    let todaySalesCount = todaySales.length;
    let todayRevenue = 0;
    let todayCost = 0;
    let todayGrossProfit = 0;

    todaySales.forEach((s) => {
      todayRevenue += s.totalAmount || 0;
      todayCost += s.totalCost || 0;
      todayGrossProfit += s.totalProfit || 0;
    });

    // Today's Expenses
    const todayExpensesList = await Expense.find({
      shop: shopId,
      date: { $gte: todayStart, $lte: todayEnd },
    });
    let todayExpenses = 0;
    todayExpensesList.forEach((e) => {
      todayExpenses += e.amount;
    });

    const todayNetProfit = todayGrossProfit - todayExpenses;

    // 4. Weekly & Monthly Sales Totals
    const weekSales = await Sale.find({
      shop: shopId,
      date: { $gte: weekStart },
    });
    let weekRevenue = 0;
    let weekProfit = 0;
    weekSales.forEach((s) => {
      weekRevenue += s.totalAmount || 0;
      weekProfit += s.totalProfit || 0;
    });

    const monthSales = await Sale.find({
      shop: shopId,
      date: { $gte: monthStart },
    });
    let monthRevenue = 0;
    let monthProfit = 0;
    monthSales.forEach((s) => {
      monthRevenue += s.totalAmount || 0;
      monthProfit += s.totalProfit || 0;
    });

    // 5. Chart 1: Last 7 Days Daily Sales & Profit
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      last7Days.push({
        dayName,
        dateStr: d.toISOString().slice(0, 10),
        dayStart,
        dayEnd,
      });
    }

    const salesTrend7Days = await Promise.all(
      last7Days.map(async (day) => {
        const daySales = await Sale.find({
          shop: shopId,
          date: { $gte: day.dayStart, $lte: day.dayEnd },
        });

        let revenue = 0;
        let profit = 0;
        let count = daySales.length;

        daySales.forEach((s) => {
          revenue += s.totalAmount || 0;
          profit += s.totalProfit || 0;
        });

        const dayExpenses = await Expense.find({
          shop: shopId,
          date: { $gte: day.dayStart, $lte: day.dayEnd },
        });
        let expenses = 0;
        dayExpenses.forEach((e) => (expenses += e.amount));

        return {
          day: day.dayName,
          date: day.dateStr,
          revenue,
          profit: profit - expenses,
          count,
        };
      })
    );

    // 6. Chart 4: Sales Category Distribution
    const categorySalesMap = {};
    monthSales.forEach((s) => {
      s.items.forEach((item) => {
        // Find category from products map if possible or lookup
        categorySalesMap[item.name] = (categorySalesMap[item.name] || 0) + item.totalRevenue;
      });
    });

    const categoryDistribution = Object.entries(categorySalesMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // 7. Recent 5 Sales
    const recentSales = await Sale.find({ shop: shopId })
      .sort({ date: -1 })
      .limit(5)
      .populate('customer');

    res.status(200).json({
      success: true,
      metrics: {
        totalProducts,
        totalStock,
        todaySales: todaySalesCount,
        todayRevenue,
        todayExpenses,
        todayProfit: todayNetProfit,
        lowStockProducts: lowStockCount + outOfStockCount,
        totalCustomers,
        weekRevenue,
        weekProfit,
        monthRevenue,
        monthProfit,
      },
      charts: {
        salesTrend7Days,
        inventoryStatus: {
          inStock: inStockCount,
          lowStock: lowStockCount,
          outOfStock: outOfStockCount,
        },
        categoryDistribution,
      },
      recentSales,
      lowStockAlerts: lowStockAlerts.slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Detailed Profit & Loss Report
// @route   GET /api/reports/profit-loss
// @access  Private (Shopkeeper)
exports.getProfitLossReport = async (req, res, next) => {
  try {
    const shopId = req.user.shop;
    const { period = 'month', startDate, endDate } = req.query;
    const { todayStart, todayEnd, weekStart, monthStart, yearStart } = getDateRanges();

    let queryDate = {};

    if (startDate && endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      queryDate = { $gte: new Date(startDate), $lte: end };
    } else if (period === 'today') {
      queryDate = { $gte: todayStart, $lte: todayEnd };
    } else if (period === 'week') {
      queryDate = { $gte: weekStart };
    } else if (period === 'month') {
      queryDate = { $gte: monthStart };
    } else if (period === 'year') {
      queryDate = { $gte: yearStart };
    }

    const sales = await Sale.find({ shop: shopId, date: queryDate });
    const expenses = await Expense.find({ shop: shopId, date: queryDate });

    let totalRevenue = 0;
    let totalCost = 0;
    let grossProfit = 0;

    sales.forEach((s) => {
      totalRevenue += s.totalAmount || 0;
      totalCost += s.totalCost || 0;
      grossProfit += s.totalProfit || 0;
    });

    let totalExpenses = 0;
    const expenseBreakdown = {};

    expenses.forEach((e) => {
      totalExpenses += e.amount;
      expenseBreakdown[e.category] = (expenseBreakdown[e.category] || 0) + e.amount;
    });

    const netProfit = grossProfit - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0;

    // Time periods comparison
    // Today
    const tSales = await Sale.find({ shop: shopId, date: { $gte: todayStart, $lte: todayEnd } });
    const tExp = await Expense.find({ shop: shopId, date: { $gte: todayStart, $lte: todayEnd } });
    let tRev = 0,
      tProf = 0,
      tExpTot = 0;
    tSales.forEach((s) => {
      tRev += s.totalAmount;
      tProf += s.totalProfit;
    });
    tExp.forEach((e) => (tExpTot += e.amount));
    const todayProfit = tProf - tExpTot;

    // Weekly
    const wSales = await Sale.find({ shop: shopId, date: { $gte: weekStart } });
    const wExp = await Expense.find({ shop: shopId, date: { $gte: weekStart } });
    let wProf = 0,
      wExpTot = 0;
    wSales.forEach((s) => (wProf += s.totalProfit));
    wExp.forEach((e) => (wExpTot += e.amount));
    const weeklyProfit = wProf - wExpTot;

    // Monthly
    const mSales = await Sale.find({ shop: shopId, date: { $gte: monthStart } });
    const mExp = await Expense.find({ shop: shopId, date: { $gte: monthStart } });
    let mProf = 0,
      mExpTot = 0;
    mSales.forEach((s) => (mProf += s.totalProfit));
    mExp.forEach((e) => (mExpTot += e.amount));
    const monthlyProfit = mProf - mExpTot;

    // Yearly
    const ySales = await Sale.find({ shop: shopId, date: { $gte: yearStart } });
    const yExp = await Expense.find({ shop: shopId, date: { $gte: yearStart } });
    let yProf = 0,
      yExpTot = 0;
    ySales.forEach((s) => (yProf += s.totalProfit));
    yExp.forEach((e) => (yExpTot += e.amount));
    const yearlyProfit = yProf - yExpTot;

    res.status(200).json({
      success: true,
      period,
      summary: {
        totalRevenue,
        totalCost,
        grossProfit,
        totalExpenses,
        netProfit,
        profitMargin,
      },
      timeframes: {
        todayProfit,
        weeklyProfit,
        monthlyProfit,
        yearlyProfit,
      },
      expenseBreakdown,
      salesCount: sales.length,
      expensesCount: expenses.length,
    });
  } catch (error) {
    next(error);
  }
};
