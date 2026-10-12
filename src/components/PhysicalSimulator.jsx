import React, { useState, useEffect, useRef } from 'react';
import BindingOverlay from './BindingOverlay';
import {
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Play, Pause, BookOpen, Layers, AlertTriangle, CheckCircle2, Info
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════
//  LAYOUT DETECTION
//  Derives the physical sheet's orientation and how it flips.
//
//  Physical sheet is LANDSCAPE when:
//    - pagesPerSide === 2  (2 portrait pages side-by-side)
//
//  Flip behaviour (from imposition.js):
//    Portrait + Long Edge  → book flip  (left↔right, back upright)
//    Portrait + Short Edge → notepad    (top↔bottom, back 180°)
//    Landscape + Long Edge → wall-cal   (top↔bottom, back 180°)
//    Landscape + Short Edge→ book flip  (left↔right, back upright)
// ══════════════════════════════════════════════════════════════
function detectLayout(printPlan, flipEdge) {
  const firstSheet = printPlan?.sheets?.[0];
  const grid  = firstSheet?.front?.grid || { rows: 1, cols: 1 };
  const pagesPerSide = grid.rows * grid.cols;
  const isSheetLandscape = grid.cols > grid.rows;    // 2-up → true

  // 'book'    = horizontal peel (rotateY), left↔right
  // 'notepad' = vertical peel   (rotateX), top↔bottom
  let flipStyle, backRotation;
  if (!isSheetLandscape) {
    flipStyle    = flipEdge === 'long' ? 'book'    : 'notepad';
    backRotation = flipEdge === 'long' ? 0         : 180;
  } else {
    flipStyle    = flipEdge === 'short' ? 'book'   : 'notepad';
    backRotation = flipEdge === 'short' ? 0        : 180;
  }

  return { grid, pagesPerSide, isSheetLandscape, flipStyle, backRotation };
}

// ══════════════════════════════════════════════════════════════
//  BUILD SPREADS
//
//  A "spread" = what you see when a book/notepad is flat open.
//  For a BOOK (left↔right flip):
//    Spread 0: left=null,          right=sheets[0].front
//    Spread k: left=sheets[k-1].back, right=sheets[k].front
//    Spread N: left=sheets[N-1].back, right=null
//
//  For a NOTEPAD (top↔bottom flip):
//    Same structure but "left"="top" and "right"="bottom"
//    Spread 0: top=null,           bottom=sheets[0].front
//    Spread k: top=sheets[k-1].back, bottom=sheets[k].front
//    Spread N: top=sheets[N-1].back, bottom=null
// ══════════════════════════════════════════════════════════════
function buildSpreads(printPlan, duplex) {
  const sheets = printPlan?.sheets || [];
  if (sheets.length === 0) return [];
  const spreads = [];

  // Cover spread — right/bottom side only
  spreads.push({
    left: null,
    right: sheets[0].front,
    rightSheetNum: sheets[0].sheetNumber,
  });

  // Middle spreads
  for (let k = 1; k < sheets.length; k++) {
    spreads.push({
      left:  duplex && sheets[k - 1].back ? sheets[k - 1].back : null,
      right: sheets[k].front,
      leftSheetNum:  sheets[k - 1].sheetNumber,
      rightSheetNum: sheets[k].sheetNumber,
    });
  }

  // Back-cover spread — left/top side only
  spreads.push({
    left:  duplex && sheets[sheets.length - 1].back ? sheets[sheets.length - 1].back : null,
    right: null,
    leftSheetNum: sheets[sheets.length - 1].sheetNumber,
  });

  return spreads;
}

// ══════════════════════════════════════════════════════════════
//  PAGE CELL — renders one PDF page slot
// ══════════════════════════════════════════════════════════════
function PageCell({ cell, pageThumbnails, pageW, pageH }) {
  if (!cell || cell.isBlank) {
    return (
      <div
        className="bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center rounded-sm"
        style={{ width: pageW, height: pageH }}
      >
        <span className="text-slate-400 text-[10px] font-semibold">Blank</span>
      </div>
    );
  }

  const thumb = pageThumbnails[cell.pageNumber];
  const isInverted = cell.rotation === 180;

  return (
    <div
      className="relative bg-white flex flex-col overflow-hidden border border-slate-200 rounded-sm shadow-sm"
      style={{ width: pageW, height: pageH }}
    >
      {/* Page badge */}
      <div className={`absolute top-0.5 left-0.5 z-10 flex items-center space-x-1 text-[8px] font-extrabold px-1.5 py-0.5 rounded ${
        isInverted
          ? 'bg-amber-100 text-amber-800 border border-amber-300'
          : 'bg-indigo-600 text-white'
      }`}>
        <span>P{cell.pageNumber}</span>
        {isInverted && <span title="Printed inverted for correct back-side reading">↻180°</span>}
      </div>

      <div className={`flex-1 flex items-center justify-center ${isInverted ? 'rotate-180' : ''}`}>
        {thumb ? (
          <img
            src={thumb}
            alt={`Page ${cell.pageNumber}`}
            className="max-w-full max-h-full object-contain"
            style={{ padding: '2px' }}
          />
        ) : (
          <span className="text-5xl font-black text-slate-200 select-none">{cell.pageNumber}</span>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  ONE SHEET FACE — renders all cells in the grid layout
//  For 1-up: single cell fills the full panel
//  For 2-up: two side-by-side cells, each at FULL portrait size
//  For 4-up: 2×2 grid
// ══════════════════════════════════════════════════════════════
function SheetFace({ side, pageThumbnails, panelW, panelH, isNotepad, bindingType }) {
  if (!side) {
    return (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center rounded-sm">
        <span className="text-slate-300 text-xs italic">—</span>
      </div>
    );
  }

  const { cells = [], grid = { rows: 1, cols: 1 } } = side;
  const { rows, cols } = grid;

  // For 2-up landscape sheets, we lay out 2 portrait-ratio cells side by side.
  // Each cell should maintain its portrait aspect ratio (≈0.707 for A4).
  // We compute a cell size that fits within the given panel.
  const A4_RATIO = 297 / 210; // height / width ≈ 1.414

  let cellW, cellH;
  if (cols === 2 && rows === 1 && !isNotepad) {
    // 2-up landscape: 2 portrait pages side by side
    // Panel is wide. Each cell is portrait.
    // Max cell height = panelH; cell width = panelH / A4_RATIO
    const maxCellByHeight = Math.floor(panelH / A4_RATIO);
    // Also constrain so 2 cells + gap fit within panelW
    const maxCellByWidth  = Math.floor((panelW - 8) / 2);
    cellW = Math.min(maxCellByHeight, maxCellByWidth);
    cellH = Math.floor(cellW * A4_RATIO);
  } else if (cols === 2 && rows === 1 && isNotepad) {
    // 2-up notepad: same but panel orientation differs
    const maxCellByHeight = Math.floor(panelH / A4_RATIO);
    const maxCellByWidth  = Math.floor((panelW - 8) / 2);
    cellW = Math.min(maxCellByHeight, maxCellByWidth);
    cellH = Math.floor(cellW * A4_RATIO);
  } else if (rows === 1 && cols === 1) {
    // 1-up: single page fills the whole panel
    // Keep portrait ratio
    const byWidth  = panelW;
    const byHeight = Math.floor(panelW * A4_RATIO);
    if (byHeight <= panelH) {
      cellW = byWidth;
      cellH = byHeight;
    } else {
      cellH = panelH;
      cellW = Math.floor(panelH / A4_RATIO);
    }
  } else {
    // 4-up and others: divide panel into grid
    cellW = Math.floor((panelW - (cols - 1) * 4) / cols);
    cellH = Math.floor((panelH - (rows - 1) * 4) / rows);
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-white relative">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cellW}px)`,
          gridTemplateRows:    `repeat(${rows}, ${cellH}px)`,
          gap: '4px',
        }}
      >
        {cells.map((cell, i) => (
          <PageCell
            key={i}
            cell={cell}
            pageThumbnails={pageThumbnails}
            pageW={cellW}
            pageH={cellH}
          />
        ))}
      </div>
      {bindingType && bindingType !== 'none' && (
        <BindingOverlay bindingType={bindingType} isLandscape={cols > rows} />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  BINDING MARKER — visual staple / spine indicator
// ══════════════════════════════════════════════════════════════
function BindingMarker({ bindingType, flipStyle }) {
  if (!bindingType || bindingType === 'none') return null;

  // For book flip: binding is on the VERTICAL center (spine)
  // For notepad flip: binding is on the HORIZONTAL top edge
  const isNotepad = flipStyle === 'notepad';

  const label = {
    '2-staples':    '📎 2 Staples',
    'top-staple':   '📌 Top Staple',
    'saddle-stitch':'📖 Saddle Stitch',
    'spiral':       '🔩 Spiral',
    'comb':         '🗂 Comb',
  }[bindingType] || '📎';

  if (isNotepad) {
    return (
      <div className="absolute top-0 left-4 right-4 z-40 flex justify-center pointer-events-none">
        <div className="bg-slate-800/90 border border-amber-500/60 text-amber-300 text-[9px] font-extrabold
          px-3 py-1 rounded-b-lg flex items-center space-x-2 shadow-xl">
          <span>{label}</span>
          <span className="text-amber-400/70 text-[8px]">— Bind on Top Edge</span>
        </div>
        {/* Dotted staple line */}
        <div className="absolute top-4 left-0 right-0 border-t-2 border-dashed border-amber-500/40" />
      </div>
    );
  }

  return (
    <div className="absolute top-4 bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none">
      <div className="bg-slate-800/90 border border-indigo-500/60 text-indigo-300 text-[9px] font-extrabold
        px-2 py-1 rounded-lg flex flex-col items-center shadow-xl" style={{ writingMode: 'vertical-rl' }}>
        <span style={{ transform: 'rotate(180deg)' }}>{label}</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  OPEN BOOK VIEW (book style — horizontal peel)
// ══════════════════════════════════════════════════════════════
function OpenBook({
  spread, nextSpread, prevSpread,
  spreadIndex, totalSpreads,
  pageThumbnails, isAnimating, animDir,
  onNext, onPrev,
  layout, bindingType,
  bookW, bookH
}) {
  const panelW = Math.floor(bookW / 2);
  const panelH = bookH;

  const peelSide   = animDir === 'next' ? spread?.right : spread?.left;
  const behindPeel = animDir === 'next' ? nextSpread?.left : prevSpread?.right;
  const revealedR  = animDir === 'next' ? nextSpread?.right : null;
  const revealedL  = animDir === 'prev' ? prevSpread?.left  : null;

  return (
    <div
      className="relative flex select-none"
      style={{
        width:  bookW,
        height: bookH,
        perspective: '2400px',
        perspectiveOrigin: '50% 50%',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Left nav */}
      <button onClick={onPrev} disabled={spreadIndex === 0 || isAnimating}
        className="absolute -left-12 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full
          bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center
          justify-center disabled:opacity-20 transition shadow-xl">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={onNext} disabled={spreadIndex >= totalSpreads - 1 || isAnimating}
        className="absolute -right-12 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full
          bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center
          justify-center disabled:opacity-20 transition shadow-xl">
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Left page stack shadows */}
      {spreadIndex > 0 && [3,2,1].map(d => (
        <div key={d} className="absolute rounded-l-sm pointer-events-none"
          style={{ left: -d*2, top: d, width: panelW, height: panelH, zIndex: d,
            background: ['#94a3b8','#cbd5e1','#e2e8f0'][d-1] }} />
      ))}
      {/* Right page stack shadows */}
      {spreadIndex < totalSpreads - 1 && [3,2,1].map(d => (
        <div key={d} className="absolute rounded-r-sm pointer-events-none"
          style={{ right: -d*2, top: d, left: panelW, height: panelH, zIndex: d,
            background: ['#94a3b8','#cbd5e1','#e2e8f0'][d-1] }} />
      ))}

      {/* ── LEFT PANEL ── */}
      <div className="absolute top-0 left-0 overflow-hidden rounded-l-sm"
        style={{ width: panelW, height: panelH, zIndex: 10, background: '#fff',
          boxShadow: '-2px 0 6px rgba(0,0,0,0.18), inset -20px 0 30px rgba(0,0,0,0.08)' }}>
        <SheetFace
          side={isAnimating && animDir === 'prev' && revealedL ? revealedL : spread?.left}
          pageThumbnails={pageThumbnails}
          panelW={panelW} panelH={panelH}
          isNotepad={false}
          bindingType={bindingType}
        />
        <div className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: 'inset -20px 0 30px rgba(0,0,0,0.10)' }} />
      </div>

      {/* ── CENTER SPINE ── */}
      <div className="absolute top-0 bottom-0 z-30 pointer-events-none"
        style={{ left: panelW - 10, width: 20,
          background: 'linear-gradient(to right, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.05) 65%, rgba(0,0,0,0.25) 100%)' }}>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="absolute top-0 overflow-hidden rounded-r-sm cursor-pointer group"
        style={{ left: panelW, width: panelW, height: panelH, zIndex: 10, background: '#fff',
          boxShadow: '2px 0 6px rgba(0,0,0,0.18), inset 20px 0 30px rgba(0,0,0,0.08)' }}
        onClick={!isAnimating && spreadIndex < totalSpreads - 1 ? onNext : undefined}
        title="Click to turn page"
      >
        {/* Corner hint */}
        {spreadIndex < totalSpreads - 1 && (
          <div className="absolute bottom-0 right-0 w-14 h-14 z-20 pointer-events-none
            opacity-0 group-hover:opacity-100 transition-opacity">
            <div style={{ position:'absolute', bottom:0, right:0, width:0, height:0,
              borderStyle:'solid', borderWidth:'0 0 48px 48px',
              borderColor:'transparent transparent rgba(99,102,241,0.3) transparent' }} />
            <span className="absolute bottom-1.5 right-1.5 text-xs">👆</span>
          </div>
        )}
        <SheetFace
          side={isAnimating && animDir === 'next' && revealedR ? revealedR : spread?.right}
          pageThumbnails={pageThumbnails}
          panelW={panelW} panelH={panelH}
          isNotepad={false}
          bindingType={bindingType}
        />
        <div className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: 'inset 20px 0 30px rgba(0,0,0,0.10)' }} />
      </div>

      {/* ── Binding marker ── */}
      <BindingMarker bindingType={bindingType} flipStyle="book" />

      {/* ── PEEL PANEL ── */}
      {isAnimating && (
        <div className="absolute top-0 overflow-hidden"
          style={{
            width: panelW, height: panelH, zIndex: 50,
            left: animDir === 'next' ? panelW : 0,
            transformOrigin: animDir === 'next' ? 'left center' : 'right center',
            transformStyle: 'preserve-3d',
            animation: animDir === 'next'
              ? 'peelToLeft  0.72s cubic-bezier(0.55,0.00,0.45,1.00) forwards'
              : 'peelToRight 0.72s cubic-bezier(0.55,0.00,0.45,1.00) forwards',
          }}
        >
          {/* Front face */}
          <div className="absolute inset-0 overflow-hidden bg-white" style={{ backfaceVisibility: 'hidden' }}>
            <div className="absolute inset-0 z-10 pointer-events-none"
              style={{ background: animDir === 'next'
                ? 'linear-gradient(to left,  rgba(0,0,0,0.20) 0%, transparent 55%)'
                : 'linear-gradient(to right, rgba(0,0,0,0.20) 0%, transparent 55%)' }} />
            <SheetFace
              side={peelSide}
              pageThumbnails={pageThumbnails}
              panelW={panelW} panelH={panelH}
              isNotepad={false}
            />
          </div>
          {/* Back face (paper underside seen mid-air) */}
          <div className="absolute inset-0 bg-slate-100" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <SheetFace side={behindPeel} pageThumbnails={pageThumbnails} panelW={panelW} panelH={panelH} isNotepad={false} />
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(135deg,rgba(241,245,249,0.6) 0%,rgba(226,232,240,0.9) 100%)' }} />
          </div>
        </div>
      )}

      {/* Edge lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-slate-300 z-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-300 z-40 pointer-events-none" />
      <div className="absolute top-0 left-0 bottom-0 w-px bg-slate-300 z-40 pointer-events-none" />
      <div className="absolute top-0 right-0 bottom-0 w-px bg-slate-300 z-40 pointer-events-none" />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  OPEN NOTEPAD VIEW (notepad style — vertical peel, top↔bottom)
// ══════════════════════════════════════════════════════════════
function OpenNotepad({
  spread, nextSpread, prevSpread,
  spreadIndex, totalSpreads,
  pageThumbnails, isAnimating, animDir,
  onNext, onPrev,
  layout, bindingType,
  bookW, bookH
}) {
  const panelW = bookW;
  const panelH = Math.floor(bookH / 2);

  const peelSide   = animDir === 'next' ? spread?.right : spread?.left;
  const behindPeel = animDir === 'next' ? nextSpread?.left : prevSpread?.right;
  const revealedBottom = animDir === 'next' ? nextSpread?.right : null;
  const revealedTop    = animDir === 'prev' ? prevSpread?.left  : null;

  return (
    <div
      className="relative flex flex-col select-none"
      style={{
        width: bookW, height: bookH,
        perspective: '2400px',
        perspectiveOrigin: '50% 50%',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Up / Down nav */}
      <button onClick={onPrev} disabled={spreadIndex === 0 || isAnimating}
        className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 w-10 h-10 rounded-full
          bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center
          justify-center disabled:opacity-20 transition shadow-xl">
        <ChevronUp className="w-5 h-5" />
      </button>
      <button onClick={onNext} disabled={spreadIndex >= totalSpreads - 1 || isAnimating}
        className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-50 w-10 h-10 rounded-full
          bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center
          justify-center disabled:opacity-20 transition shadow-xl">
        <ChevronDown className="w-5 h-5" />
      </button>

      {/* Top stack shadows */}
      {spreadIndex > 0 && [3,2,1].map(d => (
        <div key={d} className="absolute rounded-t-sm pointer-events-none"
          style={{ top: -d*2, left: d, right: 0, height: panelH, zIndex: d,
            background: ['#94a3b8','#cbd5e1','#e2e8f0'][d-1] }} />
      ))}
      {/* Bottom stack shadows */}
      {spreadIndex < totalSpreads - 1 && [3,2,1].map(d => (
        <div key={d} className="absolute rounded-b-sm pointer-events-none"
          style={{ bottom: -d*2, left: d, right: 0, top: panelH, zIndex: d,
            background: ['#94a3b8','#cbd5e1','#e2e8f0'][d-1] }} />
      ))}

      {/* ── TOP PANEL (= "left" in spread model) ── */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden rounded-t-sm"
        style={{ height: panelH, zIndex: 10, background: '#fff',
          boxShadow: '0 -2px 6px rgba(0,0,0,0.18), inset 0 -20px 30px rgba(0,0,0,0.08)' }}>
        <SheetFace
          side={isAnimating && animDir === 'prev' && revealedTop ? revealedTop : spread?.left}
          pageThumbnails={pageThumbnails}
          panelW={panelW} panelH={panelH}
          isNotepad={true}
          bindingType={bindingType}
        />
        <div className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: 'inset 0 -20px 30px rgba(0,0,0,0.10)' }} />
      </div>

      {/* ── CENTER HORIZONTAL SPINE ── */}
      <div className="absolute left-0 right-0 z-30 pointer-events-none"
        style={{ top: panelH - 10, height: 20,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.05) 65%, rgba(0,0,0,0.25) 100%)' }}>
      </div>

      {/* ── BOTTOM PANEL (= "right" in spread model) ── */}
      <div className="absolute left-0 right-0 overflow-hidden rounded-b-sm cursor-pointer group"
        style={{ top: panelH, height: panelH, zIndex: 10, background: '#fff',
          boxShadow: '0 2px 6px rgba(0,0,0,0.18), inset 0 20px 30px rgba(0,0,0,0.08)' }}
        onClick={!isAnimating && spreadIndex < totalSpreads - 1 ? onNext : undefined}
        title="Click to flip page"
      >
        {/* Corner hint (bottom-right) */}
        {spreadIndex < totalSpreads - 1 && (
          <div className="absolute bottom-0 right-0 w-14 h-14 z-20 pointer-events-none
            opacity-0 group-hover:opacity-100 transition-opacity">
            <div style={{ position:'absolute', bottom:0, right:0, width:0, height:0,
              borderStyle:'solid', borderWidth:'0 0 48px 48px',
              borderColor:'transparent transparent rgba(245,158,11,0.3) transparent' }} />
            <span className="absolute bottom-1.5 right-1.5 text-xs">👆</span>
          </div>
        )}
        <SheetFace
          side={isAnimating && animDir === 'next' && revealedBottom ? revealedBottom : spread?.right}
          pageThumbnails={pageThumbnails}
          panelW={panelW} panelH={panelH}
          isNotepad={true}
          bindingType={bindingType}
        />
        <div className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: 'inset 0 20px 30px rgba(0,0,0,0.10)' }} />
      </div>

      {/* ── Binding marker ── */}
      <BindingMarker bindingType={bindingType} flipStyle="notepad" />

      {/* ── PEEL PANEL ── */}
      {isAnimating && (
        <div className="absolute left-0 right-0 overflow-hidden"
          style={{
            height: panelH, zIndex: 50,
            top: animDir === 'next' ? panelH : 0,
            transformOrigin: animDir === 'next' ? 'center top' : 'center bottom',
            transformStyle: 'preserve-3d',
            animation: animDir === 'next'
              ? 'peelToTop    0.72s cubic-bezier(0.55,0.00,0.45,1.00) forwards'
              : 'peelToBottom 0.72s cubic-bezier(0.55,0.00,0.45,1.00) forwards',
          }}
        >
          {/* Front face */}
          <div className="absolute inset-0 overflow-hidden bg-white" style={{ backfaceVisibility: 'hidden' }}>
            <div className="absolute inset-0 z-10 pointer-events-none"
              style={{ background: animDir === 'next'
                ? 'linear-gradient(to top, rgba(0,0,0,0.20) 0%, transparent 55%)'
                : 'linear-gradient(to bottom, rgba(0,0,0,0.20) 0%, transparent 55%)' }} />
            <SheetFace
              side={peelSide} pageThumbnails={pageThumbnails}
              panelW={panelW} panelH={panelH} isNotepad={true}
            />
          </div>
          {/* Back face */}
          <div className="absolute inset-0 bg-slate-100" style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}>
            <SheetFace side={behindPeel} pageThumbnails={pageThumbnails} panelW={panelW} panelH={panelH} isNotepad={true} />
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(180deg,rgba(241,245,249,0.6) 0%,rgba(226,232,240,0.9) 100%)' }} />
          </div>
        </div>
      )}

      {/* Edge lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-slate-300 z-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-300 z-40 pointer-events-none" />
      <div className="absolute top-0 left-0 bottom-0 w-px bg-slate-300 z-40 pointer-events-none" />
      <div className="absolute top-0 right-0 bottom-0 w-px bg-slate-300 z-40 pointer-events-none" />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  SPREAD INFO BAR
// ══════════════════════════════════════════════════════════════
function SpreadInfoBar({ spread, spreadIndex, totalSpreads, flipStyle }) {
  const leftPages  = spread?.left?.cells?.filter(c=>c?.pageNumber).map(c=>`P${c.pageNumber}`) || [];
  const rightPages = spread?.right?.cells?.filter(c=>c?.pageNumber).map(c=>`P${c.pageNumber}`) || [];
  const isNotepad  = flipStyle === 'notepad';
  const labelA     = isNotepad ? 'Top (Read)' : 'Left (Read)';
  const labelB     = isNotepad ? 'Bottom'     : 'Right';

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
      <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
        <span className="text-slate-400">{labelA}:</span>
        <span className="font-bold text-blue-300">{leftPages.length ? leftPages.join(' + ') : '—'}</span>
      </div>
      <div className="text-slate-600">|</div>
      <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
        <span className="text-slate-400">{labelB}:</span>
        <span className="font-bold text-emerald-300">{rightPages.length ? rightPages.join(' + ') : '—'}</span>
      </div>
      <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-950 border border-indigo-800">
        <span className="text-indigo-400">View</span>
        <span className="font-bold text-white">{spreadIndex + 1}/{totalSpreads}</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  THUMBNAIL STRIP
// ══════════════════════════════════════════════════════════════
function SpreadStrip({ spreads, activeIndex, pageThumbnails, onSelect }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      const el = ref.current.children[activeIndex];
      if (el) el.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' });
    }
  }, [activeIndex]);

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-3">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Jump to any spread</span>
        </span>
        <span className="text-[11px] font-mono text-indigo-300">{activeIndex + 1}/{spreads.length}</span>
      </div>
      <div ref={ref} className="flex items-end space-x-2 overflow-x-auto pb-1 no-scrollbar">
        {spreads.map((s, idx) => {
          const isActive = idx === activeIndex;
          const leftP  = s?.left?.cells?.find(c=>c?.pageNumber)?.pageNumber;
          const rightP = s?.right?.cells?.find(c=>c?.pageNumber)?.pageNumber;
          const thumb  = pageThumbnails[leftP || rightP] || null;
          const label  = [leftP?`P${leftP}`:'', rightP?`P${rightP}`:''].filter(Boolean).join('–');

          return (
            <button key={idx} onClick={() => onSelect(idx)}
              className={`flex-shrink-0 p-1.5 rounded-lg border transition-all ${
                isActive
                  ? 'bg-indigo-950 border-indigo-500 ring-2 ring-indigo-400/40 scale-105 shadow-lg'
                  : 'bg-slate-900 border-slate-700 hover:border-slate-500 opacity-60 hover:opacity-100'
              }`}
              style={{ width: 72 }}
            >
              <div className="text-[8px] font-bold text-slate-400 flex justify-between mb-1">
                <span>#{idx+1}</span>
                <span className="text-indigo-400 truncate ml-1">{label}</span>
              </div>
              <div className="flex w-full rounded overflow-hidden border border-slate-600" style={{ height: 48 }}>
                <div className="flex-1 bg-white flex items-center justify-center border-r border-slate-200">
                  {leftP && thumb
                    ? <img src={thumb} alt="" className="max-w-full max-h-full object-contain" />
                    : leftP ? <span className="text-[7px] text-slate-400 font-bold">P{leftP}</span>
                    : <span className="text-[6px] text-slate-300">·</span>
                  }
                </div>
                <div className="flex-1 bg-white flex items-center justify-center">
                  {rightP ? <span className="text-[7px] text-slate-400 font-bold">P{rightP}</span>
                    : <span className="text-[6px] text-slate-300">·</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  LAYOUT EXPLAINER BADGE
// ══════════════════════════════════════════════════════════════
function LayoutBadge({ layout, flipEdge, duplex }) {
  const { flipStyle, isSheetLandscape, backRotation } = layout;
  const isNotepad = flipStyle === 'notepad';

  return (
    <div className={`flex flex-wrap items-center gap-2 text-[11px] font-semibold px-3 py-2 rounded-xl border ${
      isNotepad
        ? 'bg-amber-950/40 border-amber-800/50 text-amber-300'
        : 'bg-indigo-950/40 border-indigo-800/50 text-indigo-300'
    }`}>
      <span>{isNotepad ? '📋 Notepad Style' : '📖 Book Style'}</span>
      <span className="text-slate-500">·</span>
      <span>{isSheetLandscape ? 'Landscape Sheet (2-up)' : 'Portrait Sheet (1-up)'}</span>
      <span className="text-slate-500">·</span>
      <span>{isNotepad ? '↕ Top-to-Bottom Flip' : '↔ Left-to-Right Flip'}</span>
      {duplex && (
        <>
          <span className="text-slate-500">·</span>
          <span className={backRotation === 180
            ? 'text-amber-300 bg-amber-900/40 px-2 py-0.5 rounded'
            : 'text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded'
          }>
            {backRotation === 180 ? '↻ Back: Printed 180° (correct for this flip)' : '▲ Back: Upright (normal)'}
          </span>
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ══════════════════════════════════════════════════════════════
export default function PhysicalSimulator({
  printPlan,
  pageThumbnails,
  activeSheetIndex,
  setActiveSheetIndex,
  flipEdge,
  duplex,
  bindingType,
  docInfo,
}) {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animDir,     setAnimDir]     = useState(null);
  const [isPlaying,   setIsPlaying]   = useState(false);
  const containerRef = useRef(null);
  const [bookDims, setBookDims] = useState({ w: 600, h: 400 });

  const layout  = detectLayout(printPlan, flipEdge);
  const spreads = buildSpreads(printPlan, duplex);

  // Responsive book size
  useEffect(() => {
    function updateDims() {
      const el = containerRef.current;
      if (!el) return;
      const available = el.clientWidth - 120; // 60px padding each side for arrows
      const { isSheetLandscape, flipStyle } = layout;
      const isNotepad = flipStyle === 'notepad';

      if (isNotepad) {
        // Portrait tall layout
        const w = Math.min(available, 480);
        const h = Math.min(Math.floor(w * 1.6), 520);
        setBookDims({ w, h });
      } else if (isSheetLandscape) {
        // 2-up landscape: very wide spread (4 portrait columns)
        // Each page = portrait, so spread aspect ≈ 4 × (1/A4_ratio) wide
        // ≈ 4 × 0.707 = 2.83 wide vs 1 tall
        const w = Math.min(available, 720);
        const h = Math.min(Math.floor(w * 0.36), 320);
        setBookDims({ w, h });
      } else {
        // 1-up portrait: standard book spread ≈ 1.4 wide × 1 tall
        const w = Math.min(available, 600);
        const h = Math.min(Math.floor(w * 0.72), 440);
        setBookDims({ w, h });
      }
    }
    updateDims();
    window.addEventListener('resize', updateDims);
    return () => window.removeEventListener('resize', updateDims);
  }, [layout.flipStyle, layout.isSheetLandscape]);

  // Sync parent
  useEffect(() => {
    const sNum = spreads[spreadIndex]?.rightSheetNum || spreads[spreadIndex]?.leftSheetNum;
    if (sNum) setActiveSheetIndex(Math.max(0, sNum - 1));
  }, [spreadIndex]);

  // Auto-play
  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => {
      setSpreadIndex(p => {
        if (p >= spreads.length - 1) { setIsPlaying(false); return p; }
        return p + 1;
      });
    }, 2500);
    return () => clearInterval(t);
  }, [isPlaying, spreads.length]);

  if (!printPlan || spreads.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
        Upload a PDF to see the book simulation.
      </div>
    );
  }

  const animate = (dir, newIdx) => {
    if (isAnimating) return;
    setAnimDir(dir);
    setIsAnimating(true);
    setTimeout(() => { setSpreadIndex(newIdx); setIsAnimating(false); }, 740);
  };

  const goNext = () => { if (spreadIndex < spreads.length - 1) animate('next', spreadIndex + 1); };
  const goPrev = () => { if (spreadIndex > 0) animate('prev', spreadIndex - 1); };
  const jumpTo = (idx) => { if (idx !== spreadIndex && !isAnimating) setSpreadIndex(idx); };

  const currentSpread = spreads[spreadIndex];
  const nextSpread    = spreads[spreadIndex + 1] || null;
  const prevSpread    = spreads[spreadIndex - 1] || null;
  const isNotepad     = layout.flipStyle === 'notepad';

  const BookView = isNotepad ? OpenNotepad : OpenBook;

  // Desk top padding: notepad = less horizontal padding, more vertical
  const deskPadding = isNotepad
    ? 'pt-16 pb-12 px-8'
    : layout.isSheetLandscape
      ? 'py-10 px-14'
      : 'py-10 px-14';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 flex flex-col">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-white text-base">
              {isNotepad ? 'Notepad Flip Simulator' : 'Book Flip Simulator'}
            </h2>
            <span className="bg-indigo-500/20 text-indigo-300 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              {printPlan.sheets.length} sheets · {layout.pagesPerSide} page/side
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">
            {isNotepad
              ? 'Click the bottom page to flip it up — like turning a notepad or calendar.'
              : 'Click the right page to turn it — like reading a real book.'
            }
          </p>
        </div>
        <button onClick={() => setIsPlaying(!isPlaying)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 border transition ${
            isPlaying
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
          }`}>
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isPlaying ? 'Pause' : 'Auto Flip'}</span>
        </button>
      </div>

      {/* Layout explainer */}
      <LayoutBadge layout={layout} flipEdge={flipEdge} duplex={duplex} />

      {/* Dark studio desk */}
      <div
        ref={containerRef}
        className={`flex items-center justify-center rounded-2xl relative overflow-visible ${deskPadding}`}
        style={{
          minHeight: isNotepad ? 460 : 380,
          background: 'radial-gradient(ellipse at 50% 60%, #1a3a6b 0%, #0c1f3a 40%, #020617 100%)',
          boxShadow: 'inset 0 0 90px rgba(0,0,0,0.75)',
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{ background: 'linear-gradient(to top,rgba(99,102,241,0.07),transparent)' }} />

        <BookView
          spread={currentSpread}
          nextSpread={nextSpread}
          prevSpread={prevSpread}
          spreadIndex={spreadIndex}
          totalSpreads={spreads.length}
          pageThumbnails={pageThumbnails}
          isAnimating={isAnimating}
          animDir={animDir}
          onNext={goNext}
          onPrev={goPrev}
          layout={layout}
          bindingType={bindingType}
          bookW={bookDims.w}
          bookH={bookDims.h}
        />
      </div>

      {/* Spread info */}
      <SpreadInfoBar
        spread={currentSpread}
        spreadIndex={spreadIndex}
        totalSpreads={spreads.length}
        flipStyle={layout.flipStyle}
      />

      {/* First-time hint */}
      {spreadIndex === 0 && (
        <div className="bg-indigo-950/50 border border-indigo-800/40 rounded-xl px-4 py-2.5 text-xs text-indigo-300 text-center flex items-center justify-center space-x-2">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            This is the <strong>cover (Sheet 1 front)</strong>.
            {isNotepad
              ? ' Click the bottom half or press ↓ to flip the first page up.'
              : ' Click the right page or press → to turn it to see what\'s behind.'
            }
          </span>
        </div>
      )}

      {/* Thumbnail strip */}
      <SpreadStrip
        spreads={spreads}
        activeIndex={spreadIndex}
        pageThumbnails={pageThumbnails}
        onSelect={jumpTo}
      />
    </div>
  );
}
