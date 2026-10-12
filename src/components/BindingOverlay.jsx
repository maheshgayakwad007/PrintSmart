import React from 'react';

export default function BindingOverlay({ bindingType, isLandscape }) {
  if (!bindingType || bindingType === 'none') return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      
      {/* 2 Left Staples */}
      {bindingType === '2-staples' && (
        <div className="absolute left-2 inset-y-0 flex flex-col justify-around py-12">
          <div className="w-1.5 h-6 bg-slate-700 border border-slate-900 rounded-sm shadow-md transform -rotate-12" title="Staple 1" />
          <div className="w-1.5 h-6 bg-slate-700 border border-slate-900 rounded-sm shadow-md transform -rotate-12" title="Staple 2" />
        </div>
      )}

      {/* Single Top-Left Staple */}
      {bindingType === 'top-staple' && (
        <div className="absolute top-2 left-3">
          <div className="w-1.5 h-7 bg-slate-700 border border-slate-900 rounded-sm shadow-md transform rotate-45" title="Top-Left Staple" />
        </div>
      )}

      {/* Saddle Stitch (Booklet Crease in Center) */}
      {bindingType === 'saddle-stitch' && (
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex flex-col justify-between py-6 items-center">
          <div className="w-0.5 h-full bg-slate-400/60 border-l border-dashed border-slate-500" />
          {/* Saddle Staples */}
          <div className="absolute top-1/4 w-1.5 h-6 bg-slate-800 border border-slate-900 rounded-sm shadow" title="Center Saddle Staple 1" />
          <div className="absolute bottom-1/4 w-1.5 h-6 bg-slate-800 border border-slate-900 rounded-sm shadow" title="Center Saddle Staple 2" />
        </div>
      )}

      {/* Spiral Wire-O Binding Coils */}
      {bindingType === 'spiral' && (
        <div className="absolute left-0 inset-y-0 flex flex-col justify-between py-3 px-1">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-0.5">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-700 bg-slate-300 shadow-sm" />
              <div className="w-2 h-1 bg-slate-800 rounded-r" />
            </div>
          ))}
        </div>
      )}

      {/* Plastic Comb Binding */}
      {bindingType === 'comb' && (
        <div className="absolute left-0 inset-y-0 flex flex-col justify-between py-4 px-1 bg-slate-800/20 border-r border-slate-400/40">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-3 h-3 bg-slate-800 rounded border border-slate-900 shadow-inner" />
          ))}
        </div>
      )}

    </div>
  );
}
