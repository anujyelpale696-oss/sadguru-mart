import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Trash2,
  Calendar,
  IndianRupee,
  PieChart as PieIcon,
  Tag,
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import Alert from '../../components/common/Alert';
import { expenseService } from '../../services/api';
import { formatINR, formatDateTime } from '../../utils/currency';
import { useLanguage } from '../../context/LanguageContext';

export default function ExpensesPage() {
  const { t } = useLanguage();

  const [expenses, setExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  // Form
  const [formData, setFormData] = useState({
    title: '',
    category: 'Rent',
    amount: '',
    paymentMethod: 'Cash',
    date: new Date().toISOString().slice(0, 10),
    description: '',
  });

  const categories = [
    'Rent',
    'Electricity',
    'Salary',
    'Transportation',
    'Maintenance',
    'Packaging',
    'Tea & Refreshments',
    'Other',
  ];

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: search || undefined,
      };
      const res = await expenseService.getAll(params);
      if (res.data.success) {
        setExpenses(res.data.expenses || []);
        setTotalAmount(res.data.totalAmount || 0);
        setCategoryTotals(res.data.categoryTotals || {});
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExpenses();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const handleOpenAddModal = () => {
    setFormData({
      title: '',
      category: 'Rent',
      amount: '',
      paymentMethod: 'Cash',
      date: new Date().toISOString().slice(0, 10),
      description: '',
    });
    setAlertMsg(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMsg(null);

    if (!formData.title || !formData.amount || Number(formData.amount) <= 0) {
      setAlertMsg({ type: 'error', text: 'Please enter a valid expense title and amount.' });
      return;
    }

    try {
      setSubmitting(true);
      await expenseService.create(formData);
      setModalOpen(false);
      fetchExpenses();
    } catch (err) {
      setAlertMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to add expense.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense record?')) return;
    try {
      await expenseService.delete(id);
      fetchExpenses();
    } catch (err) {
      alert('Failed to delete expense');
    }
  };

  // Chart
  const chartLabels = Object.keys(categoryTotals);
  const chartValues = Object.values(categoryTotals);
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartValues,
        backgroundColor: [
          '#ef4444',
          '#f59e0b',
          '#10b981',
          '#3b82f6',
          '#8b5cf6',
          '#ec4899',
          '#14b8a6',
          '#64748b',
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('expenses')} Tracking
          </h2>
          <p className="text-xs text-slate-500">
            Log shop overheads: rent, electricity, helper salaries, transport, and maintenance
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
          {t('newExpense')}
        </Button>
      </div>

      {/* Metric Cards & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <StatCard
            title="Total Recorded Expenses"
            value={formatINR(totalAmount)}
            subtitle={`${expenses.length} Expense entries logged`}
            icon={IndianRupee}
            color="rose"
          />
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Highest Expense Categories
            </h4>
            <div className="space-y-1.5 text-xs">
              {Object.entries(categoryTotals)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([cat, amt]) => (
                  <div key={cat} className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600 font-medium">{cat}</span>
                    <span className="font-bold text-slate-900">{formatINR(amt)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-800">Expense Category Breakdown</h3>
            <p className="text-xs text-slate-400">Distribution of operating business costs</p>
            <div className="pt-4 flex flex-wrap gap-2 text-xs">
              {chartLabels.map((l, i) => (
                <span
                  key={l}
                  className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold"
                >
                  {l}: {formatINR(chartValues[i])}
                </span>
              ))}
            </div>
          </div>
          <div className="w-48 h-48 flex-shrink-0 flex items-center justify-center">
            {chartValues.length > 0 ? (
              <Doughnut
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                }}
              />
            ) : (
              <div className="text-xs text-slate-400">No expenses</div>
            )}
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by expense title..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3.5">Expense Title</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Amount (₹)</th>
                <th className="p-3.5">Payment Method</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    Loading expenses...
                  </td>
                </tr>
              ) : expenses.length > 0 ? (
                expenses.map((e) => (
                  <tr key={e._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{e.title}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                        {e.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">{formatDateTime(e.date)}</td>
                    <td className="p-3.5 text-right font-extrabold text-slate-900">
                      {formatINR(e.amount)}
                    </td>
                    <td className="p-3.5">
                      <Badge variant="default" size="sm">
                        {e.paymentMethod || 'Cash'}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-slate-500 text-[11px]">{e.description || '-'}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDelete(e._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    No expense records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record New Business Expense"
        maxWidth="max-w-lg"
      >
        {alertMsg && (
          <div className="mb-4">
            <Alert type={alertMsg.type} message={alertMsg.text} onClose={() => setAlertMsg(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Expense Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Monthly Shop Electricity Bill"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="₹ Amount"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Payment Mode
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="Bank Transfer">Bank Transfer / NEFT</option>
                <option value="Card">Credit / Debit Card</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description / Notes
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details, receiver name, etc."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Save Expense Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
