import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  Filter,
  TrendingUp,
  ShoppingCart,
  Truck,
  Boxes,
  Receipt,
  IndianRupee,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import { saleService, purchaseService, productService, expenseService, reportService } from '../../services/api';
import { formatINR, formatDateTime, formatDate } from '../../utils/currency';
import { exportToCSV } from '../../utils/exportUtils';
import { useLanguage } from '../../context/LanguageContext';

export default function ReportsPage() {
  const { t } = useLanguage();

  const [activeReport, setActiveReport] = useState('sales'); // 'sales', 'purchases', 'inventory', 'expenses', 'profit'
  const [dateFilter, setDateFilter] = useState('month'); // 'today', 'week', 'month', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [reportData, setReportData] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveReport = async () => {
    try {
      setLoading(true);
      let res;

      let start = startDate;
      let end = endDate;
      const now = new Date();

      if (dateFilter === 'today') {
        start = now.toISOString().slice(0, 10);
        end = now.toISOString().slice(0, 10);
      } else if (dateFilter === 'week') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        start = d.toISOString().slice(0, 10);
        end = now.toISOString().slice(0, 10);
      } else if (dateFilter === 'month') {
        const d = new Date(now.getFullYear(), now.getMonth(), 1);
        start = d.toISOString().slice(0, 10);
        end = now.toISOString().slice(0, 10);
      }

      if (activeReport === 'sales') {
        res = await saleService.getAll({ startDate: start, endDate: end });
        if (res.data.success) {
          setReportData(res.data.sales || []);
          setSummaryStats({
            primary: formatINR(res.data.summary?.totalRevenue || 0),
            primaryLabel: 'Total Revenue',
            secondary: formatINR(res.data.summary?.totalProfit || 0),
            secondaryLabel: 'Total Profit',
            count: res.data.count,
            countLabel: 'Sales Invoices',
          });
        }
      } else if (activeReport === 'purchases') {
        res = await purchaseService.getAll({ startDate: start, endDate: end });
        if (res.data.success) {
          setReportData(res.data.purchases || []);
          setSummaryStats({
            primary: formatINR(res.data.totalPurchaseAmount || 0),
            primaryLabel: 'Total Purchases Spend',
            secondary: res.data.count,
            secondaryLabel: 'Purchase Inward Bills',
            count: res.data.count,
            countLabel: 'Supplier Bills',
          });
        }
      } else if (activeReport === 'inventory') {
        res = await productService.getAll();
        if (res.data.success) {
          setReportData(res.data.products || []);
          const totalVal = res.data.products.reduce((acc, p) => acc + p.currentStock * p.purchasePrice, 0);
          const totalUnits = res.data.products.reduce((acc, p) => acc + p.currentStock, 0);
          setSummaryStats({
            primary: formatINR(totalVal),
            primaryLabel: 'Inventory Cost Value',
            secondary: `${totalUnits} Units`,
            secondaryLabel: 'Total Physical Stock',
            count: res.data.count,
            countLabel: 'Catalogue Items',
          });
        }
      } else if (activeReport === 'expenses') {
        res = await expenseService.getAll({ startDate: start, endDate: end });
        if (res.data.success) {
          setReportData(res.data.expenses || []);
          setSummaryStats({
            primary: formatINR(res.data.totalAmount || 0),
            primaryLabel: 'Total Operating Expenses',
            secondary: res.data.count,
            secondaryLabel: 'Entries',
            count: res.data.count,
            countLabel: 'Expense Records',
          });
        }
      } else if (activeReport === 'profit') {
        res = await reportService.getProfitLoss({ period: dateFilter, startDate: start, endDate: end });
        if (res.data.success) {
          setReportData([res.data.summary]);
          setSummaryStats({
            primary: formatINR(res.data.summary.netProfit),
            primaryLabel: 'Net Business Profit',
            secondary: `${res.data.summary.profitMargin}%`,
            secondaryLabel: 'Net Profit Margin',
            count: res.data.salesCount,
            countLabel: 'Sales Computed',
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveReport();
  }, [activeReport, dateFilter, startDate, endDate]);

  const handleExportCSV = () => {
    if (!reportData || reportData.length === 0) {
      alert('No data to export');
      return;
    }

    let flatData = [];
    if (activeReport === 'sales') {
      flatData = reportData.map((s) => ({
        InvoiceNumber: s.invoiceNumber,
        Date: formatDateTime(s.date),
        CustomerName: s.customerName,
        TotalAmount: s.totalAmount,
        TotalCost: s.totalCost,
        TotalProfit: s.totalProfit,
        PaymentMethod: s.paymentMethod,
      }));
    } else if (activeReport === 'purchases') {
      flatData = reportData.map((p) => ({
        InvoiceNumber: p.invoiceNumber,
        Date: formatDateTime(p.purchaseDate),
        SupplierName: p.supplierName,
        TotalAmount: p.totalAmount,
        PaymentStatus: p.paymentStatus,
      }));
    } else if (activeReport === 'inventory') {
      flatData = reportData.map((p) => ({
        Name: p.name,
        SKU: p.sku,
        Category: p.category,
        PurchasePrice: p.purchasePrice,
        SellingPrice: p.sellingPrice,
        CurrentStock: p.currentStock,
        Unit: p.unit,
        StockStatus: p.stockStatus,
      }));
    } else if (activeReport === 'expenses') {
      flatData = reportData.map((e) => ({
        Title: e.title,
        Category: e.category,
        Date: formatDateTime(e.date),
        Amount: e.amount,
        PaymentMethod: e.paymentMethod,
        Description: e.description,
      }));
    } else {
      flatData = reportData;
    }

    exportToCSV(flatData, `${activeReport}_report_${Date.now()}.csv`);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('reports')} & Data Analytics
          </h2>
          <p className="text-xs text-slate-500">
            Generate custom audit statements, export CSV spreadsheets, and print financial summaries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={Printer} onClick={handlePrintReport}>
            Print Statement
          </Button>
          <Button variant="primary" icon={Download} onClick={handleExportCSV}>
            Export to CSV
          </Button>
        </div>
      </div>

      {/* Report Module Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'sales', label: 'Sales Report', icon: ShoppingCart },
          { id: 'purchases', label: 'Purchase Report', icon: Truck },
          { id: 'inventory', label: 'Inventory Stock Report', icon: Boxes },
          { id: 'expenses', label: 'Expense Report', icon: Receipt },
          { id: 'profit', label: 'Profit & Loss Statement', icon: TrendingUp },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeReport === tab.id
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Quick Date Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'custom', label: 'Custom Range' },
          ].map((df) => (
            <button
              key={df.id}
              onClick={() => setDateFilter(df.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                dateFilter === df.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {df.label}
            </button>
          ))}
        </div>

        {/* Custom Date Pickers */}
        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        )}
      </div>

      {/* Summary KPI Banner */}
      {summaryStats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title={summaryStats.primaryLabel}
            value={summaryStats.primary}
            subtitle={activeReport.toUpperCase()}
            icon={IndianRupee}
            color="emerald"
          />
          <StatCard
            title={summaryStats.secondaryLabel}
            value={summaryStats.secondary}
            subtitle="Aggregated total"
            icon={TrendingUp}
            color="blue"
          />
          <StatCard
            title={summaryStats.countLabel}
            value={summaryStats.count}
            subtitle="Volume in selected timeframe"
            icon={FileBarChart}
            color="purple"
          />
        </div>
      )}

      {/* Report Table View */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="printable-report">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {activeReport.toUpperCase()} STATEMENT DATA ({reportData.length} Records)
          </span>
          <span className="text-[11px] text-slate-400">Period: {dateFilter.toUpperCase()}</span>
        </div>

        <div className="overflow-x-auto">
          {activeReport === 'sales' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5 text-right">Revenue</th>
                  <th className="p-3.5 text-right">Cost</th>
                  <th className="p-3.5 text-right">Net Profit</th>
                  <th className="p-3.5">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reportData.map((s) => (
                  <tr key={s._id}>
                    <td className="p-3.5 font-bold text-slate-900">{s.invoiceNumber}</td>
                    <td className="p-3.5 text-slate-500">{formatDateTime(s.date)}</td>
                    <td className="p-3.5 font-medium">{s.customerName}</td>
                    <td className="p-3.5 text-right font-extrabold text-slate-900">{formatINR(s.totalAmount)}</td>
                    <td className="p-3.5 text-right text-slate-500">{formatINR(s.totalCost)}</td>
                    <td className="p-3.5 text-right font-bold text-emerald-600">+{formatINR(s.totalProfit)}</td>
                    <td className="p-3.5"><Badge variant="default">{s.paymentMethod}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'purchases' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Supplier</th>
                  <th className="p-3.5 text-right">Inward Spend</th>
                  <th className="p-3.5">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reportData.map((p) => (
                  <tr key={p._id}>
                    <td className="p-3.5 font-bold text-slate-900">{p.invoiceNumber}</td>
                    <td className="p-3.5 text-slate-500">{formatDateTime(p.purchaseDate)}</td>
                    <td className="p-3.5 font-medium text-slate-800">{p.supplierName}</td>
                    <td className="p-3.5 text-right font-extrabold text-slate-900">{formatINR(p.totalAmount)}</td>
                    <td className="p-3.5"><Badge variant="success">{p.paymentStatus}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'inventory' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5 text-center">Stock</th>
                  <th className="p-3.5 text-right">Purchase Price</th>
                  <th className="p-3.5 text-right">Selling Price</th>
                  <th className="p-3.5 text-right">Total Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reportData.map((prod) => (
                  <tr key={prod._id}>
                    <td className="p-3.5 font-bold text-slate-900">{prod.name}</td>
                    <td className="p-3.5 font-mono text-slate-500">{prod.sku}</td>
                    <td className="p-3.5">{prod.category}</td>
                    <td className="p-3.5 text-center font-bold">{prod.currentStock} {prod.unit}</td>
                    <td className="p-3.5 text-right">{formatINR(prod.purchasePrice)}</td>
                    <td className="p-3.5 text-right">{formatINR(prod.sellingPrice)}</td>
                    <td className="p-3.5 text-right font-extrabold text-slate-900">
                      {formatINR(prod.currentStock * prod.purchasePrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'expenses' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-3.5">Expense Title</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Amount (₹)</th>
                  <th className="p-3.5">Payment Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reportData.map((e) => (
                  <tr key={e._id}>
                    <td className="p-3.5 font-bold text-slate-900">{e.title}</td>
                    <td className="p-3.5"><Badge variant="default">{e.category}</Badge></td>
                    <td className="p-3.5 text-slate-500">{formatDateTime(e.date)}</td>
                    <td className="p-3.5 text-right font-extrabold text-slate-900">{formatINR(e.amount)}</td>
                    <td className="p-3.5">{e.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
