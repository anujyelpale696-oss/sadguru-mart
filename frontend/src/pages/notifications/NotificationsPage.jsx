import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Trash2,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { notificationService } from '../../services/api';
import { formatDateTime } from '../../utils/currency';
import { useLanguage } from '../../context/LanguageContext';

export default function NotificationsPage() {
  const { t } = useLanguage();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getAll();
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      fetchNotifications();
    } catch (err) {
      alert('Failed to mark all as read');
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      fetchNotifications();
    } catch (err) {
      alert('Failed to delete notification');
    }
  };

  const getIcon = (type) => {
    if (type === 'danger') return <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />;
    if (type === 'warning') return <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
    if (type === 'success') return <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
    return <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />;
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t('notifications')} & Business Alerts
          </h2>
          <p className="text-xs text-slate-500">
            Real-time triggers for out-of-stock items, purchase deliveries, and revenue updates
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" icon={CheckCheck} size="sm" onClick={handleMarkAllRead} className="w-full sm:w-auto">
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Loading system alerts...
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-3.5 sm:p-5 flex items-start justify-between gap-3 sm:gap-4 transition-colors ${
                !n.isRead ? 'bg-brand-50/30' : 'hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-start gap-2.5 sm:gap-3.5 flex-1 min-w-0">
                {getIcon(n.type)}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                    <span>{formatDateTime(n.createdAt)}</span>
                    {n.link && (
                      <Link
                        to={n.link}
                        onClick={() => handleMarkSingleRead(n._id)}
                        className="text-brand-600 hover:underline font-semibold flex items-center gap-1"
                      >
                        Action <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkSingleRead(n._id)}
                    className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Mark as Read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-xs text-slate-400">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No notifications available. All store operations are on track!
          </div>
        )}
      </div>
    </div>
  );
}
