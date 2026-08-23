import React from 'react';
import { Printer, Download, CheckCircle, Store, Phone, MapPin } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatINR, formatDateTime } from '../../utils/currency';
import { useAuth } from '../../context/AuthContext';

export default function InvoiceModal({ isOpen, onClose, sale }) {
  const { shop } = useAuth();

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tax / Retail Invoice" maxWidth="max-w-xl">
      {/* Printable Invoice Container */}
      <div id="printable-invoice" className="bg-white p-6 rounded-xl border border-slate-200">
        {/* Store Header */}
        <div className="text-center pb-4 border-b-2 border-dashed border-slate-300">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Store className="w-6 h-6 text-brand-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {shop?.name || 'Sadguru Provision Store'}
            </h2>
          </div>
          {shop?.address && (
            <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {shop.address}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 mt-1 text-xs text-slate-500">
            {shop?.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" /> {shop.phone}
              </span>
            )}
            {shop?.gstNumber && (
              <span className="font-semibold text-slate-700">GSTIN: {shop.gstNumber}</span>
            )}
          </div>
        </div>

        {/* Invoice Info Bar */}
        <div className="py-3 border-b border-slate-200 grid grid-cols-2 text-xs">
          <div>
            <span className="text-slate-400">Invoice No:</span>{' '}
            <span className="font-bold text-slate-800">{sale.invoiceNumber}</span>
            <br />
            <span className="text-slate-400">Date:</span>{' '}
            <span className="font-medium text-slate-700">{formatDateTime(sale.date)}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400">Customer:</span>{' '}
            <span className="font-bold text-slate-800">{sale.customerName || 'Walk-in'}</span>
            <br />
            <span className="text-slate-400">Payment:</span>{' '}
            <span className="font-semibold text-emerald-600">{sale.paymentMethod} (PAID)</span>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="text-left py-2">Item</th>
                <th className="text-center py-2">Qty</th>
                <th className="text-right py-2">Rate</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sale.items?.map((item, idx) => (
                <tr key={idx} className="py-2">
                  <td className="py-2 text-slate-800 font-medium">{item.name}</td>
                  <td className="py-2 text-center text-slate-600">
                    {item.quantity} {item.unit || 'pcs'}
                  </td>
                  <td className="py-2 text-right text-slate-600">
                    {formatINR(item.sellingPrice)}
                  </td>
                  <td className="py-2 text-right font-semibold text-slate-800">
                    {formatINR(item.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Totals */}
        <div className="pt-3 border-t-2 border-dashed border-slate-300 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-medium">
              {formatINR(sale.totalAmount + (sale.discount || 0))}
            </span>
          </div>
          {sale.discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span>- {formatINR(sale.discount)}</span>
            </div>
          )}
          {sale.tax > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Tax / GST</span>
              <span>+ {formatINR(sale.tax)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
            <span>Grand Total</span>
            <span className="text-brand-600 font-extrabold">{formatINR(sale.totalAmount)}</span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-5 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
          <p className="font-semibold text-slate-600 mb-0.5">Thank you for your business! Visit Again 🙏</p>
          <p>Software Powered by Sadguru Mart Inventory</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 flex items-center justify-end gap-3 print:hidden">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" icon={Printer} onClick={handlePrint}>
          Print Receipt
        </Button>
      </div>
    </Modal>
  );
}
