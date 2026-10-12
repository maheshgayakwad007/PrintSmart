import React from 'react';
import { LayoutGrid, BookOpen, Layers, Settings, FileSpreadsheet, Scissors, Check, HelpCircle, Download, Printer } from 'lucide-react';

export default function ControlPanel({
  config,
  setConfig,
  onOpenFlipHelp,
  onGeneratePdf,
  onOpenManualDuplex,
  isGenerating
}) {
  const updateConfig = (key, val) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  };

  const pagesPerSideOptions = [
    { id: 1, label: '1 Page', sub: 'Single', icon: '📄' },
    { id: 2, label: '2 Pages', sub: '2-up', icon: '📑' },
    { id: 4, label: '4 Pages', sub: '4-up', icon: '🗂️' },
    { id: 6, label: '6 Pages', sub: '6-up', icon: '📊' },
    { id: 9, label: '9 Pages', sub: '9-up', icon: '▦' },
    { id: 'booklet', label: 'Booklet', sub: 'Foldable', icon: '📖' }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          <h2 className="font-bold text-white text-base">Print Settings</h2>
        </div>
        <span className="text-[11px] font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
          Live Sync
        </span>
      </div>

      {/* 1. Pages Per Side (Layout Presets) */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
          Pages Per Side (Layout)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {pagesPerSideOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => updateConfig('pagesPerSide', opt.id)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col items-center justify-center ${
                config.pagesPerSide === opt.id
                  ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                  : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-slate-300'
              }`}
            >
              <span className="text-lg">{opt.icon}</span>
              <span className="text-xs font-semibold mt-1">{opt.label}</span>
              <span className="text-[10px] text-slate-400">{opt.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Double-Sided (Duplex) & Flip Edge */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-semibold text-white block">Double-Sided Printing (Duplex)</label>
            <span className="text-[11px] text-slate-400">Print on front & back of physical sheet</span>
          </div>
          <button
            onClick={() => updateConfig('duplex', !config.duplex)}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
              config.duplex ? 'bg-indigo-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                config.duplex ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Flip Edge Selector (Crucial Feature!) */}
        {config.duplex && (
          <div className="space-y-2 pt-2 border-t border-slate-700/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Flip Edge Direction
              </label>
              <button
                onClick={onOpenFlipHelp}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Which to choose?</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateConfig('flipEdge', 'long')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  config.flipEdge === 'long'
                    ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📖</span>
                  <div>
                    <div className="text-xs font-bold">Long Edge</div>
                    <div className="text-[10px] text-slate-400">Turn like a book ↻</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => updateConfig('flipEdge', 'short')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  config.flipEdge === 'short'
                    ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📋</span>
                  <div>
                    <div className="text-xs font-bold">Short Edge</div>
                    <div className="text-[10px] text-slate-400">Turn like a notepad ↕</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Paper Size & Margins */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Output Paper Size
          </label>
          <select
            value={config.paperSize}
            onChange={e => updateConfig('paperSize', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:border-indigo-500 focus:outline-none"
          >
            <option value="A4">A4 (210 × 297 mm)</option>
            <option value="Letter">Letter (8.5 × 11 in)</option>
            <option value="Legal">Legal (8.5 × 14 in)</option>
            <option value="A3">A3 (297 × 420 mm)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Printer Margins
          </label>
          <select
            value={config.margins}
            onChange={e => updateConfig('margins', Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:border-indigo-500 focus:outline-none"
          >
            <option value={0}>None (0mm Edge-to-Edge)</option>
            <option value={5}>Small (5mm Safe)</option>
            <option value={8}>Normal (8mm Recommended)</option>
            <option value={12}>Large (12mm Gutter)</option>
          </select>
        </div>
      </div>

      {/* 4. Binding & Staple Visualization Options */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
          Binding / Finishing Preview
        </label>
        <select
          value={config.bindingType || 'none'}
          onChange={e => updateConfig('bindingType', e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:border-indigo-500 focus:outline-none"
        >
          <option value="none">No Binding (Loose Sheets)</option>
          <option value="2-staples">2 Staples (Left Edge)</option>
          <option value="top-staple">1 Staple (Top-Left)</option>
          <option value="saddle-stitch">Saddle Stitch (Center Crease Booklet)</option>
          <option value="spiral">Spiral Wire-O Binding (Left)</option>
          <option value="comb">Plastic Comb Binding (Left)</option>
        </select>
      </div>

      {/* 5. Page Range Selector */}
      <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 space-y-2">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Page Range
        </label>
        <div className="flex items-center space-x-3 text-xs text-slate-300">
          <label className="flex items-center space-x-1.5 cursor-pointer">
            <input
              type="radio"
              name="pageRangeType"
              checked={config.pageRange?.type === 'all'}
              onChange={() => updateConfig('pageRange', { ...config.pageRange, type: 'all' })}
              className="accent-indigo-500"
            />
            <span>All Pages</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer">
            <input
              type="radio"
              name="pageRangeType"
              checked={config.pageRange?.type === 'custom'}
              onChange={() => updateConfig('pageRange', { ...config.pageRange, type: 'custom' })}
              className="accent-indigo-500"
            />
            <span>Custom Range</span>
          </label>
        </div>

        {config.pageRange?.type === 'custom' && (
          <input
            type="text"
            placeholder="e.g. 1-5, 8, 11-20"
            value={config.pageRange?.customStr || ''}
            onChange={e => updateConfig('pageRange', { ...config.pageRange, customStr: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2 mt-1 focus:border-indigo-500 focus:outline-none"
          />
        )}
      </div>

      {/* Primary Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={onGeneratePdf}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98] disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isGenerating ? 'Imposing & Generating PDF...' : 'Download Print-Ready PDF'}</span>
        </button>

        <button
          onClick={onOpenManualDuplex}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 px-4 rounded-xl border border-slate-700 flex items-center justify-center space-x-2 text-xs transition"
        >
          <Printer className="w-3.5 h-3.5 text-indigo-400" />
          <span>Manual Duplex Printer Feed Wizard</span>
        </button>
      </div>

    </div>
  );
}
