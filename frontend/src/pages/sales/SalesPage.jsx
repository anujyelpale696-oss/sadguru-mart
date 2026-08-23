import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Search,
  Printer,
  Trash2,
  TrendingUp,
  CreditCard,
  QrCode,
  Banknote,
  Receipt,
  User,
  Calendar,
  IndianRupee,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import Alert from '../../components/common/Alert';
import InvoiceModal from '../../components/pos/InvoiceModal';
import { saleService, productService, customerService } from '../../services/api';
import { formatINR, formatDateTime } from '../../utils/currency';
import { useLanguage } from '../../context/LanguageContext';

export default function SalesPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('All');

  // POS / New Sale Modal
  const [posOpen, setPosOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  // Active Sale Invoice for viewing / printing
  const [invoiceSale, setInvoiceSale] = useState(null);

  // Cart for POS
  const [cartItems, setCartItems] = useState([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  // Selected item to add into cart
  const [selectedProdId, setSelectedProdId] = useState('');
  const [itemQty, setItemQty] = useState(1);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const params = {
        search: search || undefined,
        paymentMethod: selectedPayment !== 'All' ? selectedPayment : undefined,
      };
      const res = await saleService.getAll(params);
      if (res.data.success) {
        setSales(res.data.sales || []);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const [prodRes, custRes] = await Promise.all([
        productService.getAll(),
        customerService.getAll(),
      ]);
      if (prodRes.data.success) setProducts(prodRes.data.products || []);
      if (custRes.data.success) setCustomers(custRes.data.customers || []);
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSales();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, selectedPayment]);

  // Open POS modal automatically if url param ?action=new
  useEffect(() => {
    if (searchParams.get('action') === 'new' && products.length > 0) {
      openPosModal();
    }
  }, [searchParams, products]);

  const openPosModal = () => {
    setCartItems([]);
    setCustomerName('Walk-in Customer');
    setCustomerPhone('');
    setSelectedCustomerId('');
    setPaymentMethod('Cash');
    setDiscount(0);
    setNotes('');
    setAlertMsg(null);
    if (products.length > 0) {
      setSelectedProdId(products[0]._id);
      setItemQty(1);
    }
    setPosOpen(true);
  };

  const handleAddToCart = () => {
    const prod = products.find((p) => p._id === selectedProdId);
    if (!prod) return;

    const qty = Number(itemQty);
    if (qty <= 0) {
      setAlertMsg({ type: 'error', text: 'Please enter a valid quantity.' });
      return;
    }

    if (prod.currentStock < qty) {
      setAlertMsg({
        type: 'error',
        text: `Insufficient stock for "${prod.name}". Only ${prod.currentStock} ${prod.unit} available.`,
      });
      return;
    }

    // Check if already in cart
    const existingIndex = cartItems.findIndex((item) => item.product === prod._id);
    if (existingIndex > -1) {
      const newQty = cartItems[existingIndex].quantity + qty;
      if (prod.currentStock < newQty) {
        setAlertMsg({
          type: 'error',
          text: `Total requested quantity (${newQty}) exceeds current stock (${prod.currentStock}).`,
        });
        return;
      }
      const updatedCart = [...cartItems];
      updatedCart[existingIndex].quantity = newQty;
      setCartItems(updatedCart);
    } else {
      setCartItems([
        ...cartItems,
        {
          product: prod._id,
          name: prod.name,
          sku: prod.sku,
          quantity: qty,
          unit: prod.unit,
          purchasePrice: prod.purchasePrice,
          sellingPrice: prod.sellingPrice,
        },
      ]);
    }

    setAlertMsg(null);
    setItemQty(1);
  };

  const handleRemoveFromCart = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  // Cart Totals
  const cartSubtotal = cartItems.reduce(
    (acc, item) => acc + item.sellingPrice * item.quantity,
    0
  );
  const cartCost = cartItems.reduce(
    (acc, item) => acc + item.purchasePrice * item.quantity,
    0
  );
  const cartTotal = Math.max(0, cartSubtotal - Number(discount || 0));
  const cartProfit = cartTotal - cartCost;

  const handleCheckout = async (e) => {
    e.preventDefault();
    setAlertMsg(null);

    if (cartItems.length === 0) {
      setAlertMsg({ type: 'error', text: 'Please add at least one product to the sale cart.' });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        customer: selectedCustomerId || undefined,
        customerName: customerName || 'Walk-in Customer',
        customerPhone,
        items: cartItems,
        paymentMethod,
        discount: Number(discount || 0),
        notes,
      };

      const res = await saleService.create(payload);
      if (res.data.success) {
        setPosOpen(false);
        fetchSales();
        fetchMeta(); // Refresh products with updated stock
        setInvoiceSale(res.data.sale); // Open Printable Receipt
      }
    } catch (err) {
      setAlertMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to record sale.',
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
            {t('sales')} & POS Billing
          </h2>
          <p className="text-xs text-slate-500">
            Process checkout receipts, reduce inventory automatically, and track profit
          </p>
        </div>
        <Button variant="primary" icon={ShoppingCart} onClick={openPosModal} size="lg">
          {t('newSale')}
        </Button>
      </div>

      {/* Metric Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Sales Revenue"
            value={formatINR(summary.totalRevenue)}
            subtitle={`${summary.totalSalesCount} Transactions Completed`}
            icon={IndianRupee}
            color="emerald"
          />
          <StatCard
            title="Total Gross Profit"
            value={formatINR(summary.totalProfit)}
            subtitle={`Cost of Goods: ${formatINR(summary.totalCost)}`}
            icon={TrendingUp}
            color="blue"
          />
          <StatCard
            title="Average Ticket Size"
            value={formatINR(
              summary.totalSalesCount > 0 ? summary.totalRevenue / summary.totalSalesCount : 0
            )}
            subtitle="Avg Revenue per Invoice"
            icon={Receipt}
            color="purple"
          />
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice #, customer name..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Payment Method Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['All', 'Cash', 'UPI', 'Card', 'Other'].map((pm) => (
            <button
              key={pm}
              onClick={() => setSelectedPayment(pm)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
                selectedPayment === pm
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pm}
            </button>
          ))}
        </div>
      </div>

      {/* Sales Transactions Ledger */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Items</th>
                <th className="p-3.5 text-right">Revenue (₹)</th>
                <th className="p-3.5 text-right">Cost (₹)</th>
                <th className="p-3.5 text-right">Profit (₹)</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-400">
                    Loading sales records...
                  </td>
                </tr>
              ) : sales.length > 0 ? (
                sales.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{s.invoiceNumber}</td>
                    <td className="p-3.5 text-slate-500">{formatDateTime(s.date)}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{s.customerName || 'Walk-in'}</div>
                      {s.customerPhone && (
                        <div className="text-[10px] text-slate-400">{s.customerPhone}</div>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {s.items?.map((it) => `${it.name} (${it.quantity})`).join(', ') || '0 items'}
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-slate-900">
                      {formatINR(s.totalAmount)}
                    </td>
                    <td className="p-3.5 text-right text-slate-500 font-medium">
                      {formatINR(s.totalCost)}
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
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setInvoiceSale(s)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors inline-flex items-center gap-1"
                        title="View / Print Tax Invoice"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-semibold">Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-400">
                    No sales transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POS Billing Modal */}
      <Modal
        isOpen={posOpen}
        onClose={() => setPosOpen(false)}
        title="POS Retail Checkout Terminal"
        maxWidth="max-w-3xl"
      >
        {alertMsg && (
          <div className="mb-4">
            <Alert type={alertMsg.type} message={alertMsg.text} onClose={() => setAlertMsg(null)} />
          </div>
        )}

        <div className="space-y-5 text-xs">
          {/* Top Row: Add Product to Cart */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Add Products to Sale
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-7">
                <label className="block font-semibold text-slate-600 mb-1">Select Item</label>
                <select
                  value={selectedProdId}
                  onChange={(e) => setSelectedProdId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} — {formatINR(p.sellingPrice)} (Stock: {p.currentStock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-600 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={itemQty}
                  onChange={(e) => setItemQty(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                />
              </div>

              <div className="sm:col-span-3">
                <Button variant="primary" icon={Plus} onClick={handleAddToCart} className="w-full">
                  Add Item
                </Button>
              </div>
            </div>
          </div>

          {/* Cart Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Item</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Rate</th>
                  <th className="p-2.5 text-right">Total</th>
                  <th className="p-2.5 text-right">Profit</th>
                  <th className="p-2.5 text-center">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cartItems.length > 0 ? (
                  cartItems.map((item, idx) => {
                    const itemTotal = item.sellingPrice * item.quantity;
                    const itemProfit = (item.sellingPrice - item.purchasePrice) * item.quantity;

                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-800">{item.name}</td>
                        <td className="p-2.5 text-center font-semibold">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="p-2.5 text-right text-slate-600">
                          {formatINR(item.sellingPrice)}
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-900">
                          {formatINR(itemTotal)}
                        </td>
                        <td className="p-2.5 text-right font-bold text-emerald-600">
                          +{formatINR(itemProfit)}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => handleRemoveFromCart(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-400">
                      🛒 Cart is empty. Select products above to build invoice.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Customer & Payment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Customer Details */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                Customer Information
              </h5>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Registered Customer (Optional)
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => {
                    const cust = customers.find((c) => c._id === e.target.value);
                    setSelectedCustomerId(e.target.value);
                    if (cust) {
                      setCustomerName(cust.name);
                      setCustomerPhone(cust.phone || '');
                    }
                  }}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">Walk-in Customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.phone || 'No Phone'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ramesh Kulkarni"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Mobile / Phone</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Payment & Calculation */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                Payment Method & Discount
              </h5>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Payment Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Cash', 'UPI', 'Card'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMethod(mode)}
                      className={`py-1.5 px-2 rounded-lg font-bold text-xs border text-center transition-colors ${
                        paymentMethod === mode
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>

              {/* Grand Total Bar */}
              <div className="pt-2 border-t border-slate-200 space-y-1">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Subtotal:</span>
                  <span>{formatINR(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-600">
                  <span>Net Profit on this Sale:</span>
                  <span>+{formatINR(cartProfit)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span className="text-brand-600">{formatINR(cartTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setPosOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleCheckout}
              loading={submitting}
              icon={Receipt}
              className="font-bold"
            >
              Complete Sale & Print Receipt
            </Button>
          </div>
        </div>
      </Modal>

      {/* Invoice / Printable Receipt Modal */}
      <InvoiceModal
        isOpen={!!invoiceSale}
        onClose={() => setInvoiceSale(null)}
        sale={invoiceSale}
      />
    </div>
  );
}
