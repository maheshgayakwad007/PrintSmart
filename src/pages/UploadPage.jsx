import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2, FileText } from 'lucide-react';
import PDFUploader from '../components/PDFUploader';

export default function UploadPage({
  onFileUpload,
  onSelectSample,
  activeSampleId,
  pdfLoaded,
  docInfo,
  onNext
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 py-4 sm:py-6 px-3 sm:px-4">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-[11px] uppercase font-extrabold tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          Step 1 of 4 • Choose Document
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Select or Upload Your Document
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Drop your PDF below to calculate perfect duplex alignment, or test instantly with a pre-loaded sample.
        </p>
      </div>

      {/* Main Dedicated PDF Uploader & Sample Picker */}
      <PDFUploader
        onFileUpload={onFileUpload}
        onSelectSample={onSelectSample}
        activeSampleId={activeSampleId}
        pdfLoaded={pdfLoaded}
        docInfo={docInfo}
      />

      {/* Next Step Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onNext}
          className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold rounded-2xl shadow-xl shadow-indigo-600/25 flex items-center justify-center space-x-2.5 text-sm transition transform active:scale-95"
        >
          <span>Continue to Print Style</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
