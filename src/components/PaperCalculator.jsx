import React, { useState } from 'react';
import { Leaf, DollarSign, Calculator, ChevronDown, ChevronUp, Layers, Droplet } from 'lucide-react';
import { calculatePrintCost, DEFAULT_PRICING } from '../utils/costCalculator';

export default function PaperCalculator({ summary, appMode, bindingType }) {
  const [colorMode, setColorMode] = useState('bw');
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [showShopSettings, setShowShopSettings] = useState(false);

  if (!summary) return null;

  const costData = calculatePrintCost(summary, pricing, colorMode, bindingType);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white text-base">Paper & Cost Analytics</h3>
        </div>
        <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-bold">
          <Leaf className="w-3.5 h-3.5" />
          <span>Saved {summary.percentageSaved}% Paper</span>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Card 1: Input Pages */}
        <div className="bg-slate-800/60 border border-slate-700/70 p-3 rounded-xl">
          <div className="text-[11px] font-semibold text-slate-400">PDF Pages</div>
          <div className="text-xl font-extrabold text-white mt-0.5">{summary.totalInputPages}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Original count</div>
        </div>

        {/* Card 2: Output Sheets */}
        <div className="bg-indigo-950/60 border border-indigo-800/80 p-3 rounded-xl">
          <div className="text-[11px] font-semibold text-indigo-300">Physical Sheets</div>
          <div className="text-xl font-extrabold text-white mt-0.5">{summary.totalSheets}</div>
          <div className="text-[10px] text-indigo-400 mt-0.5">A4 Paper Required</div>
        </div>

        {/* Card 3: Sheets Saved */}
        <div className="bg-emerald-950/60 border border-emerald-800/80 p-3 rounded-xl">
          <div className="text-[11px] font-semibold text-emerald-300">Sheets Saved</div>
          <div className="text-xl font-extrabold text-emerald-400 mt-0.5">+{summary.sheetsSaved}</div>
          <div className="text-[10px] text-emerald-500 mt-0.5">{summary.percentageSaved}% Reduction</div>
        </div>

        {/* Card 4: Estimated Bill */}
        <div className="bg-slate-800/60 border border-slate-700/70 p-3 rounded-xl">
          <div className="text-[11px] font-semibold text-slate-400">Estimated Cost</div>
          <div className="text-xl font-extrabold text-amber-400 mt-0.5">
            {costData.currency}{costData.totalCost}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Saved {costData.currency}{costData.moneySaved}
          </div>
        </div>

      </div>

      {/* Environmental Impact Bar */}
      <div className="bg-emerald-950/40 border border-emerald-800/40 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-200">
        <div className="flex items-center space-x-2">
          <Leaf className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Eco Impact: Saved ~{costData.environmental.treesSaved} Trees & ~{costData.environmental.waterSavedLiters}L Water</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 font-bold hidden sm:inline">🌱 Go Green</span>
      </div>

      {/* Print Shop Rate Configuration (Expandable) */}
      {appMode === 'shop' && (
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={() => setShowShopSettings(!showShopSettings)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white py-1"
          >
            <span>Customize Print Shop Rate Card</span>
            {showShopSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showShopSettings && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div>
                <label className="text-[10px] text-slate-400 block">Paper/Sheet ({costData.currency})</label>
                <input
                  type="number"
                  step="0.1"
                  value={pricing.paperCostPerSheet}
                  onChange={e => setPricing({ ...pricing, paperCostPerSheet: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded p-1.5 mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block">B&W Print/Side ({costData.currency})</label>
                <input
                  type="number"
                  step="0.1"
                  value={pricing.bwPrintPerSheet}
                  onChange={e => setPricing({ ...pricing, bwPrintPerSheet: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded p-1.5 mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block">Color Print/Side ({costData.currency})</label>
                <input
                  type="number"
                  step="0.1"
                  value={pricing.colorPrintPerSheet}
                  onChange={e => setPricing({ ...pricing, colorPrintPerSheet: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded p-1.5 mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block">Spiral Fee ({costData.currency})</label>
                <input
                  type="number"
                  step="1"
                  value={pricing.spiralBindingFee}
                  onChange={e => setPricing({ ...pricing, spiralBindingFee: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded p-1.5 mt-1"
                />
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
