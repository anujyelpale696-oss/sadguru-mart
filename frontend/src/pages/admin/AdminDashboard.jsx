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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950/40 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Telemetry & Isolation Guard Active</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
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
          className="text-xs font-bold"
        >
          Manage Registered Shopkeepers
        </Button>
      </div>

      {/* Admin Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Registered Users
          </p>
          <p className="text-2xl font-extrabold text-white">{stats.totalUsers}</p>
          <span className="text-[11px] text-slate-500">{stats.activeUsers} active shopkeepers</span>
        </div>

        {/* Total Active Shops */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Stores / Shops
          </p>
          <p className="text-2xl font-extrabold text-emerald-400">{stats.totalShops}</p>
          <span className="text-[11px] text-emerald-500/80">Multi-tenant isolated</span>
        </div>

        {/* Daily Logins */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Today's Logins
          </p>
          <p className="text-2xl font-extrabold text-rose-400">{stats.todayLogins}</p>
          <span className="text-[11px] text-slate-500">
            Weekly Active: {stats.weeklyActiveUsers}
          </span>
        </div>

        {/* Monthly Active Users */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Monthly Active Users (MAU)
          </p>
          <p className="text-2xl font-extrabold text-blue-400">{stats.monthlyActiveUsers}</p>
          <span className="text-[11px] text-blue-400/80">Active in last 30 days</span>
        </div>

        {/* Products in System */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Products in System
          </p>
          <p className="text-2xl font-extrabold text-purple-400">{stats.totalProductsInSystem}</p>
          <span className="text-[11px] text-slate-500">Across all retail stores</span>
        </div>

        {/* Total Platform Sales Volume */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Platform Sales Transactions
          </p>
          <p className="text-2xl font-extrabold text-amber-400">
            {formatNumber(stats.totalSalesTransactions)}
          </p>
          <span className="text-[11px] text-slate-500">Cumulative POS bills</span>
        </div>

        {/* Total Platform Gross Volume */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1 sm:col-span-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Platform Gross Volume (GMV)
          </p>
          <p className="text-2xl font-extrabold text-brand-400">
            {formatINR(stats.platformTotalRevenue)}
          </p>
          <span className="text-[11px] text-slate-500">
            Aggregate retail sales processed across registered shops
          </span>
        </div>
      </div>

      {/* Website Usage & Activity Trend Chart */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Website Usage & User Activity Trend</h3>
            <p className="text-xs text-slate-400">Daily shopkeeper logins vs checkout transactions</p>
          </div>
          <Badge variant="purple">7-Day Real-Time</Badge>
        </div>

        <div className="h-72">
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
