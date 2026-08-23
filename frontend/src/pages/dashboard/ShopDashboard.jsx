import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Boxes,
  ShoppingCart,
  TrendingUp,
  Receipt,
  AlertTriangle,
  Users,
  IndianRupee,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Printer,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { reportService, productService } from '../../services/api';
import { formatINR, formatDateTime } from '../../utils/currency';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ShopDashboard() {
  const { t } = useLanguage();
  const { shop, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await reportService.getDashboardSummary();
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">{t('loading')}</p>
      </div>
    );
  }

  const { metrics, charts, recentSales, lowStockAlerts } = data;

  // Chart 1: Sales & Revenue Trend (Last 7 days)
  const salesChartData = {
    labels: charts.salesTrend7Days.map((d) => d.day),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: charts.salesTrend7Days.map((d) => d.revenue),
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointBackgroundColor: '#059669',
      },
      {
        label: 'Net Profit (₹)',
        data: charts.salesTrend7Days.map((d) => d.profit),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointBackgroundColor: '#2563eb',
      },
    ],
  };

  // Chart 2: Inventory Stock Breakdown
  const inventoryChartData = {
    labels: [t('inStock'), t('lowStock'), t('outOfStock')],
    datasets: [
      {
        data: [
          charts.inventoryStatus.inStock,
          charts.inventoryStatus.lowStock,
          charts.inventoryStatus.outOfStock,
        ],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  // Chart 3: Top Categories
  const categoryChartData = {
    labels: charts.categoryDistribution.map((c) => c.name.slice(0, 15) + '...'),
    datasets: [
      {
        label: 'Sales (₹)',
        data: charts.categoryDistribution.map((c) => c.value),
        backgroundColor: [
          '#059669',
          '#2563eb',
          '#7c3aed',
          '#d97706',
          '#db2777',
          '#0891b2',
        ],
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="bg-gradient-to-r from-brand-700 via-emerald-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Business Engine Active</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl">
            {shop?.name} — All systems running smoothly. Track your daily POS transactions and inventory below.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="light"
            icon={ShoppingCart}
            onClick={() => navigate('/dashboard/sales?action=new')}
            size="sm"
            className="text-xs font-bold text-emerald-950 shadow-md"
          >
            {t('newSale')}
          </Button>
          <Button
            variant="glass"
            icon={Boxes}
            onClick={() => navigate('/dashboard/inventory')}
            size="sm"
            className="text-xs"
          >
            {t('addStock')}
          </Button>
          <Button
            variant="glass"
            icon={Receipt}
            onClick={() => navigate('/dashboard/expenses')}
            size="sm"
            className="text-xs"
          >
            {t('newExpense')}
          </Button>
          <Button
            variant="glass"
            icon={Package}
            onClick={() => navigate('/dashboard/products')}
            size="sm"
            className="text-xs"
          >
            {t('addProduct')}
          </Button>
        </div>
      </div>

      {/* 8 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Today's Revenue */}
        <StatCard
          title={t('todayRevenue')}
          value={formatINR(metrics.todayRevenue)}
          subtitle={`${metrics.todaySales} Sales Recorded`}
          icon={IndianRupee}
          color="emerald"
          trend="+ Today"
          trendPositive={true}
          onClick={() => navigate('/dashboard/sales')}
        />

        {/* 2. Today's Profit */}
        <StatCard
          title={t('todayProfit')}
          value={formatINR(metrics.todayProfit)}
          subtitle="Net Profit (Rev - Cost - Exp)"
          icon={TrendingUp}
          color={metrics.todayProfit >= 0 ? 'blue' : 'rose'}
          trend={metrics.todayProfit >= 0 ? 'Profitable' : 'Loss'}
          trendPositive={metrics.todayProfit >= 0}
          onClick={() => navigate('/dashboard/profit-loss')}
        />

        {/* 3. Today's Expenses */}
        <StatCard
          title={t('todayExpenses')}
          value={formatINR(metrics.todayExpenses)}
          subtitle="Operating Outflows"
          icon={Receipt}
          color="amber"
          onClick={() => navigate('/dashboard/expenses')}
        />

        {/* 4. Total Stock */}
        <StatCard
          title={t('totalStock')}
          value={`${metrics.totalStock} Units`}
          subtitle={`${metrics.totalProducts} Total Products`}
          icon={Boxes}
          color="purple"
          onClick={() => navigate('/dashboard/inventory')}
        />

        {/* 5. Total Products */}
        <StatCard
          title={t('totalProducts')}
          value={metrics.totalProducts}
          subtitle="Catalogue Items"
          icon={Package}
          color="indigo"
          onClick={() => navigate('/dashboard/products')}
        />

        {/* 6. Stock Alerts */}
        <StatCard
          title={t('lowStockProducts')}
          value={`${metrics.lowStockProducts} Items`}
          subtitle="Need immediate replenishment"
          icon={AlertTriangle}
          color={metrics.lowStockProducts > 0 ? 'rose' : 'slate'}
          trend={metrics.lowStockProducts > 0 ? 'Action Needed' : 'Normal'}
          trendPositive={metrics.lowStockProducts === 0}
          onClick={() => navigate('/dashboard/inventory')}
        />

        {/* 7. Total Customers */}
        <StatCard
          title={t('totalCustomersCard')}
          value={metrics.totalCustomers}
          subtitle="Registered Buyers"
          icon={Users}
          color="emerald"
          onClick={() => navigate('/dashboard/customers')}
        />

        {/* 8. Monthly Revenue */}
        <StatCard
          title="This Month Revenue"
          value={formatINR(metrics.monthRevenue)}
          subtitle={`Profit: ${formatINR(metrics.monthProfit)}`}
          icon={ShoppingCart}
          color="blue"
          onClick={() => navigate('/dashboard/reports')}
        />
      </div>

      {/* Visual Analytics Charts (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Profit Trend (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Sales & Profit Trend (Last 7 Days)</h3>
              <p className="text-xs text-slate-400">Daily breakdown of revenue vs net profit</p>
            </div>
            <Badge variant="success">7-Day Trend</Badge>
          </div>
          <div className="h-72">
            <Line
              data={salesChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { callback: (value) => `₹${value}` },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Stock Status Doughnut (1 Col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Inventory Health</h3>
              <p className="text-xs text-slate-400">Current stock availability breakdown</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={inventoryChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
                cutout: '68%',
              }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs border-t border-slate-100">
            <div>
              <span className="text-emerald-600 font-bold block">{charts.inventoryStatus.inStock}</span>
              <span className="text-slate-400 text-[10px]">In Stock</span>
            </div>
            <div>
              <span className="text-amber-600 font-bold block">{charts.inventoryStatus.lowStock}</span>
              <span className="text-slate-400 text-[10px]">Low Stock</span>
            </div>
            <div>
              <span className="text-rose-600 font-bold block">{charts.inventoryStatus.outOfStock}</span>
              <span className="text-slate-400 text-[10px]">Out Stock</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Sales & Low Stock Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales List (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Recent Sales Transactions</h3>
              <p className="text-xs text-slate-400">Latest orders processed through POS billing</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/sales')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View All Sales →
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5 text-right">Amount (₹)</th>
                  <th className="p-3.5 text-right">Profit (₹)</th>
                  <th className="p-3.5">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentSales.length > 0 ? (
                  recentSales.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">{s.invoiceNumber}</td>
                      <td className="p-3.5 font-medium">{s.customerName || 'Walk-in'}</td>
                      <td className="p-3.5 text-slate-500">{s.items?.length || 0} items</td>
                      <td className="p-3.5 text-right font-bold text-slate-900">
                        {formatINR(s.totalAmount)}
                      </td>
                      <td className="p-3.5 text-right font-bold text-emerald-600">
                        +{formatINR(s.totalProfit)}
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={
                            s.paymentMethod === 'UPI'
                              ? 'info'
                              : s.paymentMethod === 'Cash'
                              ? 'success'
                              : 'purple'
                          }
                          size="sm"
                        >
                          {s.paymentMethod}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-400">
                      No sales recorded yet. Click "New Sale (POS)" to start billing!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts Box (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold">Stock Alerts</h3>
            </div>
            <Badge variant="warning" size="sm">
              {lowStockAlerts.length} Needs Attention
            </Badge>
          </div>

          <div className="space-y-2.5">
            {lowStockAlerts.length > 0 ? (
              lowStockAlerts.map((prod) => (
                <div
                  key={prod._id}
                  onClick={() => navigate('/dashboard/inventory')}
                  className="p-3 rounded-xl border border-amber-100 bg-amber-50/40 hover:bg-amber-50 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[170px]">
                      {prod.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Min Req: {prod.minStockLevel} {prod.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-extrabold ${
                        prod.currentStock <= 0 ? 'text-rose-600' : 'text-amber-600'
                      }`}
                    >
                      {prod.currentStock} {prod.unit}
                    </span>
                    <span className="block text-[9px] text-slate-400 uppercase font-semibold">
                      {prod.currentStock <= 0 ? 'Out of Stock' : 'Low Stock'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                ✅ All inventory levels are healthy!
              </div>
            )}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/dashboard/inventory')}
            className="w-full text-xs font-semibold"
          >
            Manage All Inventory →
          </Button>
        </div>
      </div>
    </div>
  );
}
