import React, { useState } from 'react';
import { X, Printer, QrCode, FileText, Download, Check } from 'lucide-react';

export default function JobTicketModal({ isOpen, onClose, summary, docInfo }) {
  const [customerName, setCustomerName] = useState('Student / Customer');
  const [jobId, setJobId] = useState(() => `JOB-${Math.floor(1000 + Math.random() * 9000)}`);
  const [notes, setNotes] = useState('2-up Duplex paper saving mode');

  if (!isOpen || !summary) return null;

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 transition print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Print Shop Job Ticket & Invoice Slip</h3>
            <p className="text-slate-400 text-xs">Job specification ticket for counter operators</p>
          </div>
        </div>

        {/* Printable Ticket Box */}
        <div className="bg-white text-slate-900 p-6 rounded-xl border border-slate-300 space-y-4 shadow-inner font-sans">
          <div className="flex justify-between items-start border-b border-slate-300 pb-3">
            <div>
              <h2 className="font-black text-xl text-slate-900 tracking-wide">PRINTSMART JOB TICKET</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {jobId} • Date: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="w-14 h-14 bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-slate-700">
              <QrCode className="w-10 h-10" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-semibold block">Customer Name:</span>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:outline-none w-full"
              />
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">File Name:</span>
              <span className="font-bold text-slate-900 truncate block">{docInfo?.name || 'Document.pdf'}</span>
            </div>
          </div>

          <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-600">Original PDF Pages:</span>
              <span className="font-bold text-slate-900">{summary.totalInputPages} Pages</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Layout Format:</span>
              <span className="font-bold text-indigo-700">{summary.pagesPerSide} Pages Per Side</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Duplex Mode:</span>
              <span className="font-bold text-slate-900">{summary.duplex ? 'Double Sided (Duplex ON)' : 'Single Sided'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Flip Edge Direction:</span>
              <span className="font-bold text-amber-700 uppercase">{summary.flipEdge} EDGE FLIP</span>
            </div>
            <div className="flex justify-between border-t border-slate-300 pt-1.5 font-bold">
              <span className="text-slate-800">Physical Sheets to Load:</span>
              <span className="text-emerald-700 text-sm">{summary.totalSheets} Sheets ({summary.paperSize})</span>
            </div>
          </div>

          <div>
            <span className="text-slate-500 font-semibold text-xs block">Operator Special Instructions:</span>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded p-1.5 mt-1 w-full"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold"
          >
            Close
          </button>
          <button
            onClick={handlePrintSlip}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg"
          >
            <Printer className="w-4 h-4" />
            <span>Print Job Ticket</span>
          </button>
        </div>

      </div>
    </div>
  );
}
