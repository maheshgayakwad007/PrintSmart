import React from 'react';
import { X, BookOpen, AlertTriangle, CheckCircle2, RotateCw, RefreshCw, ArrowRight } from 'lucide-react';

export default function FlipEducationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Long Side vs Short Side Paper Flip Guide</h3>
              <p className="text-slate-400 text-xs">Simple explanation of paper flipping & stapling directions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Super Simple 2-Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Long Side */}
          <div className="bg-slate-800/60 p-5 rounded-2xl border border-indigo-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-400 font-extrabold text-base">
                <span className="text-2xl">📖</span>
                <span>Long Side Flip</span>
              </div>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded border border-indigo-500/30">
                Book Style
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-indigo-200 font-semibold">
              📌 Staple / Bind on LONG SIDE (Left Edge)
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              Paper turns left-to-right along its vertical height, exactly like turning a page in a textbook or novel.
            </p>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-14 h-20 bg-white border border-slate-300 rounded text-[10px] font-bold text-slate-800 flex items-center justify-center shadow">
                  Front ▲
                </div>
                <RotateCw className="w-4 h-4 text-indigo-400" />
                <div className="w-14 h-20 bg-white border border-slate-300 rounded text-[10px] font-bold text-slate-800 flex items-center justify-center shadow">
                  Back ▲
                </div>
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-2">
                ✓ Perfect for Portrait Documents
              </div>
            </div>
          </div>

          {/* Short Side */}
          <div className="bg-slate-800/60 p-5 rounded-2xl border border-amber-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-amber-400 font-extrabold text-base">
                <span className="text-2xl">📋</span>
                <span>Short Side Flip</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                Notepad Style
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-amber-200 font-semibold">
              📌 Staple / Bind on SHORT SIDE (Top Edge)
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              Paper turns top-to-bottom along its horizontal width, like flipping a calendar, clipboard, or legal pad.
            </p>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-14 h-16 bg-white border border-slate-300 rounded text-[10px] font-bold text-slate-800 flex items-center justify-center shadow">
                  Front ▲
                </div>
                <div className="w-14 h-16 bg-white border border-slate-300 rounded text-[10px] font-bold text-amber-700 flex items-center justify-center shadow rotate-180">
                  Back ▼
                </div>
              </div>
              <div className="text-[11px] text-amber-300 font-semibold mt-2">
                ✓ Recommended for 2-Up Landscape Slides
              </div>
            </div>
          </div>

        </div>

        {/* Golden Rule Summary Box */}
        <div className="bg-indigo-950/70 border border-indigo-800/80 p-4 rounded-xl text-xs space-y-2 text-indigo-200">
          <div className="font-extrabold text-white text-sm">💡 Quick Rule of Thumb:</div>
          <ul className="space-y-1.5 list-disc list-inside opacity-95">
            <li><strong>Stapling on the Long Side (Left)?</strong> Select <strong>Long Side Flip</strong> (Book turn).</li>
            <li><strong>Stapling on the Short Side (Top)?</strong> Select <strong>Short Side Flip</strong> (Notepad turn).</li>
            <li><strong>Printing 2 pages per side (Landscape)?</strong> Select <strong>Short Side Flip</strong> to keep back pages right-side-up!</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs"
        >
          Got it! Return to Simulator
        </button>

      </div>
    </div>
  );
}
