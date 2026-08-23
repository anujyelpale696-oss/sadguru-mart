import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Store,
  ShieldCheck,
  Phone,
  Mail,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Eye,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import { adminService } from '../../services/api';
import { formatDateTime } from '../../utils/currency';

export default function AdminUsersPage() {
  const [shopkeepers, setShopkeepers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchShopkeepers = async () => {
    try {
      setLoading(true);
      const params = {
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };
      const res = await adminService.getShopkeepers(params);
      if (res.data.success) {
        setShopkeepers(res.data.shopkeepers || []);
      }
    } catch (err) {
      console.error('Error loading shopkeepers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchShopkeepers();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleToggleStatus = async (user) => {
    const newStatus = !user.isActive;
    const confirmMsg = newStatus
      ? `Activate account for ${user.name}?`
      : `Deactivate account for ${user.name}? They will be blocked from logging into their shop until reactivated.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoading(true);
      await adminService.toggleShopkeeperStatus(user.id, newStatus);
      fetchShopkeepers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change user status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Registered Shopkeepers & Stores
          </h2>
          <p className="text-xs text-slate-400">
            Monitor registered shopkeeper accounts, audit last login timestamps, and manage store access
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'active', 'inactive'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Shopkeepers Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Shopkeeper</th>
                <th className="p-3.5">Shop / Store Name</th>
                <th className="p-3.5">Contact Email</th>
                <th className="p-3.5">Registration Date</th>
                <th className="p-3.5">Last Login</th>
                <th className="p-3.5 text-center">Catalogue</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Account Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    Loading shopkeepers telemetry...
                  </td>
                </tr>
              ) : shopkeepers.length > 0 ? (
                shopkeepers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-[10px] text-slate-500">{u.phone || 'No phone'}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5" />
                        {u.shop?.name || 'Unassigned'}
                      </div>
                      {u.shop?.address && (
                        <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                          {u.shop.address}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">{u.email}</td>
                    <td className="p-3.5 text-slate-400">{formatDateTime(u.createdAt)}</td>
                    <td className="p-3.5 text-slate-400">
                      {u.lastLogin ? formatDateTime(u.lastLogin) : 'Never'}
                    </td>
                    <td className="p-3.5 text-center font-bold text-slate-300">
                      {u.productCount || 0} products
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors inline-flex items-center gap-1"
                        title="View Store Info"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">Details</span>
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                          u.isActive
                            ? 'bg-rose-950/60 text-rose-300 hover:bg-rose-900 border border-rose-800/60'
                            : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 border border-emerald-800/60'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    No shopkeepers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Shopkeeper Account Inspection"
        maxWidth="max-w-lg"
      >
        {selectedUser && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-sm text-slate-900">{selectedUser.name}</h4>
                <p className="text-slate-500">{selectedUser.email}</p>
              </div>
              <Badge variant={selectedUser.isActive ? 'success' : 'danger'}>
                {selectedUser.isActive ? 'Active' : 'Suspended'}
              </Badge>
            </div>

            <div className="space-y-2 border border-slate-200 rounded-xl p-4">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Store / Shop Name:</span>
                <span className="font-bold text-slate-900">{selectedUser.shop?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Phone:</span>
                <span>{selectedUser.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">GSTIN:</span>
                <span className="font-mono">{selectedUser.shop?.gstNumber || 'None'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Address:</span>
                <span>{selectedUser.shop?.address || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-semibold">Registered Products Count:</span>
                <span className="font-bold text-brand-600">{selectedUser.productCount} items</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
