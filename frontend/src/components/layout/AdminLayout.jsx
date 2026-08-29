import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  LayoutDashboard,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LanguageSelector from '../language/LanguageSelector';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview & Usage', end: true },
    { to: '/admin/users', icon: Users, label: 'Registered Shopkeepers' },
    { to: '/admin/activity', icon: Activity, label: 'Audit Activity Logs' },
    { to: '/admin/settings', icon: Settings, label: 'System Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto border-r border-slate-800 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-sm shadow-rose-500/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">Admin Console</span>
              <span className="block text-[9px] text-rose-400 font-bold uppercase tracking-wider">
                Super Administrator
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/60">
          <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
          <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <span>Visit Landing Page</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Admin Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
        <header className="sticky top-0 z-30 h-14 sm:h-16 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-1 rounded-xl text-slate-400 hover:bg-slate-800 lg:hidden focus:outline-none focus:ring-2 focus:ring-rose-500"
              aria-label="Open Admin Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 truncate max-w-[140px] xs:max-w-[220px] sm:max-w-none">
              Admin Environment
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <LanguageSelector variant="dark" />
            <div className="w-8 h-8 rounded-full bg-rose-600/30 text-rose-300 font-bold flex items-center justify-center text-xs border border-rose-500/40">
              ADM
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 xs:p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
