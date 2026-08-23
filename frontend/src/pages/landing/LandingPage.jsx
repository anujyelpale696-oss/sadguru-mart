import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Boxes,
  ShoppingCart,
  TrendingUp,
  Receipt,
  FileBarChart,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Store,
  IndianRupee,
  Layers,
  Clock,
  Printer,
  Smartphone,
  Award,
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import LanguageSelector from '../../components/language/LanguageSelector';
import Button from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function LandingPage() {
  const { t } = useLanguage();
  const { login, adminLogin } = useAuth();
  const navigate = useNavigate();

  // Quick Demo Login Handler
  const handleQuickShopkeeperDemo = async () => {
    try {
      await login('shopkeeper@sadgurumart.com', 'Shop@123');
      navigate('/dashboard');
    } catch (err) {
      navigate('/login');
    }
  };

  const handleQuickAdminDemo = async () => {
    try {
      await adminLogin('admin@sadgurumart.com', 'Admin@123');
      navigate('/admin/dashboard');
    } catch (err) {
      navigate('/admin/login');
    }
  };

  const features = [
    {
      icon: Boxes,
      title: t('feature1Title'),
      desc: t('feature1Desc'),
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: ShoppingCart,
      title: t('feature2Title'),
      desc: t('feature2Desc'),
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: Layers,
      title: t('feature3Title'),
      desc: t('feature3Desc'),
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: TrendingUp,
      title: t('feature4Title'),
      desc: t('feature4Desc'),
      color: 'from-amber-500 to-orange-600',
    },
    {
      icon: Receipt,
      title: t('feature5Title'),
      desc: t('feature5Desc'),
      color: 'from-rose-500 to-red-600',
    },
    {
      icon: FileBarChart,
      title: t('feature6Title'),
      desc: t('feature6Desc'),
      color: 'from-cyan-500 to-blue-600',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-100/60 via-emerald-50/40 to-transparent blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold tracking-wide uppercase shadow-sm">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Tailored for Indian Retail & Kirana Stores</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              {t('heroTitle')}
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
              {t('heroSubtitle')}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto text-base shadow-lg shadow-brand-500/25">
                  {t('getStarted')} (Free Registration)
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="lg"
                onClick={handleQuickShopkeeperDemo}
                className="w-full sm:w-auto text-base"
              >
                🚀 1-Click Shopkeeper Demo
              </Button>
              <Button
                variant="dark"
                size="lg"
                onClick={handleQuickAdminDemo}
                className="w-full sm:w-auto text-base"
              >
                🛡️ 1-Click Admin Demo
              </Button>
            </div>

            {/* Trust points */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-600" /> 10 Indian Languages
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-600" /> Indian Rupee (₹) Native
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-600" /> Complete Shop Isolation
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-600" /> Printable Invoices & CSV
              </span>
            </div>
          </div>

          {/* Interactive Live Dashboard Mockup Preview */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="rounded-3xl p-3 bg-slate-900/5 ring-1 ring-slate-900/10 shadow-2xl backdrop-blur-sm">
              <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-inner">
                {/* Mock Header */}
                <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-xs font-bold text-slate-300 ml-2">
                      Sadguru Kirana & General Store — Live POS & Analytics
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    🟢 Live System
                  </span>
                </div>

                {/* Mock Metrics Row */}
                <div className="p-6 bg-slate-50/50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Today's Revenue</p>
                    <p className="text-xl font-extrabold text-slate-900 mt-0.5">₹1,690</p>
                    <span className="text-[10px] font-bold text-emerald-600">+12% vs yesterday</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Today's Profit</p>
                    <p className="text-xl font-extrabold text-emerald-600 mt-0.5">₹328</p>
                    <span className="text-[10px] font-bold text-emerald-600">Net Profit</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Stock</p>
                    <p className="text-xl font-extrabold text-slate-900 mt-0.5">573 Units</p>
                    <span className="text-[10px] font-bold text-blue-600">15 Products</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Stock Alerts</p>
                    <p className="text-xl font-extrabold text-amber-600 mt-0.5">2 Items</p>
                    <span className="text-[10px] font-bold text-amber-600">1 Low, 1 Out</span>
                  </div>
                </div>

                {/* Mock Table Snippet */}
                <div className="p-6 bg-white overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase">
                        <th className="pb-3">Product Name</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Stock</th>
                        <th className="pb-3">Purchase</th>
                        <th className="pb-3">Selling</th>
                        <th className="pb-3">Profit/Unit</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="py-2.5 font-bold text-slate-900">Daawat Rozana Basmati Rice</td>
                        <td>Grains & Rice</td>
                        <td>120 kg</td>
                        <td>₹85</td>
                        <td>₹110</td>
                        <td className="text-emerald-600 font-semibold">+₹25</td>
                        <td><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">In Stock</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-slate-900">Gemini Pure Groundnut Oil (1L)</td>
                        <td>Edible Oils</td>
                        <td className="font-bold text-amber-600">4 Litre</td>
                        <td>₹160</td>
                        <td>₹190</td>
                        <td className="text-emerald-600 font-semibold">+₹30</td>
                        <td><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">Low Stock</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-slate-900">Lifebuoy Handwash (750ml)</td>
                        <td>Personal Care</td>
                        <td className="font-bold text-rose-600">0 pcs</td>
                        <td>₹95</td>
                        <td>₹125</td>
                        <td className="text-emerald-600 font-semibold">+₹30</td>
                        <td><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700">Out of Stock</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section id="features" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold text-brand-600 tracking-wider uppercase">
              Complete Feature Suite
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything Your Shop Needs To Thrive
            </h3>
            <p className="text-slate-500 text-sm">
              From billing walk-in customers to recording supplier purchases and checking monthly profit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-slate-50/70 rounded-2xl p-7 border border-slate-200/80 hover:border-brand-300 hover:shadow-lg transition-all duration-200 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shadow-md mb-5 group-hover:scale-110 transition-transform`}
                >
                  <f.icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-Language Highlight Banner */}
      <section className="py-16 bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl text-center lg:text-left">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                🌐 Multilingual by Design
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Available in 10 Major Indian Languages
              </h3>
              <p className="text-slate-300 text-sm">
                English, मराठी (Marathi), हिंदी (Hindi), ગુજરાતી (Gujarati), বাংলা (Bengali), தமிழ்
                (Tamil), తెలుగు (Telugu), ಕನ್ನಡ (Kannada), മലയാളം (Malayalam), and ਪੰਜਾਬੀ (Punjabi).
              </p>
            </div>
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
              <span className="text-sm font-semibold">Try Switching Language:</span>
              <LanguageSelector variant="dark" />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase">
                <Store className="w-3.5 h-3.5" /> Made for Local Businesses
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Simple enough for a local shopkeeper, professional enough for an expanding retail chain.
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Traditional shopkeeping involves piles of paper notebooks, forgotten credit balances,
                and guessing whether the shop made a profit or loss at the end of the month.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                <strong>Sadguru Mart</strong> solves this completely: Every time you make a sale, your
                inventory automatically reduces, your gross profit is calculated item-by-item, and your
                net profit updates after deducting rent, electricity, and salaries.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <p className="text-2xl font-extrabold text-brand-600">100%</p>
                  <p className="text-xs text-slate-500 font-medium">Data Isolated Per Shop</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <p className="text-2xl font-extrabold text-brand-600">₹ INR</p>
                  <p className="text-xs text-slate-500 font-medium">Indian Number Format</p>
                </div>
              </div>
            </div>

            {/* Testimonials / Shop Types */}
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                    RK
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Rajesh Kirana & General Stores</h5>
                    <p className="text-xs text-slate-400">Market Yard, Pune</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 italic">
                  "Before Sadguru Mart, I always had out-of-stock items without knowing. Now I get
                  instant warning alerts on my dashboard and print invoices directly for my customers."
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    GP
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Shree Ganesh Supermarket</h5>
                    <p className="text-xs text-slate-400">Kolhapur</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 italic">
                  "The Marathi and Hindi language support makes it super easy for my counter boys to
                  operate the billing terminal without errors."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white border-t border-slate-200 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Ready to upgrade your shop management?
          </h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Create your account in 30 seconds and start managing your products, stock, sales, and profits today.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="shadow-lg shadow-brand-500/25">
                Register Your Shop Now
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
