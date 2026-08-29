import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  Store,
  Activity,
  LogIn,
  IndianRupee,
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertOctagon,
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { adminService } from '../../services/api';
import { formatINR, formatNumber } from '../../utils/currency';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await adminService.getOverview();
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Loading platform monitoring telemetry...</p>
      </div>
    );
  }

  const { stats, charts } = data;

  const usageChartData = {
    labels: charts.usageTrend.map((d) => d.day),
    datasets: [
      {
        label: 'Platform User Logins',
        data: charts.usageTrend.map((d) => d.logins),
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointBackgroundColor: '#f43f5e',
      },
      {
        label: 'Sales Transactions',
        data: charts.usageTrend.map((d) => d.salesCount),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointBackgroundColor: '#10b981',
      },
    ],
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950/40 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[11px] sm:text-xs font-bold border border-rose-500/30">
            <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Admin Telemetry & Isolation Active</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            System Operations & Monitoring
          </h2>
          <p className="text-xs text-slate-400">
            High-level website adoption, registered store accounts, and platform health telemetry
          </p>
        </div>

        <Button
          variant="danger"
          icon={Users}
          onClick={() => navigate('/admin/users')}
          className="text-xs font-bold w-full sm:w-auto"
        >
          Manage Shopkeepers
        </Button>
      </div>

      {/* Admin Stat Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Users */}
        <div className="bg-slate-950 p-3.5 sm:p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
            Total Users
          </p>
          <p className="text-xl sm:text-2xl font-extrabold text-white">{stats.totalUsers}</p>
          <span className="text-[10px] sm:text-[11px] text-slate-500">{stats.activeUsers} active shopkeepers</span>
        </div>

        {/* Total Active Shops */}
        <div className="bg-slate-950 p-3.5 sm:p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
            Total Stores / Shops
          </p>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-400">{stats.totalShops}</p>
          <span className="text-[10px] sm:text-[11px] text-emerald-500/80">Multi-tenant isolated</span>
        </div>

        {/* Daily Logins */}
        <div className="bg-slate-950 p-3.5 sm:p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
            Today's Logins
          </p>
          <p className="text-xl sm:text-2xl font-extrabold text-rose-400">{stats.todayLogins}</p>
          <span className="text-[10px] sm:text-[11px] text-slate-500">
            Weekly: {stats.weeklyActiveUsers}
          </span>
        </div>

        {/* Monthly Active Users */}
        <div className="bg-slate-950 p-3.5 sm:p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
            Monthly Active (MAU)
          </p>
          <p className="text-xl sm:text-2xl font-extrabold text-blue-400">{stats.monthlyActiveUsers}</p>
          <span className="text-[10px] sm:text-[11px] text-blue-400/80">Active last 30 days</span>
        </div>

        {/* Products in System */}
        <div className="bg-slate-950 p-3.5 sm:p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
            Products in System
          </p>
          <p className="text-xl sm:text-2xl font-extrabold text-purple-400">{stats.totalProductsInSystem}</p>
          <span className="text-[10px] sm:text-[11px] text-slate-500">Across all stores</span>
        </div>

        {/* Total Platform Sales Volume */}
        <div className="bg-slate-950 p-3.5 sm:p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
            Platform Transactions
          </p>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-400">
            {formatNumber(stats.totalSalesTransactions)}
          </p>
          <span className="text-[10px] sm:text-[11px] text-slate-500">Cumulative POS bills</span>
        </div>

        {/* Total Platform Gross Volume */}
        <div className="bg-slate-950 p-3.5 sm:p-5 rounded-2xl border border-slate-800 space-y-1 xs:col-span-2">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
            Total Platform Gross Volume (GMV)
          </p>
          <p className="text-xl sm:text-2xl font-extrabold text-brand-400 truncate">
            {formatINR(stats.platformTotalRevenue)}
          </p>
          <span className="text-[10px] sm:text-[11px] text-slate-500">
            Aggregate retail sales processed across registered shops
          </span>
        </div>
      </div>

      {/* Website Usage & Activity Trend Chart */}
      <div className="bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-3 sm:space-y-4 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">Website Usage & User Activity Trend</h3>
            <p className="text-[11px] sm:text-xs text-slate-400">Daily shopkeeper logins vs checkout transactions</p>
          </div>
          <Badge variant="purple">7-Day Real-Time</Badge>
        </div>

        <div className="h-60 sm:h-72 w-full min-w-0">
          <Line
            data={usageChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'top' } },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: 'rgba(255, 255, 255, 0.05)' },
                },
                x: {
                  grid: { color: 'rgba(255, 255, 255, 0.05)' },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
