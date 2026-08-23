import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  Boxes,
  ArrowUpDown,
  Tag,
  TrendingUp,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import { productService, supplierService } from '../../services/api';
import { formatINR } from '../../utils/currency';
import { useLanguage } from '../../context/LanguageContext';

export default function ProductsPage() {
  const { t } = useLanguage();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  // Form State
  const initialForm = {
    name: '',
    sku: '',
    category: 'Grains & Rice',
    brand: '',
    purchasePrice: '',
    sellingPrice: '',
    currentStock: '',
    minStockLevel: 5,
    unit: 'kg',
    supplier: '',
    supplierName: '',
    imageUrl: '',
    description: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        search: search || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        status: selectedStatus || undefined,
        sortBy,
        order: sortOrder,
      };
      const res = await productService.getAll(params);
      if (res.data.success) {
        setProducts(res.data.products || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const [catRes, supRes] = await Promise.all([
        productService.getCategories(),
        supplierService.getAll(),
      ]);
      if (catRes.data.success) setCategories(catRes.data.categories || []);
      if (supRes.data.success) setSuppliers(supRes.data.suppliers || []);
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedStatus, sortBy, sortOrder]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData(initialForm);
    setModalOpen(true);
    setAlertMsg(null);
  };

  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      category: p.category,
      brand: p.brand || '',
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      currentStock: p.currentStock,
      minStockLevel: p.minStockLevel,
      unit: p.unit || 'pcs',
      supplier: p.supplier?._id || p.supplier || '',
      supplierName: p.supplierName || '',
      imageUrl: p.imageUrl || '',
      description: p.description || '',
    });
    setModalOpen(true);
    setAlertMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMsg(null);

    if (!formData.name || !formData.category || !formData.purchasePrice || !formData.sellingPrice) {
      setAlertMsg({ type: 'error', text: 'Please fill all required fields.' });
      return;
    }

    try {
      setFormSubmitting(true);
      if (editingProduct) {
        await productService.update(editingProduct._id, formData);
      } else {
        await productService.create(formData);
      }
      setModalOpen(false);
      fetchProducts();
      fetchMeta();
    } catch (err) {
      setAlertMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save product.',
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await productService.delete(deleteId);
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  // Live calculation of profit per unit
  const calcProfitPerUnit =
    formData.sellingPrice && formData.purchasePrice
      ? Number(formData.sellingPrice) - Number(formData.purchasePrice)
      : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('products')} Catalog</h2>
          <p className="text-xs text-slate-500">
            Manage your store's item catalogue, retail prices, and profit margins
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
          {t('addProduct')}
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU, brand..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">All Categories</option>
            <option value="Grains & Rice">Grains & Rice</option>
            <option value="Flour & Grains">Flour & Grains</option>
            <option value="Sugar & Salt">Sugar & Salt</option>
            <option value="Edible Oils">Edible Oils</option>
            <option value="Beverages">Beverages</option>
            <option value="Snacks & Biscuits">Snacks & Biscuits</option>
            <option value="Personal Care">Personal Care</option>
            <option value="Cleaning & Household">Cleaning & Household</option>
            <option value="Pulses & Dals">Pulses & Dals</option>
            <option value="Dairy & Ghee">Dairy & Ghee</option>
            <option value="Other">Other</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">SKU / Code</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-right">Purchase (₹)</th>
                <th className="p-3.5 text-right">Selling (₹)</th>
                <th className="p-3.5 text-right">Profit/Unit</th>
                <th className="p-3.5 text-center">Stock</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading products...
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => {
                  const profitUnit = (p.sellingPrice || 0) - (p.purchasePrice || 0);
                  const isLow = p.currentStock <= p.minStockLevel && p.currentStock > 0;
                  const isOut = p.currentStock <= 0;

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        {p.brand && <div className="text-[10px] text-slate-400">{p.brand}</div>}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-500">{p.sku}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-medium text-slate-600">
                        {formatINR(p.purchasePrice)}
                      </td>
                      <td className="p-3.5 text-right font-bold text-slate-900">
                        {formatINR(p.sellingPrice)}
                      </td>
                      <td className="p-3.5 text-right font-bold text-emerald-600">
                        +{formatINR(profitUnit)}
                      </td>
                      <td className="p-3.5 text-center font-extrabold text-slate-800">
                        {p.currentStock} {p.unit}
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={isOut ? 'danger' : isLow ? 'warning' : 'success'}
                          size="sm"
                        >
                          {isOut ? t('outOfStock') : isLow ? t('lowStock') : t('inStock')}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(p._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-400">
                    No products found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Product Details' : 'Add New Product to Store'}
        maxWidth="max-w-2xl"
      >
        {alertMsg && (
          <div className="mb-4">
            <Alert type={alertMsg.type} message={alertMsg.text} onClose={() => setAlertMsg(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Daawat Rozana Basmati Rice (1kg)"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* SKU / Code */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Product SKU / Code
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g. RIC-001 (Auto if blank)"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Grains & Rice">Grains & Rice</option>
                <option value="Flour & Grains">Flour & Grains</option>
                <option value="Sugar & Salt">Sugar & Salt</option>
                <option value="Edible Oils">Edible Oils</option>
                <option value="Beverages">Beverages</option>
                <option value="Snacks & Biscuits">Snacks & Biscuits</option>
                <option value="Personal Care">Personal Care</option>
                <option value="Cleaning & Household">Cleaning & Household</option>
                <option value="Pulses & Dals">Pulses & Dals</option>
                <option value="Dairy & Ghee">Dairy & Ghee</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. Daawat, Tata, Fortune, HUL"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Measurement Unit *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
              >
                <option value="kg">kg (Kilogram)</option>
                <option value="gm">gm (Gram)</option>
                <option value="pcs">pcs (Pieces)</option>
                <option value="pack">pack (Packet)</option>
                <option value="litre">litre (Litre)</option>
                <option value="bottle">bottle (Bottle)</option>
                <option value="box">box (Box / Carton)</option>
                <option value="can">can (Can / Tin)</option>
                <option value="dozen">dozen (Dozen)</option>
              </select>
            </div>

            {/* Purchase Price */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Purchase Cost Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                placeholder="₹ Cost from supplier"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Selling Retail Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                placeholder="₹ Sale price to customer"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
              />
            </div>

            {/* Auto Profit Calculation Card */}
            <div className="sm:col-span-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-900 block">
                  Automatic Profit per Unit Calculation:
                </span>
                <span className="text-[11px] text-emerald-700">Selling Price - Purchase Cost</span>
              </div>
              <div className="text-right">
                <span
                  className={`text-base font-extrabold ${
                    calcProfitPerUnit >= 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {formatINR(calcProfitPerUnit)} / {formData.unit}
                </span>
              </div>
            </div>

            {/* Current Stock */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                placeholder="Initial quantity on hand"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
              />
            </div>

            {/* Min Stock Warning Level */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Low Stock Alert Threshold
              </label>
              <input
                type="number"
                min="0"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                placeholder="Warn me when stock drops below"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Supplier */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Preferred Supplier / Vendor
              </label>
              <select
                value={formData.supplier}
                onChange={(e) => {
                  const sup = suppliers.find((s) => s._id === e.target.value);
                  setFormData({
                    ...formData,
                    supplier: e.target.value,
                    supplierName: sup ? sup.name : '',
                  });
                }}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Direct / Walk-in Vendor</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} {s.company ? `(${s.company})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={formSubmitting}>
              {editingProduct ? 'Save Changes' : 'Add Product to Catalog'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirm Delete Product"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to delete this product? This will remove the item from your
            active catalogue.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
