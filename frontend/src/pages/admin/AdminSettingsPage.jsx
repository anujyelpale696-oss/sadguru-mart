import React from 'react';
import { Settings, ShieldCheck, Database, Server, Cpu, Globe } from 'lucide-react';
import Badge from '../../components/common/Badge';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">System & Platform Health</h2>
        <p className="text-xs text-slate-400">
          Environment configuration, database topology, and global security policies
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* DB Engine */}
        <div className="bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold">
            <Database className="w-5 h-5 flex-shrink-0" />
            <h3 className="text-sm sm:text-base">MongoDB Multi-Tenant Engine</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Data isolation is enforced at the database query layer via strict tenant key scoping
            (`req.user.shop`).
          </p>
          <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-900 text-slate-400">
            <span>Status:</span>
            <Badge variant="success">Connected & Encrypted</Badge>
          </div>
        </div>

        {/* Security & Token */}
        <div className="bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 text-rose-400 font-bold">
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <h3 className="text-sm sm:text-base">JWT Security Protocol</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Role-Based Access Control (RBAC) active. Separate auth pipelines for Shopkeepers vs
            Admins.
          </p>
          <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-900 text-slate-400">
            <span>Password Hashing:</span>
            <span className="font-mono text-emerald-400 font-bold">Bcrypt 10 Rounds</span>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-3">
        <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400 flex-shrink-0" />
          Multilingual Indian Language Localization Engine
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          10 major Indian regional languages supported: English, Marathi, Hindi, Gujarati, Bengali,
          Tamil, Telugu, Kannada, Malayalam, and Punjabi with dynamic runtime dictionary switching.
        </p>
      </div>
    </div>
  );
}
