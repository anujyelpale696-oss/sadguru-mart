import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Mail, Lock, LogIn, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../../components/language/LanguageSelector';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoShopkeeper = () => {
    setEmail('shopkeeper@sadgurumart.com');
    setPassword('Shop@123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      {/* Top Header info */}
      <div className="w-full max-w-[94vw] sm:max-w-md mx-auto text-center">
        <Link to="/" className="inline-flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4 group">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
            <Store className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Sadguru <span className="text-brand-600">Mart</span>
          </span>
        </Link>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Shopkeeper Login
        </h2>
        <p className="mt-1 text-xs text-slate-500 px-2">
          Sign in to access your shop's inventory, sales, and profit reports
        </p>

        {/* Language selector helper */}
        <div className="mt-3 flex items-center justify-center">
          <LanguageSelector />
        </div>
      </div>

      {/* Main Login Card */}
      <div className="mt-4 sm:mt-6 w-full max-w-[94vw] sm:max-w-md mx-auto">
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-8 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 space-y-4 sm:space-y-5">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. shopkeeper@sadgurumart.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span>Remember me</span>
              </label>
              <span className="text-brand-600 hover:underline cursor-pointer font-medium">
                Forgot password?
              </span>
            </div>

            <Button
              type="submit"
              size="lg"
              loading={loading}
              icon={LogIn}
              className="w-full text-sm font-bold shadow-md shadow-brand-500/25"
            >
              Sign In to Store
            </Button>
          </form>

          {/* Quick Demo Fill Button */}
          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={fillDemoShopkeeper}
              className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center justify-center gap-1.5"
            >
              ⚡ Fill Demo Shopkeeper Credentials
            </button>
          </div>

          {/* Footer links */}
          <div className="pt-3 border-t border-slate-100 text-center space-y-2 text-xs">
            <p className="text-slate-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-brand-600 hover:underline">
                Create new shop account
              </Link>
            </p>
            <div className="pt-1">
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-700 font-medium"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Are you an Administrator? Login as Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
