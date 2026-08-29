import React, { useState, useEffect } from 'react';
import { Activity, Search, ShieldCheck, Clock, Layers } from 'lucide-react';
import Badge from '../../components/common/Badge';
import { adminService } from '../../services/api';
import { formatDateTime } from '../../utils/currency';

export default function AdminActivityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('All');

  const modules = [
    'All',
    'Auth',
    'Product',
    'Inventory',
    'Sale',
    'Purchase',
    'Expense',
    'Admin',
    'System',
  ];

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await adminService.getActivityLogs({
        module: moduleFilter !== 'All' ? moduleFilter : undefined,
      });
      if (res.data.success) {
        setLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [moduleFilter]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">System Audit Activity Logs</h2>
        <p className="text-xs text-slate-400">
          Timestamped security and transactional audit trail across all platform modules
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto touch-scroll no-scrollbar pb-1">
        {modules.map((m) => (
          <button
            key={m}
            onClick={() => setModuleFilter(m)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
              moduleFilter === m
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs min-w-[620px]">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">User / Initiator</th>
                <th className="p-3.5">Module</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5 text-slate-400 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="p-3.5 font-semibold text-white whitespace-nowrap">
                      {log.userName || log.userEmail || 'System'}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-700">
                        {log.module}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-emerald-400 whitespace-nowrap">{log.action}</td>
                    <td className="p-3.5 text-slate-400 font-mono text-[11px] max-w-xs truncate">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    No activity logs recorded for this module.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
