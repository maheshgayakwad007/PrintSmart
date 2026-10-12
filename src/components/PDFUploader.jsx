import React, { useRef, useState } from 'react';
import { Upload, FileText, Sparkles, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';
import { SAMPLE_DOCUMENTS } from '../utils/samplePdfGenerator';

export default function PDFUploader({
  onFileUpload,
  onSelectSample,
  activeSampleId,
  pdfLoaded,
  docInfo
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setLoading(true);
        await onFileUpload(file);
        setLoading(false);
      } else {
        alert('Please upload a valid PDF file.');
      }
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLoading(true);
      await onFileUpload(file);
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-md space-y-6">
      
      {/* Current Active Document Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="bg-indigo-500/20 border border-indigo-500/30 p-3 rounded-2xl text-indigo-400 flex-shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-white text-sm sm:text-base truncate max-w-[240px] sm:max-w-[340px]">
                {docInfo.name}
              </h3>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 flex-shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                <span>Ready</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
              <span>📄 {docInfo.pageCount} Pages</span>
              <span>•</span>
              <span className="capitalize">📐 {docInfo.pageSize} ({docInfo.orientation})</span>
              <span>•</span>
              <span className="text-emerald-400">100% Private</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20 flex-shrink-0"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload PDF File</span>
        </button>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-indigo-400 bg-indigo-500/15 scale-[0.99]'
            : 'border-slate-700/80 hover:border-indigo-500/60 bg-slate-800/30 hover:bg-slate-800/50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/pdf"
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            {loading ? (
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>
          <div>
            <h4 className="text-white font-bold text-sm sm:text-base">
              {loading ? 'Analyzing PDF Layout...' : 'Drop your PDF here or click to browse'}
            </h4>
            <p className="text-slate-400 text-xs mt-0.5">
              Works with lecture notes, booklets, assignments, slides & multi-page reports.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Instant Sample Documents */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Or Test With Instant Sample Documents:
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">1-click demo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_DOCUMENTS.map((sample) => {
            const isSelected = activeSampleId === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => onSelectSample(sample)}
                className={`text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-900 border-indigo-500 shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500/40'
                    : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300">
                      {sample.pageCount} Pages
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-700/60">
                      {sample.orientation}
                    </span>
                  </div>
                  <h5 className="font-bold text-white text-xs mt-1.5 line-clamp-1">
                    {sample.name}
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {sample.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-indigo-400 font-semibold">
                  <span>{isSelected ? '✓ Active Sample' : 'Load Sample'}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
