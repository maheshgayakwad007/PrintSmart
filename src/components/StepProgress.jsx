import React from 'react';
import { Upload, Sliders, Eye, Printer, Download, Sparkles } from 'lucide-react';

export default function StepProgress({ activeTab, setActiveTab }) {
  const steps = [
    { id: 'upload', label: 'Document', number: 1, icon: Upload },
    { id: 'settings', label: 'Print Style', number: 2, icon: Sliders },
    { id: 'preview', label: '3D Preview', number: 3, icon: Eye },
    { id: 'summary', label: 'Print & Download', number: 4, icon: Printer }
  ];

  const currentIdx = steps.findIndex(s => s.id === activeTab);

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-3 sm:px-6 py-2.5 backdrop-blur-md sticky top-14 z-30 shadow-md">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Step Buttons */}
        <div className="w-full flex items-center justify-between gap-1.5 sm:gap-3 overflow-x-auto no-scrollbar">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeTab === step.id;
            const isCompleted = currentIdx > idx;

            return (
              <button
                key={step.id}
                onClick={() => setActiveTab(step.id)}
                className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 scale-100 ring-2 ring-indigo-400/30'
                    : isCompleted
                    ? 'bg-slate-800/80 text-emerald-400 hover:bg-slate-800'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {isCompleted ? '✓' : step.number}
                </span>

                <span className="truncate">{step.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
