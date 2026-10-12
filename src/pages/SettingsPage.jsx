import React from 'react';
import {
  Settings, HelpCircle, ArrowRight, BookOpen, Layers, CheckCircle2,
  Hash, Zap, SlidersHorizontal, Sparkles, Check, ArrowLeft
} from 'lucide-react';
import PreflightWarnings from '../components/PreflightWarnings';

export default function SettingsPage({
  config,
  setConfig,
  onOpenFlipHelp,
  preflight,
  onNext,
  uxMode = 'simple',
  setUxMode
}) {
  const updateConfig = (key, val) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  };

  const updatePageRange = (field, value) => {
    setConfig(prev => ({ ...prev, pageRange: { ...prev.pageRange, [field]: value } }));
  };

  // Simple Layout Presets
  const simplePresets = [
    {
      id: 2,
      title: '2-in-1 Eco Save',
      sub: 'Saves 50% Paper',
      badge: 'Most Popular',
      icon: '📑',
      desc: 'Puts 2 pages side-by-side on each sheet. Perfect for notes, lectures & reading.',
      config: { pagesPerSide: 2, duplex: true, flipEdge: 'long' }
    },
    {
      id: 1,
      title: '1-Page Standard',
      sub: 'Standard 1:1 Print',
      badge: 'Classic',
      icon: '📄',
      desc: '1 page per physical sheet side. Standard format for formal reports & essays.',
      config: { pagesPerSide: 1, duplex: true, flipEdge: 'long' }
    },
    {
      id: 'booklet',
      title: 'Folded Booklet',
      sub: 'Center-Stitched Book',
      badge: 'Pocket Book',
      icon: '📖',
      desc: 'Pages arranged so you can fold the sheet down the middle into a reading booklet.',
      config: { pagesPerSide: 'booklet', duplex: true, flipEdge: 'short', bindingType: 'saddle-stitch' }
    },
    {
      id: 4,
      title: '4-in-1 Handout',
      sub: 'Saves 75% Paper',
      badge: 'Eco Maximum',
      icon: '📋',
      desc: 'Puts 4 slides/pages on each sheet side. Best for dense slides & quick revision.',
      config: { pagesPerSide: 4, duplex: true, flipEdge: 'long' }
    }
  ];

  // Pro Layout Options
  const pagesOptions = [
    { id: 1, label: '1 Page / Side', sub: 'Standard 1:1', icon: '📄' },
    { id: 2, label: '2 Pages / Side', sub: '2-up Duplex', icon: '📑' },
    { id: 4, label: '4 Pages / Side', sub: '4-up Grid', icon: '🗂️' },
    { id: 6, label: '6 Pages / Side', sub: '6-up Compact', icon: '📊' },
    { id: 'booklet', label: 'Booklet Imposition', sub: 'Foldable Book', icon: '📖' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 py-4 sm:py-6 px-3 sm:px-4">
      
      {/* Header with Mode Toggle */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-[11px] uppercase font-extrabold tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Step 2 of 4 • Print Style
          </span>
          <button
            onClick={() => setUxMode && setUxMode(uxMode === 'simple' ? 'pro' : 'simple')}
            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center space-x-1"
          >
            {uxMode === 'simple' ? (
              <>
                <SlidersHorizontal className="w-3 h-3 text-indigo-400" />
                <span>Switch to Pro Options</span>
              </>
            ) : (
              <>
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Switch to Simple View</span>
              </>
            )}
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {uxMode === 'simple' ? 'Choose How You Want to Print' : 'Configure Layout & Imposition Settings'}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          {uxMode === 'simple'
            ? 'Pick a print style below. PrintSmart automatically optimizes margins and paper flip.'
            : 'Granular control over N-up grid placement, duplex tumbling, margins, binding overlays, and page ranges.'}
        </p>
      </div>

      {/* ──────────────────────────────────────────────────────────
          SIMPLE MODE VIEW (Zero Confusion, Friendly & Clean)
         ────────────────────────────────────────────────────────── */}
      {uxMode === 'simple' ? (
        <div className="space-y-6">
          
          {/* 1. Main Style Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {simplePresets.map(preset => {
              const isSelected = config.pagesPerSide === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => setConfig(prev => ({ ...prev, ...preset.config }))}
                  className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-600/15 ring-2 ring-indigo-500/50 scale-[1.01]'
                      : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl sm:text-4xl p-2 rounded-2xl bg-slate-800/80 border border-slate-700/60 inline-block">
                      {preset.icon}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {preset.badge}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                      <span>{preset.title}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </h3>
                    <p className="text-xs font-semibold text-indigo-400 mt-0.5">{preset.sub}</p>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {preset.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. Simple 2-Sided (Duplex) & Paper Flip Selection */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base">
                  Double-Sided Printing (Duplex)
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Print on front and back of sheets to cut paper use in half.
                </p>
              </div>
              <button
                onClick={() => updateConfig('duplex', !config.duplex)}
                className={`w-14 h-8 rounded-full transition-colors relative flex items-center px-1 ${
                  config.duplex ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <div className={`w-6 h-6 rounded-full bg-white transition-transform ${config.duplex ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {config.duplex && (
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  How will you flip or turn the pages?
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => updateConfig('flipEdge', 'long')}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
                      config.flipEdge === 'long'
                        ? 'bg-indigo-950/70 border-indigo-500 text-white ring-2 ring-indigo-500/30'
                        : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                    }`}
                  >
                    <span className="text-2xl flex-shrink-0">📖</span>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-white">Like a Normal Book (Long Edge)</div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Turns left-to-right. Best for portrait reading.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => updateConfig('flipEdge', 'short')}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
                      config.flipEdge === 'short'
                        ? 'bg-indigo-950/70 border-indigo-500 text-white ring-2 ring-indigo-500/30'
                        : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                    }`}
                  >
                    <span className="text-2xl flex-shrink-0">📋</span>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-white">Like a Notepad (Short Edge)</div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Turns top-to-bottom. Best for slides & landscape.</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Simple Helper Banner */}
          <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Standard A4 Paper with 8mm safety margins applied automatically.</span>
            </span>
            <button
              onClick={() => setUxMode && setUxMode('pro')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline ml-2"
            >
              Need Custom Margins?
            </button>
          </div>

        </div>
      ) : (
        /* ──────────────────────────────────────────────────────────
            PRO MODE VIEW (Full Control for Commercial / Power Users)
           ────────────────────────────────────────────────────────── */
        <div className="space-y-6">
          
          {/* Preflight Alerts Banner */}
          <PreflightWarnings preflight={preflight} />

          {/* 1. Pages Per Side Grid */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              1. Pages Per Side (Layout Presets)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {pagesOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => updateConfig('pagesPerSide', opt.id)}
                  className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all flex flex-col items-center justify-center ${
                    config.pagesPerSide === opt.id
                      ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-500/10 scale-[1.02]'
                      : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl">{opt.icon}</span>
                  <span className="text-xs sm:text-sm font-bold mt-2">{opt.label}</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Duplex & Flip Edge Pro */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base">2. Double-Sided Printing (Duplex)</h3>
                <p className="text-slate-400 text-xs mt-0.5">Print on front and back of physical sheets</p>
              </div>
              <button
                onClick={() => updateConfig('duplex', !config.duplex)}
                className={`w-14 h-7 rounded-full transition-colors relative flex items-center px-1 ${
                  config.duplex ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${config.duplex ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
            </div>

            {config.duplex && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Flip Axis (Duplex Tumble):
                  </span>
                  <button
                    onClick={onOpenFlipHelp}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 font-semibold"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Flip Guide</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => updateConfig('flipEdge', 'long')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      config.flipEdge === 'long'
                        ? 'bg-indigo-950/80 border-indigo-500 text-white ring-2 ring-indigo-500/40'
                        : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm">Long Side Flip (Book Style)</div>
                    <p className="text-[11px] text-slate-400 mt-1">Bind on long edge. Normal portrait documents.</p>
                  </button>

                  <button
                    onClick={() => updateConfig('flipEdge', 'short')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      config.flipEdge === 'short'
                        ? 'bg-indigo-950/80 border-indigo-500 text-white ring-2 ring-indigo-500/40'
                        : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm">Short Side Flip (Notepad Style)</div>
                    <p className="text-[11px] text-slate-400 mt-1">Bind on short edge. Landscape & presentation sheets.</p>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. Paper Size, Margins & Finishing */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              3. Paper Size, Margins & Finishing
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Paper Size</label>
                <select
                  value={config.paperSize}
                  onChange={e => updateConfig('paperSize', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="A4">A4 (210 × 297 mm)</option>
                  <option value="Letter">Letter (8.5 × 11 in)</option>
                  <option value="Legal">Legal (8.5 × 14 in)</option>
                  <option value="A3">A3 (297 × 420 mm)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Printer Margins</label>
                <select
                  value={config.margins}
                  onChange={e => updateConfig('margins', Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 focus:border-indigo-500 focus:outline-none"
                >
                  <option value={0}>None (0mm Edge-to-Edge)</option>
                  <option value={5}>Small (5mm Printer Safe)</option>
                  <option value={8}>Normal (8mm Recommended)</option>
                  <option value={12}>Large (12mm Gutter)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Staple / Binding Position</label>
                <select
                  value={config.bindingType || 'none'}
                  onChange={e => updateConfig('bindingType', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="none">No Binding (Loose Sheets)</option>
                  <option value="2-staples">2 Staples on Long Side (Left)</option>
                  <option value="top-staple">1 Staple on Top-Left Corner</option>
                  <option value="saddle-stitch">Saddle Stitch (Booklet Fold)</option>
                  <option value="spiral">Spiral Wire-O Binding (Long Side)</option>
                  <option value="comb">Plastic Comb Binding (Long Side)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. Page Range Selector */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center space-x-2">
              <Hash className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                4. Page Range (Optional)
              </h3>
            </div>

            <div className="flex items-center space-x-4 text-xs">
              {['all', 'range', 'custom'].map(type => (
                <label key={type} className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="pageRangeType"
                    checked={config.pageRange?.type === type}
                    onChange={() => updatePageRange('type', type)}
                    className="accent-indigo-500"
                  />
                  <span className="text-slate-300 capitalize font-medium">
                    {type === 'all' ? 'All Pages' : type === 'range' ? 'Page Range' : 'Custom'}
                  </span>
                </label>
              ))}
            </div>

            {config.pageRange?.type === 'range' && (
              <div className="flex items-center space-x-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">From Page</label>
                  <input
                    type="number"
                    min={1}
                    max={config.pageRange?.end || config.pageCount}
                    value={config.pageRange?.start || 1}
                    onChange={e => updatePageRange('start', Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">To Page</label>
                  <input
                    type="number"
                    min={config.pageRange?.start || 1}
                    max={config.pageCount || 100}
                    value={config.pageRange?.end || config.pageCount || 1}
                    onChange={e => updatePageRange('end', Math.max(config.pageRange?.start || 1, parseInt(e.target.value) || 1))}
                    className="w-24 bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {config.pageRange?.type === 'custom' && (
              <div className="text-xs space-y-1">
                <label className="block text-slate-400">Custom Page Selection</label>
                <input
                  type="text"
                  placeholder="e.g. 1-3, 5, 8-10"
                  value={config.pageRange?.customStr || ''}
                  onChange={e => updatePageRange('customStr', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 focus:border-indigo-500 focus:outline-none font-mono"
                />
              </div>
            )}
          </div>

        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setConfig(prev => ({ ...prev }))}
          className="text-xs text-slate-400 hover:text-slate-300 font-medium"
        >
          Reset to defaults
        </button>

        <button
          onClick={onNext}
          className="px-6 sm:px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/25 flex items-center space-x-2 text-xs sm:text-sm transition transform active:scale-95"
        >
          <span>Continue to 3D Preview</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
