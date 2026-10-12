import React, { useState } from 'react';
import PhysicalSimulator from '../components/PhysicalSimulator';
import BookletLifecycleViewer from '../components/BookletLifecycleViewer';
import { Eye, ArrowRight, ArrowLeft, BookOpen, Layers, Printer, Download } from 'lucide-react';

export default function PreviewPage({
  printPlan,
  pageThumbnails,
  activeSheetIndex,
  setActiveSheetIndex,
  flipEdge,
  duplex,
  bindingType,
  docInfo,
  pagesPerSide,
  onPrev,
  onNext
}) {
  const isBooklet = pagesPerSide === 'booklet';
  const [viewMode, setViewMode] = useState('sheet'); // 'sheet' | 'booklet'

  return (
    <div className="max-w-5xl mx-auto space-y-5 sm:space-y-6 py-4 sm:py-6 px-3 sm:px-4">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-[11px] uppercase font-extrabold tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          Step 3 of 4 • Visual 3D Preview
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Visual Paper & Flip Simulator
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          Flip the paper in 3D to verify that back pages print right-side up before you waste any ink or paper.
        </p>

        {/* Booklet View Switcher (if booklet is selected) */}
        {isBooklet && (
          <div className="inline-flex p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs mt-2">
            <button
              onClick={() => setViewMode('sheet')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition ${
                viewMode === 'sheet'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Sheet Flip Preview</span>
            </button>
            <button
              onClick={() => setViewMode('booklet')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition ${
                viewMode === 'booklet'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Booklet Fold & Staple Guide</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Viewport */}
      {isBooklet && viewMode === 'booklet' ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl">
          <BookletLifecycleViewer
            printPlan={printPlan}
            pageThumbnails={pageThumbnails}
          />
        </div>
      ) : (
        <PhysicalSimulator
          printPlan={printPlan}
          pageThumbnails={pageThumbnails}
          activeSheetIndex={activeSheetIndex}
          setActiveSheetIndex={setActiveSheetIndex}
          flipEdge={flipEdge}
          duplex={duplex}
          bindingType={bindingType}
          docInfo={docInfo}
        />
      )}

      {/* Bottom Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          onClick={onPrev}
          className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Print Style</span>
        </button>

        <button
          onClick={onNext}
          className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-extrabold rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 text-xs sm:text-sm transition transform active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Proceed to Print & Download →</span>
        </button>
      </div>

    </div>
  );
}
