import React from 'react';
import { Store, Heart, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* Col 1: Brand */}
          <div className="space-y-3 sm:space-y-4 xs:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                <Store className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Sadguru <span className="text-brand-400">Mart</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed specially for local Indian shopkeepers and retail businesses to manage stock,
              record daily sales, track expenses, and compute exact business profits with ease.
            </p>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1 sm:pt-2">
              <ShieldCheck className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <span>Multi-Tenant Data Isolated & Secure</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider mb-3 sm:mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#features" className="hover:text-brand-400 transition-colors">
                  Features & Capabilities
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-brand-400 transition-colors">
                  About Sadguru Mart
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-400 transition-colors">
                  Shopkeeper Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-400 transition-colors">
                  Create Shop Account
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-brand-400 transition-colors">
                  Admin Management Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Modules */}
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider mb-3 sm:mb-4">
              Core Modules
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Inventory & Low Stock Alerts</li>
              <li>Fast POS Billing & Receipts</li>
              <li>Supplier Purchases & Inflow</li>
              <li>Expense Categories Tracker</li>
              <li>Real-time Profit & Loss Matrix</li>
              <li>Multi-Language (10 Languages)</li>
            </ul>
          </div>

          {/* Col 4: Contact info */}
          <div className="xs:col-span-2 md:col-span-1">
            <h4 className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider mb-3 sm:mb-4">
              Contact & Support
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <span>khandoba mandir, Ajanale</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>8087224946</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>252161051@sguk.ac.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 sm:gap-4 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Sadguru Mart Inventory System. All rights reserved.</p>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
