import React, { useState } from 'react';
import { Settings, Store, User, Phone, MapPin, ShieldCheck, Check, Save } from 'lucide-react';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function SettingsPage() {
  const { user, shop, updateProfile } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    shopName: shop?.name || '',
    shopAddress: shop?.address || '',
    gstNumber: shop?.gstNumber || '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMsg(null);

    try {
      setSubmitting(true);
      await updateProfile(formData);
      setAlertMsg({ type: 'success', text: 'Store profile updated successfully!' });
    } catch (err) {
      setAlertMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {t('settings')} & Shop Profile
        </h2>
        <p className="text-xs text-slate-500">
          Update your store branding, contact information, GST number, and print layout
        </p>
      </div>

      {alertMsg && (
        <Alert type={alertMsg.type} message={alertMsg.text} onClose={() => setAlertMsg(null)} />
      )}

      {/* Main Settings Form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 text-xs">
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Store className="w-4 h-4 text-brand-600 flex-shrink-0" />
            Store Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Shop Name */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Shop / Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs sm:text-sm font-semibold"
              />
            </div>

            {/* GSTIN */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                GSTIN / Tax Identification
              </label>
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                placeholder="27AABCS1429B1Z8"
                className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs sm:text-sm font-mono"
              />
            </div>

            {/* Shop Address */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Shop Physical Address (Printed on Invoices)
              </label>
              <input
                type="text"
                value={formData.shopAddress}
                onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs sm:text-sm"
              />
            </div>
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider pt-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600 flex-shrink-0" />
            Shopkeeper Contact Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Owner Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs sm:text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Registered Login Email
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-xs sm:text-sm cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Primary login email cannot be changed
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Default Currency
              </label>
              <input
                type="text"
                disabled
                value="₹ INR - Indian Rupee (Default)"
                className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 text-xs sm:text-sm font-bold cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button type="submit" variant="primary" size="lg" icon={Save} loading={submitting} className="w-full sm:w-auto">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
