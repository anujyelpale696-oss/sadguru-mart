import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, User, Mail, Phone, Lock, MapPin, ArrowRight, UserPlus, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../../components/language/LanguageSelector';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    shopName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    shopAddress: '',
    gstNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !formData.name ||
      !formData.shopName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please check details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="w-full max-w-[94vw] sm:max-w-xl mx-auto text-center">
        <Link to="/" className="inline-flex items-center gap-2 sm:gap-2.5 mb-3 group">
          <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Sadguru <span className="text-brand-600">Mart</span>
          </span>
        </Link>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Create New Shop Account
        </h2>
        <p className="mt-1 text-xs text-slate-500 px-2">
          Set up your store in seconds and start managing inventory & billing
        </p>
        <div className="mt-3 flex items-center justify-center">
          <LanguageSelector />
        </div>
      </div>

      {/* Form Card */}
      <div className="mt-4 sm:mt-6 w-full max-w-[94vw] sm:max-w-xl mx-auto">
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-8 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 space-y-4 sm:space-y-5">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Your Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Santosh Yelpale"
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* Shop Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Shop / Store Name *
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="shopName"
                    required
                    value={formData.shopName}
                    onChange={handleChange}
                    placeholder="e.g. Sadguru Kirana Stores"
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. mystore@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98XXX XXXXX"
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-type password"
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Shop Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Shop Address / Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="shopAddress"
                  value={formData.shopAddress}
                  onChange={handleChange}
                  placeholder="e.g. Shop 4, Main Bazaar, Market Yard, Pune"
                  className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              loading={loading}
              icon={UserPlus}
              className="w-full text-sm font-bold shadow-md shadow-brand-500/25 mt-2"
            >
              Complete Registration & Open Store
            </Button>
          </form>

          {/* Links */}
          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-600">
            Already have a store account?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:underline">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
