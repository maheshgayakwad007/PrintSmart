import React from 'react';
import { AlertTriangle, Info, CheckCircle2, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export default function PreflightWarnings({ preflight, onApplyRecommendation }) {
  if (!preflight || !preflight.warnings || preflight.warnings.length === 0) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2.5">
        <ShieldCheck className="w-5 h-5 text-indigo-400" />
        <h3 className="font-bold text-white text-sm">Print Preflight Inspector & Smart Warnings</h3>
      </div>

      <div className="space-y-2.5">
        {preflight.warnings.map(item => {
          let bgColor = 'bg-slate-800/80 border-slate-700/80 text-slate-300';
          let icon = <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />;

          if (item.severity === 'danger') {
            bgColor = 'bg-rose-950/70 border-rose-800/80 text-rose-200';
            icon = <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />;
          } else if (item.severity === 'warning') {
            bgColor = 'bg-amber-950/70 border-amber-800/80 text-amber-200';
            icon = <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />;
          } else if (item.severity === 'tip') {
            bgColor = 'bg-emerald-950/60 border-emerald-800/70 text-emerald-200';
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
          }

          return (
            <div key={item.id} className={`p-3 rounded-xl border ${bgColor} text-xs flex items-start space-x-3 transition`}>
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>{item.title}</span>
                </div>
                <p className="mt-0.5 leading-relaxed opacity-90">{item.message}</p>
                {item.recommendation && (
                  <div className="mt-1.5 pt-1.5 border-t border-white/10 text-[11px] font-medium flex items-center justify-between">
                    <span className="opacity-80">💡 Recommendation: {item.recommendation}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
