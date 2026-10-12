import React from 'react';
import { Printer, HelpCircle, Store, GraduationCap, FileText, Sparkles, BookOpen, Zap, SlidersHorizontal } from 'lucide-react';

export default function Navbar({
  uxMode,
  setUxMode,
  onOpenPrinterModal,
  activePrinter,
  onOpenHelp,
  onOpenJobTicket,
  pdfLoaded,
  activeDocName
}) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-3 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 flex-shrink-0">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2 sm:p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <Printer className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <h1 className="font-extrabold text-lg sm:text-xl bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                PrintSmart
              </h1>
              <span className="text-[9px] sm:text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hidden xs:inline-block">
                Easy Print
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              Visual Print Planner, Duplex Simulator & Imposition Engine
            </p>
          </div>
        </div>

        {/* Loaded Document Name Pill (Hidden on mobile) */}
        {pdfLoaded && activeDocName && (
          <div className="hidden lg:flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 rounded-full px-3 py-1 text-xs text-slate-300">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium max-w-[180px] truncate">{activeDocName}</span>
          </div>
        )}

        {/* Right Action Bar */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Printer Connection Status Button */}
          <button
            onClick={onOpenPrinterModal}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 transition shadow-sm active:scale-95"
            title="Printer Connection Hub & Device Status"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <Printer className="w-3.5 h-3.5 text-indigo-400 hidden xs:inline" />
            <span className="max-w-[100px] sm:max-w-[140px] truncate text-[11px] sm:text-xs">
              {activePrinter?.name?.split(' ')[0] || 'Printer'}: Ready
            </span>
          </button>

          {/* Simple vs Pro Mode Toggle */}
          <div className="bg-slate-950 p-0.5 sm:p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => setUxMode('simple')}
              className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-[11px] sm:text-xs transition-all ${
                uxMode === 'simple'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Simple Mode: Easy, 1-click recommendations"
            >
              <Zap className="w-3 h-3 text-amber-300" />
              <span>Simple</span>
            </button>
            <button
              onClick={() => setUxMode('pro')}
              className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-[11px] sm:text-xs transition-all ${
                uxMode === 'pro'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Pro Mode: Full imposition parameters & shop rates"
            >
              <SlidersHorizontal className="w-3 h-3 text-indigo-300" />
              <span>Pro</span>
            </button>
          </div>

          {/* Flip Guide Trigger */}
          <button
            onClick={onOpenHelp}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition"
            title="Help & Flip Explanation Guide"
          >
            <BookOpen className="w-4 h-4 text-indigo-400 sm:mr-1 inline" />
            <span className="hidden sm:inline">Guide</span>
          </button>

        </div>
      </div>
    </header>
  );
}
