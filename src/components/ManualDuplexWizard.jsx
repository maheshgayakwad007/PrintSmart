import React, { useState } from 'react';
import { X, Printer, RotateCw, CheckCircle2, FileText, ArrowRight, Download } from 'lucide-react';
import { PDFDocument, rgb } from 'pdf-lib';

export default function ManualDuplexWizard({ isOpen, onClose }) {
  const [activeStep, setActiveStep] = useState(1);
  const [feedDirection, setFeedDirection] = useState('face-down-top-first'); // 'face-down-top-first' | 'face-up-top-first'

  if (!isOpen) return null;

  const downloadCalibrationPage = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]);

      // Draw Test Pattern
      page.drawRectangle({
        x: 20,
        y: 20,
        width: 555.28,
        height: 801.89,
        borderColor: rgb(0.2, 0.4, 0.8),
        borderWidth: 3
      });

      page.drawText('PRINTSMART DUPLEX CALIBRATION TEST SHEET', {
        x: 50,
        y: 780,
        size: 18,
        color: rgb(0.1, 0.1, 0.3)
      });

      page.drawText('▲ THIS IS THE TOP OF THE PAGE ▲', {
        x: 120,
        y: 740,
        size: 20,
        color: rgb(0.8, 0.1, 0.1)
      });

      page.drawText('FRONT SIDE (Printed First)', {
        x: 150,
        y: 420,
        size: 28,
        color: rgb(0.1, 0.6, 0.2)
      });

      page.drawText('Instructions:\n1. Mark a small pencil dot on the top edge before feeding.\n2. Print this test sheet.\n3. Flip and reload into tray to see how your printer feeds paper!', {
        x: 50,
        y: 200,
        size: 14,
        color: rgb(0.3, 0.3, 0.3)
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'PrintSmart_Duplex_Calibration_Test_Sheet.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Manual Duplex Printer Feed Guide</h3>
            <p className="text-slate-400 text-xs">For printers without automatic double-sided printing units</p>
          </div>
        </div>

        {/* Steps Bar */}
        <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
          {[
            { step: 1, title: '1. Print Fronts' },
            { step: 2, title: '2. Reload Paper' },
            { step: 3, title: '3. Print Backs' }
          ].map(s => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`flex-1 py-2 rounded-lg font-bold transition text-center ${
                activeStep === s.step
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* STEP 1: PRINT FRONTS */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2 text-xs text-slate-300">
              <div className="font-bold text-white text-sm">Step 1: Print Front Sides (Odd Pages)</div>
              <p>
                Send the print job to your printer. Choose <strong className="text-indigo-400">Odd Pages Only</strong> in your printer print dialog, or print the generated Front Pages document.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-3">
              <div className="text-3xl">🖨️ ➔ 📄 📄 📄</div>
              <div className="text-xs text-slate-300">
                Printed Stack output resting on top tray of your printer.
              </div>
            </div>

            <button
              onClick={() => setActiveStep(2)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2"
            >
              <span>I have printed the Front side stack → Next Step</span>
            </button>
          </div>
        )}

        {/* STEP 2: RELOAD PAPER */}
        {activeStep === 2 && (
          <div className="space-y-4">
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2 text-xs text-slate-300">
              <div className="font-bold text-white text-sm">Step 2: Flip Stack & Reload into Paper Tray</div>
              <p>
                Take the printed stack directly from the output tray. Rotate it 180° so the top edge is facing down into the paper input feed.
              </p>
            </div>

            {/* Visual Printer Tray Feed Diagram */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center space-y-3">
              <div className="flex justify-center items-center space-x-6 text-sm">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 text-slate-200">
                  <div className="font-bold text-indigo-400">📖 Long Edge Turn</div>
                  <div className="text-[11px] text-slate-400 mt-1">Flip stack sideways like a book cover</div>
                </div>

                <RotateCw className="w-6 h-6 text-indigo-400 animate-pulse" />

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 text-slate-200">
                  <div className="font-bold text-amber-400">📋 Short Edge Turn</div>
                  <div className="text-[11px] text-slate-400 mt-1">Flip stack top-to-bottom like a notepad</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveStep(3)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2"
            >
              <span>Stack Reloaded in Tray → Next Step</span>
            </button>
          </div>
        )}

        {/* STEP 3: PRINT BACKS */}
        {activeStep === 3 && (
          <div className="space-y-4 text-center">
            <div className="bg-emerald-950/70 p-4 rounded-xl border border-emerald-800 text-xs text-emerald-200 space-y-2 text-left">
              <div className="font-bold text-white text-sm flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Step 3: Print Back Sides (Even Pages)</span>
              </div>
              <p>
                Now print the Even Pages / Back Side stack. Pages will print directly onto the back side of your reloaded sheets in clean alignment!
              </p>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg"
            >
              Done! Close Wizard
            </button>
          </div>
        )}

        {/* Footer Calibration Download */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Unsure how your printer feeds paper?</span>
          <button
            onClick={downloadCalibrationPage}
            className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download 1-Page Calibration Sheet</span>
          </button>
        </div>

      </div>
    </div>
  );
}
