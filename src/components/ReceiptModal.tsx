import React from 'react';
import { 
  CheckCircle2, 
  Printer, 
  Download, 
  X, 
  ShieldCheck, 
  Building2, 
  QrCode,
  Share2
} from 'lucide-react';
import { Transaction } from '../types';

interface ReceiptModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Printable Area */}
        <div id="printable-receipt" className="p-6 sm:p-8 bg-white">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm">
                  TF
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight leading-none">
                    TATITO FINANCIAL SERVICES
                  </h3>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Kadapa, Andhra Pradesh, India
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md inline-block">
                BHARAT BILLPAY (BBPS)
              </span>
              <div className="text-[9px] text-slate-400 mt-1">NPCI Certified Txn</div>
            </div>
          </div>

          {/* Success Banner */}
          <div className="text-center py-5 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Payment Acknowledged &amp; Settled
            </h4>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
              ₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
              BBPS Ref: {transaction.bbpsRefNo}
            </p>
          </div>

          {/* Transaction Metadata Table */}
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Transaction ID:</span>
              <span className="font-mono font-bold text-slate-900">{transaction.referenceId}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Biller / Service:</span>
              <span className="font-bold text-slate-900">{transaction.operator}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Consumer / Identifier:</span>
              <span className="font-mono font-bold text-slate-900">{transaction.accountIdentifier}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Customer Name:</span>
              <span className="font-bold text-slate-800">{transaction.customerName}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Payment Mode:</span>
              <span className="font-bold text-slate-900 uppercase">{transaction.paymentMode}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Convenience Fee:</span>
              <span className="font-bold text-emerald-600">₹0.00 (Zero Fee)</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Date &amp; Time:</span>
              <span className="font-medium text-slate-700">
                {new Date(transaction.createdAt).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'medium'
                })}
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-500">Payment Status:</span>
              <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                {transaction.status}
              </span>
            </div>
          </div>

          {/* Footer note & Verification Barcode */}
          <div className="mt-5 pt-4 border-t border-dashed border-slate-300 text-center text-[10px] text-slate-400 space-y-1">
            <p>
              This is a computer-generated e-receipt issued under Bharat Bill Payment System (BBPS) guidelines.
            </p>
            <p className="font-medium text-slate-600">
              Tatito Financial Services • Trunk Road, Kadapa, AP - 516001 • support@tatitofinance.com
            </p>
          </div>
        </div>

        {/* Action Controls (hidden during print) */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
