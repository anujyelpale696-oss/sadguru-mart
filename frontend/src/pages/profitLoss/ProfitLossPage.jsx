import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  IndianRupee,
  Receipt,
  ShoppingCart,
  Percent,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { reportService } from '../../services/api';
import { formatINR } from '../../utils/currency';
import { useLanguage } from '../../context/LanguageContext';

export default function ProfitLossPage() {
  const { t } = useLanguage();

  const [period, setPeriod] = useState('month');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPL = async () => {
    try {
      setLoading(true);
      const res = await reportService.getProfitLoss({ period });
      if (res.data.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Error fetching P&L report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPL();
  }, [period]);

  if (loading || !reportData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Calculating Profit & Loss Matrix...</p>
      </div>
    );
  }

  const { summary, timeframes, expenseBreakdown } = reportData;

  const barChartData = {
    labels: ['Total Revenue', 'Cost of Goods', 'Operating Expenses', 'Net Profit'],
    datasets: [
      {
        label: 'Financial Flow (₹)',
        data: [summary.totalRevenue, summary.totalCost, summary.totalExpenses, summary.netProfit],
        backgroundColor: [
          '#10b981', // Revenue (Emerald)
          '#64748b', // Cost (Slate)
          '#f43f5e', // Expenses (Rose)
          summary.netProfit >= 0 ? '#2563eb' : '#dc2626', // Net Profit (Blue/Red)
        ],
        borderRadius: 10,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('profitLoss')} Statement
          </h2>
          <p className="text-xs text-slate-500">
            Real-time business net profit calculated from sales revenue, goods cost, and overhead expenses
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          {[
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'year', label: 'This Year' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                period === p.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Timeframe Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Profit"
          value={formatINR(timeframes.todayProfit)}
          subtitle="Net earnings for today"
          icon={TrendingUp}
          color={timeframes.todayProfit >= 0 ? 'emerald' : 'rose'}
          trend={timeframes.todayProfit >= 0 ? '+ Positive' : '- Loss'}
          trendPositive={timeframes.todayProfit >= 0}
        />
        <StatCard
          title="This Week's Profit"
          value={formatINR(timeframes.weeklyProfit)}
          subtitle="Last 7 days net earnings"
          icon={TrendingUp}
          color={timeframes.weeklyProfit >= 0 ? 'blue' : 'rose'}
          trend={timeframes.weeklyProfit >= 0 ? '+ Positive' : '- Loss'}
          trendPositive={timeframes.weeklyProfit >= 0}
        />
        <StatCard
          title="This Month's Profit"
          value={formatINR(timeframes.monthlyProfit)}
          subtitle="Current calendar month"
          icon={TrendingUp}
          color={timeframes.monthlyProfit >= 0 ? 'purple' : 'rose'}
          trend={timeframes.monthlyProfit >= 0 ? '+ Positive' : '- Loss'}
          trendPositive={timeframes.monthlyProfit >= 0}
        />
        <StatCard
          title="Yearly Cumulative Profit"
          value={formatINR(timeframes.yearlyProfit)}
          subtitle="Full year net earnings"
          icon={IndianRupee}
          color={timeframes.yearlyProfit >= 0 ? 'emerald' : 'rose'}
          trend={timeframes.yearlyProfit >= 0 ? '+ Positive' : '- Loss'}
          trendPositive={timeframes.yearlyProfit >= 0}
        />
      </div>

      {/* P&L Statement Equation Breakdown Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Net Profit Formula Breakdown ({period.toUpperCase()})
            </h3>
            <p className="text-xs text-slate-400">
              Formula: Revenue - Cost of Goods Sold - Operating Expenses = Net Profit
            </p>
          </div>
          <Badge variant={summary.netProfit >= 0 ? 'success' : 'danger'} size="lg">
            {summary.profitMargin}% Net Margin
          </Badge>
        </div>

        {/* Visual Formula Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Revenue */}
          <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-100 space-y-1">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              1. Total Revenue (+)
            </span>
            <p className="text-2xl font-extrabold text-emerald-950">{formatINR(summary.totalRevenue)}</p>
            <span className="text-[11px] text-emerald-700 font-medium">From {reportData.salesCount} Sales</span>
          </div>

          {/* Product Cost */}
          <div className="bg-slate-100 p-5 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              2. Goods Cost (-)
            </span>
            <p className="text-2xl font-extrabold text-slate-900">{formatINR(summary.totalCost)}</p>
            <span className="text-[11px] text-slate-500 font-medium">Wholesale purchase cost</span>
          </div>

          {/* Expenses */}
          <div className="bg-rose-50/70 p-5 rounded-2xl border border-rose-100 space-y-1">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
              3. Overheads (-)
            </span>
            <p className="text-2xl font-extrabold text-rose-950">{formatINR(summary.totalExpenses)}</p>
            <span className="text-[11px] text-rose-700 font-medium">Rent, Power, Salaries</span>
          </div>

          {/* Net Profit */}
          <div
            className={`p-5 rounded-2xl border space-y-1 ${
              summary.netProfit >= 0
                ? 'bg-brand-600 text-white border-brand-700 shadow-md shadow-brand-600/20'
                : 'bg-rose-600 text-white border-rose-700'
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wider block text-white/80">
              = Net Business Profit
            </span>
            <p className="text-2xl font-extrabold text-white">{formatINR(summary.netProfit)}</p>
            <span className="text-[11px] text-white/80 font-medium">
              Gross: {formatINR(summary.grossProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* Chart & Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800">Financial Balance Comparison</h3>
          <div className="h-64">
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { callback: (v) => `₹${v}` },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Operating Costs Breakdown Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800">Overheads Breakdown ({period})</h3>
          <div className="divide-y divide-slate-100 text-xs">
            {Object.keys(expenseBreakdown).length > 0 ? (
              Object.entries(expenseBreakdown).map(([cat, amt]) => (
                <div key={cat} className="py-2.5 flex justify-between items-center">
                  <span className="font-semibold text-slate-700">{cat}</span>
                  <span className="font-bold text-slate-900">{formatINR(amt)}</span>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-slate-400">No overhead expenses recorded for this timeframe.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
