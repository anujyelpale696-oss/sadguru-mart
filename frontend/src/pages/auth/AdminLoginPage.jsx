import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Mail, Lock, LogIn, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LanguageSelector from '../../components/language/LanguageSelector';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

export default function AdminLoginPage() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide administrative credentials.');
      return;
    }

    try {
      setLoading(true);
      await adminLogin(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Admin authentication failed. Only authorized administrators can access this console.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@sadgurumart.com');
    setPassword('Admin@123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      {/* Top Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-600/20 text-rose-500 border border-rose-500/30 mb-3 shadow-lg shadow-rose-500/10">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          System Admin Portal
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Restricted access console for system management & shopkeeper monitoring
        </p>

        <div className="mt-3 flex items-center justify-center">
          <LanguageSelector variant="dark" />
        </div>
      </div>

      {/* Main Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900 py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-8 space-y-5">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sadgurumart.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="danger"
              size="lg"
              loading={loading}
              icon={LogIn}
              className="w-full text-sm font-bold shadow-md shadow-rose-500/25"
            >
              Authenticate as Administrator
            </Button>
          </form>

          {/* Quick Demo Fill */}
          <div className="pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-rose-950/50 text-rose-300 hover:bg-rose-900/60 border border-rose-800/50 transition-colors flex items-center justify-center gap-1.5"
            >
              🛡️ Fill Demo Administrator Credentials
            </button>
          </div>

          {/* Back to regular site */}
          <div className="pt-3 border-t border-slate-800 text-center space-y-2 text-xs">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Shopkeeper Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
