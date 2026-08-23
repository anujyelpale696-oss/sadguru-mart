import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Search,
  Building2,
  Calendar,
  IndianRupee,
  Boxes,
  Receipt,
  Trash2,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import Alert from '../../components/common/Alert';
import { purchaseService, productService, supplierService } from '../../services/api';
import { formatINR, formatDateTime } from '../../utils/currency';
import { useLanguage } from '../../context/LanguageContext';

export default function PurchasesPage() {
  const { t } = useLanguage();

  const [purchases, setPurchases] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  // Form
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);

  // Item to add
  const [currentProdId, setCurrentProdId] = useState('');
  const [currentQty, setCurrentQty] = useState(10);
  const [currentPrice, setCurrentPrice] = useState('');

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await purchaseService.getAll({ search: search || undefined });
      if (res.data.success) {
        setPurchases(res.data.purchases || []);
        setTotalAmount(res.data.totalPurchaseAmount || 0);
      }
    } catch (err) {
      console.error('Error fetching purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const [prodRes, supRes] = await Promise.all([
        productService.getAll(),
        supplierService.getAll(),
      ]);
      if (prodRes.data.success) {
        setProducts(prodRes.data.products || []);
        if (prodRes.data.products?.length > 0) {
          setCurrentProdId(prodRes.data.products[0]._id);
          setCurrentPrice(prodRes.data.products[0].purchasePrice);
        }
      }
      if (supRes.data.success) {
        setSuppliers(supRes.data.suppliers || []);
        if (supRes.data.suppliers?.length > 0) {
          setSelectedSupplierId(supRes.data.suppliers[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching meta:', err);
    }
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPurchases();
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  const openModal = () => {
    setItems([]);
    setInvoiceNumber(`PUR-${Date.now().toString().slice(-6)}`);
    setPurchaseDate(new Date().toISOString().slice(0, 10));
    setNotes('');
    setAlertMsg(null);
    setModalOpen(true);
  };

  const handleAddItem = () => {
    const prod = products.find((p) => p._id === currentProdId);
    if (!prod) return;

    const qty = Number(currentQty);
    const price = Number(currentPrice || prod.purchasePrice);

    if (qty <= 0 || price <= 0) {
      setAlertMsg({ type: 'error', text: 'Please enter a valid quantity and purchase cost.' });
      return;
    }

    setItems([
      ...items,
      {
        product: prod._id,
        name: prod.name,
        sku: prod.sku,
        quantity: qty,
        unit: prod.unit,
        purchasePrice: price,
        totalAmount: qty * price,
      },
    ]);

    setAlertMsg(null);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const grandPurchaseTotal = items.reduce((acc, item) => acc + item.totalAmount, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMsg(null);

    if (items.length === 0) {
      setAlertMsg({ type: 'error', text: 'Please add at least one item to this purchase order.' });
      return;
    }

    try {
      setSubmitting(true);
      const supplierObj = suppliers.find((s) => s._id === selectedSupplierId);

      const payload = {
        supplier: selectedSupplierId || undefined,
        supplierName: supplierObj ? supplierObj.name : 'Direct Supplier',
        invoiceNumber,
        purchaseDate,
        items,
        notes,
      };

      const res = await purchaseService.create(payload);
      if (res.data.success) {
        setModalOpen(false);
        fetchPurchases();
        fetchMeta(); // updates stock
      }
    } catch (err) {
      setAlertMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to record purchase.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('purchases')} & Stock Inward
          </h2>
          <p className="text-xs text-slate-500">
            Record wholesale invoices from suppliers and auto-increment inventory stock
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openModal}>
          Record Supplier Purchase
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Purchase Spend"
          value={formatINR(totalAmount)}
          subtitle="Inventory Procurement Cost"
          icon={IndianRupee}
          color="emerald"
        />
        <StatCard
          title="Purchase Orders"
          value={purchases.length}
          subtitle="Completed Inward Shipments"
          icon={Truck}
          color="blue"
        />
        <StatCard
          title="Active Suppliers"
          value={suppliers.length}
          subtitle="Registered Vendors"
          icon={Building2}
          color="purple"
        />
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice # or supplier name..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Purchase Date</th>
                <th className="p-3.5">Supplier</th>
                <th className="p-3.5">Items Procured</th>
                <th className="p-3.5 text-right">Total Inflow (₹)</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    Loading purchase records...
                  </td>
                </tr>
              ) : purchases.length > 0 ? (
                purchases.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{p.invoiceNumber}</td>
                    <td className="p-3.5 text-slate-500">{formatDateTime(p.purchaseDate)}</td>
                    <td className="p-3.5 font-bold text-slate-800">{p.supplierName}</td>
                    <td className="p-3.5 text-slate-600">
                      {p.items?.map((it) => `${it.name} (${it.quantity} ${it.unit})`).join(', ')}
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-slate-900">
                      {formatINR(p.totalAmount)}
                    </td>
                    <td className="p-3.5">
                      <Badge variant="success" size="sm">
                        {p.paymentStatus || 'Paid'}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px]">{p.notes || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    No supplier purchases found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Supplier Stock Purchase"
        maxWidth="max-w-2xl"
      >
        {alertMsg && (
          <div className="mb-4">
            <Alert type={alertMsg.type} message={alertMsg.text} onClose={() => setAlertMsg(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Supplier */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Supplier / Vendor *
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.company || 'Supplier'})
                  </option>
                ))}
              </select>
            </div>

            {/* Invoice Number */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Supplier Invoice # *
              </label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Add Items Box */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
              Add Products In This Inward Bill
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
              <div className="sm:col-span-5">
                <label className="block text-slate-600 mb-1 font-semibold">Product</label>
                <select
                  value={currentProdId}
                  onChange={(e) => {
                    setCurrentProdId(e.target.value);
                    const prod = products.find((p) => p._id === e.target.value);
                    if (prod) setCurrentPrice(prod.purchasePrice);
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-600 mb-1 font-semibold">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={currentQty}
                  onChange={(e) => setCurrentQty(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 mb-1 font-semibold">Purchase Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <Button variant="primary" icon={Plus} size="sm" onClick={handleAddItem} className="w-full">
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Item</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Cost Rate</th>
                  <th className="p-2.5 text-right">Total Amount</th>
                  <th className="p-2.5 text-center">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length > 0 ? (
                  items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-bold text-slate-800">{it.name}</td>
                      <td className="p-2.5 text-center font-bold">
                        +{it.quantity} {it.unit}
                      </td>
                      <td className="p-2.5 text-right text-slate-600">{formatINR(it.purchasePrice)}</td>
                      <td className="p-2.5 text-right font-extrabold text-slate-900">
                        {formatINR(it.totalAmount)}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-slate-400">
                      No items added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center p-3 bg-slate-100 rounded-xl font-bold">
            <span className="text-slate-700">Total Purchase Amount:</span>
            <span className="text-base font-extrabold text-brand-700">
              {formatINR(grandPurchaseTotal)}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Save Purchase & Update Inventory
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
