import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  CheckCheck,
  ShieldCheck,
  CreditCard,
  TrendingUp,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(Array.isArray(res) ? res : (res?.notifications || []));
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    for (const item of unread) {
      try {
        await api.markNotificationRead(item.id);
      } catch (e) {
        // continue
      }
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'unread') return !item.is_read;
    if (filter === 'loans') return item.type?.toLowerCase().includes('loan');
    if (filter === 'investments') return item.type?.toLowerCase().includes('stock') || item.type?.toLowerCase().includes('invest');
    if (filter === 'payments') return item.type?.toLowerCase().includes('pay') || item.type?.toLowerCase().includes('wallet');
    return true;
  });

  const getIcon = (type: string) => {
    const lower = type?.toLowerCase() || '';
    if (lower.includes('loan')) return <CheckCircle2 className="w-5 h-5 text-[#003366]" />;
    if (lower.includes('stock') || lower.includes('invest')) return <TrendingUp className="w-5 h-5 text-teal-600" />;
    if (lower.includes('pay') || lower.includes('wallet')) return <CreditCard className="w-5 h-5 text-emerald-600" />;
    return <Bell className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003366] flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time loan sanctions, EMI debit alerts, market executions, and account security notices
            </p>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-slate-600" />
            Mark all as read
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'unread', label: 'Unread Only' },
            { id: 'loans', label: 'Loans & EMI' },
            { id: 'investments', label: 'Investments & SIP' },
            { id: 'payments', label: 'Wallet & Payments' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all shrink-0 ${
                filter === tab.id
                  ? 'bg-[#003366] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading notifications...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-700">No notifications found</div>
              <p className="text-xs text-slate-400 mt-0.5">You're all caught up on your account alerts.</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-5 transition-colors flex items-start gap-4 ${
                  notif.is_read ? 'bg-white' : 'bg-blue-50/40'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">{notif.title}</h3>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.created_at).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>

                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {notif.type}
                    </span>
                    {!notif.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="text-[11px] font-semibold text-[#003366] hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
