import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, Menu, X, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import LanguageSelector from '../language/LanguageSelector';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { t } = useLanguage();
  const { isAuthenticated, isShopkeeper, isAdmin, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <Store className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1 truncate">
                Sadguru <span className="text-brand-600">Mart</span>
              </span>
              <span className="block text-[9px] sm:text-[10px] font-semibold text-slate-400 -mt-0.5 sm:-mt-1 tracking-wider uppercase truncate">
                Inventory OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
            >
              {t('features')}
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
            >
              {t('about')}
            </a>
            <a
              href="#contact"
              className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
            >
              {t('contact')}
            </a>
          </nav>

          {/* Right Header Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <Link
                to={isAdmin ? '/admin/dashboard' : '/dashboard'}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-500/30 transition-all"
              >
                <UserCheck className="w-4 h-4" />
                {t('dashboard')}
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-500/30 transition-all hover:translate-y-[-1px]"
                >
                  {t('getStarted')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/admin/login"
                  title="Admin Login Portal"
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <ShieldCheck className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-1.5 xs:gap-2 md:hidden">
            <LanguageSelector />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            {t('features')}
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            {t('about')}
          </a>
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            {t('contact')}
          </a>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                to={isAdmin ? '/admin/dashboard' : '/dashboard'}
                className="w-full text-center py-2.5 text-sm font-semibold rounded-xl text-white bg-brand-600"
              >
                Go to {t('dashboard')}
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-full text-center py-2.5 text-sm font-semibold rounded-xl border border-slate-300 text-slate-700"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="w-full text-center py-2.5 text-sm font-semibold rounded-xl text-white bg-brand-600"
                >
                  {t('getStarted')}
                </Link>
                <Link
                  to="/admin/login"
                  className="w-full text-center py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  {t('adminLogin')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
