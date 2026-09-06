import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  Truck,
  Package,
  History,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import Alert from '../../components/common/Alert';
import { supplierService } from '../../services/api';
import { formatINR, formatDateTime } from '../../utils/currency';
import { useLanguage } from '../../context/LanguageContext';

export default function SuppliersPage() {
  const { t } = useLanguage();

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [selectedSupHistory, setSelectedSupHistory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  // Form
  const initialForm = {
    name: '',
    company: '',
    phone: '',
    email: '',
    address: '',
    productsSupplied: '',
    gstNumber: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await supplierService.getAll({ search: search || undefined });
      if (res.data.success) {
        setSuppliers(res.data.suppliers || []);
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuppliers();
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    setFormData(initialForm);
    setAlertMsg(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (s) => {
    setEditingSupplier(s);
    setFormData({
      name: s.name,
      company: s.company || '',
      phone: s.phone || '',
      email: s.email || '',
      address: s.address || '',
      productsSupplied: s.productsSupplied || '',
      gstNumber: s.gstNumber || '',
    });
    setAlertMsg(null);
    setModalOpen(true);
  };

  const handleViewHistory = async (s) => {
    try {
      const res = await supplierService.getById(s._id);
      if (res.data.success) {
        setSelectedSupHistory(res.data);
        setHistoryModalOpen(true);
      }
    } catch (err) {
      alert('Failed to load supply history');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMsg(null);

    if (!formData.name) {
      setAlertMsg({ type: 'error', text: 'Supplier name is required.' });
      return;
    }

    try {
      setSubmitting(true);
      if (editingSupplier) {
        await supplierService.update(editingSupplier._id, formData);
      } else {
        await supplierService.create(formData);
      }
      setModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      setAlertMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save supplier.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this supplier?')) return;
    try {
      await supplierService.delete(id);
      fetchSuppliers();
    } catch (err) {
      alert('Failed to delete supplier');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t('suppliers')} & Vendors
          </h2>
          <p className="text-xs text-slate-500">
            Manage wholesale distributor contacts, product lines, and past inward orders
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAddModal} className="w-full sm:w-auto">
          Add New Supplier
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
        <StatCard
          title="Active Supplier Vendors"
          value={suppliers.length}
          subtitle="Direct distribution contacts"
          icon={Building2}
          color="purple"
        />
        <StatCard
          title="Supplier Inward Orders"
          value="Integrated"
          subtitle="Auto inventory updates"
          icon={Truck}
          color="emerald"
        />
      </div>

      {/* Search */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by supplier name, company..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3.5">Supplier / Contact</th>
                <th className="p-3.5">Company / Agency</th>
                <th className="p-3.5">Phone</th>
                <th className="p-3.5">Address</th>
                <th className="p-3.5">Products Supplied</th>
                <th className="p-3.5 text-center">Invoices</th>
                <th className="p-3.5 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    Loading suppliers...
                  </td>
                </tr>
              ) : suppliers.length > 0 ? (
                suppliers.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">{s.name}</td>
                    <td className="p-3.5 font-medium text-slate-700 whitespace-nowrap">{s.company || '-'}</td>
                    <td className="p-3.5 text-slate-600 whitespace-nowrap">
                      {s.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {s.phone}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-3.5 text-slate-500 max-w-[150px] truncate">{s.address || '-'}</td>
                    <td className="p-3.5 text-slate-600 max-w-[180px] truncate">
                      {s.productsSupplied || '-'}
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleViewHistory(s)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        <History className="w-3.5 h-3.5" />
                        Invoices
                      </button>
                    </td>
                    <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(s)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        title="Edit Supplier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Supplier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    No suppliers found matching search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier Vendor'}
        maxWidth="max-w-lg"
      >
        {alertMsg && (
          <div className="mb-4">
            <Alert type={alertMsg.type} message={alertMsg.text} onClose={() => setAlertMsg(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contact Person Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rajesh Kumar"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Company / Agency Name
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Rajesh Agro Traders"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98XXX XXXXX"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="vendor@company.com"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Products / Items Supplied
            </label>
            <input
              type="text"
              value={formData.productsSupplied}
              onChange={(e) => setFormData({ ...formData, productsSupplied: e.target.value })}
              placeholder="e.g. Rice, Wheat, Pulses, Cooking Oils"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Warehouse / Godown Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Plot 14, APMC Market Yard, Pune"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Save Supplier
            </Button>
          </div>
        </form>
      </Modal>

      {/* Supplier Supply History Modal */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title={`Purchase History: ${selectedSupHistory?.supplier?.name || 'Supplier'}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800">
              Agency: {selectedSupHistory?.supplier?.company || 'Direct Supplier'}
            </span>
            <p className="text-[11px] text-slate-500">
              Contact: {selectedSupHistory?.supplier?.phone || 'N/A'}
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Invoice #</th>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Items</th>
                  <th className="p-2.5 text-right">Inflow Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedSupHistory?.purchases?.length > 0 ? (
                  selectedSupHistory.purchases.map((p) => (
                    <tr key={p._id}>
                      <td className="p-2.5 font-bold text-slate-800">{p.invoiceNumber}</td>
                      <td className="p-2.5 text-slate-500">{formatDateTime(p.purchaseDate)}</td>
                      <td className="p-2.5 text-slate-600">
                        {p.items?.map((it) => `${it.name} (${it.quantity})`).join(', ')}
                      </td>
                      <td className="p-2.5 text-right font-extrabold text-slate-900">
                        {formatINR(p.totalAmount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-slate-400">
                      No purchase orders recorded yet from this supplier.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="secondary" onClick={() => setHistoryModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
