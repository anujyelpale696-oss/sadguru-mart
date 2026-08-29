import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  ArrowDownUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Truck,
  TrendingUp,
  IndianRupee,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import Alert from '../../components/common/Alert';
import { inventoryService, supplierService, productService } from '../../services/api';
import { formatINR } from '../../utils/currency';
import { useLanguage } from '../../context/LanguageContext';

export default function InventoryPage() {
  const { t } = useLanguage();

  const [inventoryData, setInventoryData] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modal states
  const [addStockOpen, setAddStockOpen] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  // Form
  const [stockForm, setStockForm] = useState({
    productId: '',
    supplierId: '',
    quantity: '',
    purchasePrice: '',
    adjustmentType: 'add',
    reason: 'New Stock Restock',
  });

  const loadInventory = async () => {
    try {
      setLoading(true);
      const [invRes, supRes] = await Promise.all([
        inventoryService.getInventory(),
        supplierService.getAll(),
      ]);
      if (invRes.data.success) {
        setInventoryData(invRes.data);
      }
      if (supRes.data.success) {
        setSuppliers(supRes.data.suppliers || []);
      }
    } catch (err) {
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const openAddStockModal = (product = null) => {
    setSelectedProductForStock(product);
    setStockForm({
      productId: product ? product._id : (inventoryData?.products[0]?._id || ''),
      supplierId: product?.supplier?._id || '',
      quantity: '',
      purchasePrice: product ? product.purchasePrice : '',
      adjustmentType: 'add',
      reason: 'Direct Stock Replenishment',
    });
    setAlertMsg(null);
    setAddStockOpen(true);
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    setAlertMsg(null);

    if (!stockForm.productId || !stockForm.quantity || Number(stockForm.quantity) <= 0) {
      setAlertMsg({ type: 'error', text: 'Please enter a valid stock quantity.' });
      return;
    }

    try {
      setSubmitting(true);
      await inventoryService.adjustStock(stockForm);
      setAddStockOpen(false);
      loadInventory();
    } catch (err) {
      setAlertMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update stock.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const productsList = inventoryData?.products || [];
  const filteredProducts = productsList.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    if (filterStatus === 'In Stock') return matchesSearch && p.currentStock > p.minStockLevel;
    if (filterStatus === 'Low Stock')
      return matchesSearch && p.currentStock > 0 && p.currentStock <= p.minStockLevel;
    if (filterStatus === 'Out of Stock') return matchesSearch && p.currentStock <= 0;
    return matchesSearch;
  });

  const selectedProdObj = productsList.find((p) => p._id === stockForm.productId);
  const updatedStockPreview =
    selectedProdObj && stockForm.quantity
      ? stockForm.adjustmentType === 'add'
        ? selectedProdObj.currentStock + Number(stockForm.quantity)
        : stockForm.adjustmentType === 'subtract'
        ? Math.max(0, selectedProdObj.currentStock - Number(stockForm.quantity))
        : Number(stockForm.quantity)
      : selectedProdObj?.currentStock || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{t('inventory')} Management</h2>
          <p className="text-xs text-slate-500">
            Track real-time stock levels, low-inventory triggers, and replenish quantities
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => openAddStockModal()} className="w-full sm:w-auto">
          {t('addStock')}
        </Button>
      </div>

      {/* Summary Cards */}
      {inventoryData?.summary && (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Total Stock Valuation"
            value={formatINR(inventoryData.summary.totalInventoryCost)}
            subtitle={`${inventoryData.summary.totalStockUnits} Units across all items`}
            icon={Boxes}
            color="emerald"
          />
          <StatCard
            title="Retail Value (Selling)"
            value={formatINR(inventoryData.summary.totalInventoryValue)}
            subtitle={`Profit: ${formatINR(inventoryData.summary.potentialProfit)}`}
            icon={IndianRupee}
            color="blue"
          />
          <StatCard
            title="Low Stock Items"
            value={inventoryData.summary.lowStockCount}
            subtitle="Below threshold"
            icon={AlertTriangle}
            color="amber"
            onClick={() => setFilterStatus('Low Stock')}
          />
          <StatCard
            title="Out of Stock Items"
            value={inventoryData.summary.outOfStockCount}
            subtitle="Stock reached zero"
            icon={XCircle}
            color="rose"
            onClick={() => setFilterStatus('Out of Stock')}
          />
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inventory..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto touch-scroll no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs min-w-[660px]">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-center">Current Stock</th>
                <th className="p-3.5 text-center">Min Stock Req.</th>
                <th className="p-3.5 text-right">Stock Value (₹)</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    Loading inventory data...
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const isOut = p.currentStock <= 0;
                  const isLow = p.currentStock <= p.minStockLevel && p.currentStock > 0;
                  const totalVal = p.currentStock * p.purchasePrice;

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        {p.brand && <div className="text-[10px] text-slate-400">{p.brand}</div>}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">{p.sku}</td>
                      <td className="p-3.5 text-slate-600 whitespace-nowrap">{p.category}</td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span
                          className={`text-sm font-extrabold ${
                            isOut
                              ? 'text-rose-600'
                              : isLow
                              ? 'text-amber-600'
                              : 'text-slate-900'
                          }`}
                        >
                          {p.currentStock} {p.unit}
                        </span>
                      </td>
                      <td className="p-3.5 text-center text-slate-500 font-medium whitespace-nowrap">
                        {p.minStockLevel} {p.unit}
                      </td>
                      <td className="p-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                        {formatINR(totalVal)}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <Badge
                          variant={isOut ? 'danger' : isLow ? 'warning' : 'success'}
                          size="sm"
                        >
                          {isOut ? t('outOfStock') : isLow ? t('lowStock') : t('inStock')}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Plus}
                          onClick={() => openAddStockModal(p)}
                          className="text-[11px] font-bold"
                        >
                          Add Stock
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    No inventory records match the selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Adjust Stock Modal */}
      <Modal
        isOpen={addStockOpen}
        onClose={() => setAddStockOpen(false)}
        title="Add / Adjust Product Stock"
        maxWidth="max-w-lg"
      >
        {alertMsg && (
          <div className="mb-4">
            <Alert type={alertMsg.type} message={alertMsg.text} onClose={() => setAlertMsg(null)} />
          </div>
        )}

        <form onSubmit={handleStockSubmit} className="space-y-4 text-xs">
          {/* Select Product */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Product *
            </label>
            <select
              value={stockForm.productId}
              onChange={(e) => {
                const prod = productsList.find((p) => p._id === e.target.value);
                setStockForm({
                  ...stockForm,
                  productId: e.target.value,
                  purchasePrice: prod ? prod.purchasePrice : '',
                });
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            >
              {productsList.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (Current: {p.currentStock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Adjustment Type */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Action Type
              </label>
              <select
                value={stockForm.adjustmentType}
                onChange={(e) => setStockForm({ ...stockForm, adjustmentType: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold text-brand-700"
              >
                <option value="add">➕ Add New Quantity</option>
                <option value="subtract">➖ Subtract / Damaged</option>
                <option value="set">🔄 Exact Stock Override</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                required
                value={stockForm.quantity}
                onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                placeholder="e.g. 50"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
              />
            </div>
          </div>

          {/* Real-time Calculation Box */}
          <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Current Stock on Record:</span>
              <span className="font-bold">
                {selectedProdObj?.currentStock || 0} {selectedProdObj?.unit}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Quantity Adjustment:</span>
              <span className="font-bold text-brand-600">
                {stockForm.adjustmentType === 'add' ? '+' : stockForm.adjustmentType === 'subtract' ? '-' : '='}{' '}
                {stockForm.quantity || 0} {selectedProdObj?.unit}
              </span>
            </div>
            <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-200">
              <span>Updated Inventory Stock:</span>
              <span className="text-emerald-700">
                {updatedStockPreview} {selectedProdObj?.unit}
              </span>
            </div>
          </div>

          {/* Supplier (Optional) */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Supplier (Optional)
            </label>
            <select
              value={stockForm.supplierId}
              onChange={(e) => setStockForm({ ...stockForm, supplierId: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Direct / Stock Inflow</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.company || 'Vendor'})
                </option>
              ))}
            </select>
          </div>

          {/* Reason / Notes */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Adjustment Reason
            </label>
            <input
              type="text"
              value={stockForm.reason}
              onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
              placeholder="e.g. New wholesale delivery, physical audit count"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setAddStockOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Confirm Stock Update
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
