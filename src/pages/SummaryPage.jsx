import React, { useState } from 'react';
import {
  Download, FileText, Printer, CheckCircle2, Leaf, ArrowLeft,
  Wifi, Usb, Zap, Check, Sliders, ExternalLink, HelpCircle
} from 'lucide-react';
import PaperCalculator from '../components/PaperCalculator';

export default function SummaryPage({
  summary,
  docInfo,
  appMode,
  bindingType,
  onGeneratePdf,
  isGenerating,
  onDirectPrint,
  isPrinting,
  activePrinter,
  onOpenPrinterModal,
  onOpenJobTicket,
  onOpenManualDuplex,
  onPrev
}) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);
  const [downloadedFile, setDownloadedFile] = useState('');

  const handleDownloadClick = async () => {
    const res = await onGeneratePdf();
    if (res && res.success) {
      setDownloadedFile(res.fileName || `${docInfo.name}_PRINT_READY.pdf`);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 8000);
    }
  };

  const handlePrintClick = async () => {
    setPrintSuccess(true);
    await onDirectPrint();
    setTimeout(() => setPrintSuccess(false), 5000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 py-4 sm:py-6 px-3 sm:px-4">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-[11px] uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Step 4 of 4 • Print & Download
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Ready to Print & Download
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          Pages are imposed and aligned for your printer. Send directly to your printer or download the PDF file.
        </p>
      </div>

      {/* Main Action Hero Card */}
      <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/40 p-5 sm:p-8 rounded-3xl shadow-2xl space-y-6">
        
        {/* Document Info Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto shadow-inner">
            <Printer className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white break-words">{docInfo.name}</h2>
          
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 text-xs text-slate-300">
            <span className="bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
              📄 {summary.totalInputPages} Input Pages
            </span>
            <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold">
              📑 {summary.totalSheets} Physical Sheets
            </span>
            <span className="bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700 capitalize">
              📐 {summary.pagesPerSide} Pages/Side ({summary.flipEdge} Edge)
            </span>
          </div>
        </div>

        {/* Connected Printer Status Bar */}
        <div className="bg-slate-800/60 border border-slate-700/80 p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-750 text-indigo-400 flex-shrink-0">
              {activePrinter?.type === 'wifi' && <Wifi className="w-4 h-4 text-sky-400" />}
              {activePrinter?.type === 'usb' && <Usb className="w-4 h-4 text-emerald-400" />}
              {activePrinter?.type === 'system' && <Printer className="w-4 h-4 text-indigo-400" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white truncate">{activePrinter?.name || 'System Printer'}</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {activePrinter?.duplex || 'Duplex Ready'} • {activePrinter?.paperTray || 'A4 Paper Tray'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenPrinterModal}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 font-semibold transition text-xs flex items-center justify-center space-x-1.5 flex-shrink-0"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Change / Connect Printer</span>
          </button>
        </div>

        {/* Primary Dual Actions: Print Now & Download PDF */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          
          {/* Action 1: Print to Printer */}
          <button
            onClick={handlePrintClick}
            disabled={isPrinting}
            className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-sm sm:text-base py-4 px-5 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2.5 transition transform active:scale-95 disabled:opacity-50"
          >
            <Printer className="w-5 h-5" />
            <span>{isPrinting ? 'Sending to Printer...' : `Print to ${activePrinter?.name?.split(' ')[0] || 'Printer'}`}</span>
          </button>

          {/* Action 2: Download Imposed PDF */}
          <button
            onClick={handleDownloadClick}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm sm:text-base py-4 px-5 rounded-2xl shadow-xl shadow-indigo-600/25 flex items-center justify-center space-x-2.5 transition transform active:scale-95 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            <span>{isGenerating ? 'Imposing & Compiling...' : 'Download Print-Ready PDF'}</span>
          </button>

        </div>

        {/* Status Notification Toasts */}
        {printSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Print job dispatched! Check your system print dialog to finalize.</span>
          </div>
        )}

        {downloadSuccess && (
          <div className="p-3.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center space-x-2.5 truncate">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span className="truncate">Downloaded: <strong>{downloadedFile}</strong></span>
            </div>
            <span className="text-[11px] text-slate-400 flex-shrink-0">Saved to Downloads folder</span>
          </div>
        )}

        {/* Secondary Helpful Guides */}
        <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <button
            onClick={onOpenManualDuplex}
            className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Manual Duplex Paper Feed Guide</span>
          </button>

          {appMode === 'shop' && (
            <>
              <span>•</span>
              <button
                onClick={onOpenJobTicket}
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Print Shop Job Invoice Slip</span>
              </button>
            </>
          )}
        </div>

      </div>

      {/* Analytics & Paper Calculator */}
      <PaperCalculator
        summary={summary}
        appMode={appMode}
        bindingType={bindingType}
      />

      {/* Back Button */}
      <div className="flex justify-start">
        <button
          onClick={onPrev}
          className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-xs flex items-center space-x-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to 3D Preview</span>
        </button>
      </div>

    </div>
  );
}
