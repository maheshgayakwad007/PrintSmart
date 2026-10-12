import React, { useState } from 'react';
import { BookOpen, Layers, Scissors, CheckCircle, ChevronLeft, ChevronRight, RotateCcw, ArrowRight } from 'lucide-react';

export default function BookletLifecycleViewer({ printPlan, pageThumbnails }) {
  const [activeStep, setActiveStep] = useState(1); // 1: Print, 2: Stack, 3: Fold, 4: Finished Booklet Reader
  const [readerPage, setReaderPage] = useState(1);

  if (!printPlan || printPlan.summary.pagesPerSide !== 'booklet') return null;

  const totalInputPages = printPlan.summary.totalInputPages;
  const totalBookletSheets = printPlan.sheets.length;

  const nextReaderPage = () => {
    setReaderPage(prev => Math.min(totalInputPages, prev + 2));
  };

  const prevReaderPage = () => {
    setReaderPage(prev => Math.max(1, prev - 2));
  };

  return (
    <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/40 rounded-2xl p-5 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-indigo-900/60 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="bg-indigo-600 p-2 rounded-xl text-white">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base flex items-center space-x-2">
              <span>Booklet Imposition & Folding Simulator</span>
              <span className="bg-teal-500/20 text-teal-300 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-teal-500/30">
                Saddle-Stitch
              </span>
            </h3>
            <p className="text-slate-300 text-xs mt-0.5">
              4-Step Physical Guide: From flat imposed sheets to a folded, stapled mini-booklet
            </p>
          </div>
        </div>

        {/* Step Tabs Bar */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {[
            { id: 1, label: '1. Print Flat' },
            { id: 2, label: '2. Stack' },
            { id: 3, label: '3. Fold & Staple' },
            { id: 4, label: '4. Read Booklet' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setActiveStep(s.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeStep === s.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: PRINT FLAT */}
      {activeStep === 1 && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl text-xs text-slate-300 flex items-start space-x-3">
            <span className="text-xl">🖨️</span>
            <div>
              <div className="font-bold text-white text-sm">Step 1: Imposed Flat Sheet Layout</div>
              <p className="text-slate-400 mt-0.5">
                Notice how the PDF pages are re-ordered on each sheet! For example, Sheet 1 Front puts Page {totalBookletSheets * 4} on the left and Page 1 on the right, so when folded, Page 1 becomes the front cover and Page {totalBookletSheets * 4} becomes the back cover!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {printPlan.sheets.map(sheet => (
              <div key={sheet.sheetNumber} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-indigo-300">
                  <span>Physical Sheet #{sheet.sheetNumber}</span>
                  <span className="text-slate-400 font-mono">
                    Front: {sheet.front.cells[0]?.pageNumber || 'Blank'} | {sheet.front.cells[1]?.pageNumber || 'Blank'}
                  </span>
                </div>
                
                {/* Visual Flat Sheet Preview */}
                <div className="bg-white text-slate-900 rounded-lg p-2 aspect-[1.8/1] flex border border-slate-300 relative shadow">
                  <div className="absolute inset-y-0 left-1/2 border-r border-dashed border-slate-400" />
                  
                  {/* Left Cell */}
                  <div className="w-1/2 p-1 flex flex-col justify-between items-center text-center">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1 rounded">
                      P{sheet.front.cells[0]?.pageNumber || 'BLANK'}
                    </span>
                    <div className="w-full flex-1 flex items-center justify-center my-1 overflow-hidden">
                      {pageThumbnails[sheet.front.cells[0]?.pageNumber] ? (
                        <img src={pageThumbnails[sheet.front.cells[0]?.pageNumber]} alt="" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <div className="text-[10px] text-slate-400">Page {sheet.front.cells[0]?.pageNumber}</div>
                      )}
                    </div>
                  </div>

                  {/* Right Cell */}
                  <div className="w-1/2 p-1 flex flex-col justify-between items-center text-center">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1 rounded">
                      P{sheet.front.cells[1]?.pageNumber || 'BLANK'}
                    </span>
                    <div className="w-full flex-1 flex items-center justify-center my-1 overflow-hidden">
                      {pageThumbnails[sheet.front.cells[1]?.pageNumber] ? (
                        <img src={pageThumbnails[sheet.front.cells[1]?.pageNumber]} alt="" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <div className="text-[10px] text-slate-400">Page {sheet.front.cells[1]?.pageNumber}</div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStep(2)}
                  className="w-full text-center text-[11px] text-indigo-400 hover:text-indigo-300 font-medium py-1"
                >
                  Proceed to Step 2: Stack Sheets →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: STACK SHEETS */}
      {activeStep === 2 && (
        <div className="space-y-4 text-center py-6">
          <div className="max-w-md mx-auto space-y-3">
            <span className="text-4xl">📚</span>
            <h4 className="font-bold text-white text-lg">Step 2: Stack Printed Sheets in Order</h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              After double-sided printing, lay Sheet 1 on the table face-up, then place Sheet 2 directly on top of it, followed by Sheet 3.
            </p>
          </div>

          <div className="py-8 flex justify-center">
            <div className="relative w-64 h-36">
              {printPlan.sheets.map((s, idx) => (
                <div
                  key={s.sheetNumber}
                  className="absolute inset-0 bg-white border-2 border-slate-300 rounded-lg shadow-xl p-3 flex justify-between items-center transition-transform"
                  style={{
                    transform: `translateY(${-idx * 12}px) translateX(${idx * 4}px)`,
                    zIndex: printPlan.sheets.length - idx
                  }}
                >
                  <span className="text-xs font-bold text-slate-800">Sheet #{s.sheetNumber}</span>
                  <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    Front: P{s.front.cells[0]?.pageNumber} | P{s.front.cells[1]?.pageNumber}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveStep(3)}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg"
          >
            Proceed to Step 3: Fold & Staple →
          </button>
        </div>
      )}

      {/* STEP 3: FOLD & STAPLE */}
      {activeStep === 3 && (
        <div className="space-y-6 text-center py-6">
          <div className="max-w-md mx-auto space-y-3">
            <span className="text-4xl">📍</span>
            <h4 className="font-bold text-white text-lg">Step 3: Fold in Half & Staple Spine</h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              Fold the stacked sheets directly along the center line. Place 2 staples along the folded spine (Saddle Stitch).
            </p>
          </div>

          <div className="flex justify-center items-center space-x-6 py-6">
            <div className="w-48 h-64 bg-white rounded-r-lg border-2 border-slate-300 shadow-2xl relative p-4 flex flex-col justify-between text-slate-900 text-left">
              {/* Spine Staples */}
              <div className="absolute left-0 inset-y-0 flex flex-col justify-around py-8">
                <div className="w-1.5 h-6 bg-slate-800 rounded-r shadow-md" />
                <div className="w-1.5 h-6 bg-slate-800 rounded-r shadow-md" />
              </div>
              <div className="pl-4">
                <div className="text-xs font-bold text-indigo-600 uppercase">Cover</div>
                <div className="text-sm font-extrabold text-slate-800 mt-1">Page 1</div>
              </div>
              <div className="pl-4 text-[10px] text-slate-400 font-mono">
                Folded Booklet Spine
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveStep(4)}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center space-x-2 mx-auto"
          >
            <BookOpen className="w-4 h-4" />
            <span>Open Finished Interactive Booklet Reader →</span>
          </button>
        </div>
      )}

      {/* STEP 4: INTERACTIVE FINISHED BOOKLET READER */}
      {activeStep === 4 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-indigo-950/70 border border-indigo-800/80 p-3 rounded-xl">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-white text-sm">
                Finished Booklet Reader (Reading Order: Pages 1 to {totalInputPages})
              </span>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center space-x-2">
              <button
                disabled={readerPage <= 1}
                onClick={prevReaderPage}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-xs font-bold text-white transition flex items-center space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev Spread</span>
              </button>
              <span className="text-xs font-mono font-bold text-indigo-300">
                Page {readerPage} & {readerPage + 1 <= totalInputPages ? readerPage + 1 : 'End'}
              </span>
              <button
                disabled={readerPage >= totalInputPages}
                onClick={nextReaderPage}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 rounded-lg text-xs font-bold text-white transition flex items-center space-x-1"
              >
                <span>Next Spread</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Opened Book Spread Simulator */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex justify-center">
            <div className="w-full max-w-2xl aspect-[1.8/1] bg-white rounded-lg shadow-2xl border-2 border-slate-300 flex relative overflow-hidden">
              
              {/* Center Crease */}
              <div className="absolute inset-y-0 left-1/2 border-r border-slate-300 z-10" />
              
              {/* Left Page Spread */}
              <div className="w-1/2 p-4 flex flex-col justify-between border-r border-slate-200 bg-slate-50">
                <div className="text-[10px] font-bold text-slate-400 flex justify-between">
                  <span>LEFT PAGE</span>
                  <span className="text-indigo-600 font-bold">PAGE {readerPage}</span>
                </div>

                <div className="flex-1 flex items-center justify-center my-2 overflow-hidden">
                  {pageThumbnails[readerPage] ? (
                    <img src={pageThumbnails[readerPage]} alt="" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="text-center p-4 text-slate-400 font-bold text-xs">
                      Page {readerPage}
                    </div>
                  )}
                </div>

                <div className="text-[9px] text-slate-400 text-center font-mono">
                  Read In Sequence
                </div>
              </div>

              {/* Right Page Spread */}
              <div className="w-1/2 p-4 flex flex-col justify-between bg-white">
                <div className="text-[10px] font-bold text-slate-400 flex justify-between">
                  <span>RIGHT PAGE</span>
                  <span className="text-indigo-600 font-bold">
                    {readerPage + 1 <= totalInputPages ? `PAGE ${readerPage + 1}` : 'BLANK COVER'}
                  </span>
                </div>

                <div className="flex-1 flex items-center justify-center my-2 overflow-hidden">
                  {pageThumbnails[readerPage + 1] ? (
                    <img src={pageThumbnails[readerPage + 1]} alt="" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="text-center p-4 text-slate-400 font-bold text-xs">
                      {readerPage + 1 <= totalInputPages ? `Page ${readerPage + 1}` : 'End of Booklet'}
                    </div>
                  )}
                </div>

                <div className="text-[9px] text-slate-400 text-center font-mono">
                  Turn to next spread →
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
