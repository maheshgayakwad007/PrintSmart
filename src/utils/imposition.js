/**
 * Core Imposition & Layout Calculator for PrintSmart
 * Converts user PDF metadata and print preferences into an exact Physical Sheet Mapping.
 */

/**
 * Calculates the complete Print Plan containing sheet-by-sheet front/back layout assignments.
 */
export function calculatePrintPlan(config) {
  const {
    pageCount = 1,
    pagesPerSide = 2, // 1, 2, 4, 6, 9, 'booklet'
    duplex = true,
    flipEdge = 'long', // 'long' | 'short'
    paperSize = 'A4',
    docOrientation = 'portrait', // 'portrait' | 'landscape' | 'mixed'
    pageRange = { type: 'all', start: 1, end: pageCount, customStr: '' },
    autoBlankPadding = true
  } = config;

  // 1. Resolve active page numbers based on page range selection
  const selectedPages = getPageRangeList(pageCount, pageRange);
  const totalSelectedPages = selectedPages.length;

  if (pagesPerSide === 'booklet') {
    return calculateBookletPlan(selectedPages, duplex, flipEdge, paperSize);
  }

  // Grid dimensions per side
  const grid = getGridDimensions(pagesPerSide, docOrientation);
  const pagesPerSheetSide = grid.rows * grid.cols;
  const pagesPerPhysicalSheet = duplex ? pagesPerSheetSide * 2 : pagesPerSheetSide;

  // Total physical sheets calculation
  const totalSheets = Math.ceil(totalSelectedPages / pagesPerPhysicalSheet);
  const totalSlotsAvailable = totalSheets * pagesPerPhysicalSheet;
  const unusedSlots = totalSlotsAvailable - totalSelectedPages;

  const sheets = [];
  let pageIndex = 0;

  for (let s = 1; s <= totalSheets; s++) {
    // FRONT SIDE
    const frontCells = [];
    for (let i = 0; i < pagesPerSheetSide; i++) {
      if (pageIndex < totalSelectedPages) {
        frontCells.push({
          pageNumber: selectedPages[pageIndex],
          slotIndex: i,
          isBlank: false,
          rotation: 0
        });
        pageIndex++;
      } else {
        frontCells.push({
          pageNumber: null,
          slotIndex: i,
          isBlank: true,
          rotation: 0
        });
      }
    }

    // BACK SIDE (if duplex enabled)
    const backCells = [];
    if (duplex) {
      for (let i = 0; i < pagesPerSheetSide; i++) {
        if (pageIndex < totalSelectedPages) {
          // Calculate back page rotation based on flip mode
          const backRotation = getBackPageRotation(docOrientation, pagesPerSide, flipEdge);
          backCells.push({
            pageNumber: selectedPages[pageIndex],
            slotIndex: i,
            isBlank: false,
            rotation: backRotation
          });
          pageIndex++;
        } else {
          backCells.push({
            pageNumber: null,
            slotIndex: i,
            isBlank: true,
            rotation: 0
          });
        }
      }
    }

    sheets.push({
      sheetNumber: s,
      front: {
        sideName: 'Front',
        cells: frontCells,
        grid
      },
      back: duplex ? {
        sideName: 'Back',
        cells: backCells,
        grid
      } : null
    });
  }

  // Preflight analysis
  const preflight = analyzePreflight(config, totalSelectedPages, totalSheets, unusedSlots);

  // Paper & Environmental Savings
  const originalSheets = duplex ? Math.ceil(totalSelectedPages / 2) : totalSelectedPages;
  const sheetsSaved = Math.max(0, originalSheets - totalSheets);
  const percentageSaved = originalSheets > 0 ? Math.round((sheetsSaved / originalSheets) * 100) : 0;

  return {
    sheets,
    summary: {
      totalInputPages: totalSelectedPages,
      totalSheets,
      unusedSlots,
      pagesPerSide,
      duplex,
      flipEdge,
      paperSize,
      sheetsSaved,
      percentageSaved,
      grid
    },
    preflight
  };
}

/**
 * Calculates Saddle-Stitch Booklet Imposition
 */
function calculateBookletPlan(pagesList, duplex, flipEdge, paperSize) {
  let list = [...pagesList];
  // Booklet total pages must be a multiple of 4
  const remainder = list.length % 4;
  const paddingNeeded = remainder === 0 ? 0 : 4 - remainder;
  
  for (let i = 0; i < paddingNeeded; i++) {
    list.push(null); // Blank padding page
  }

  const totalBookletPages = list.length;
  const totalSheets = totalBookletPages / 4;
  const sheets = [];

  for (let s = 1; s <= totalSheets; s++) {
    // Booklet Front Side: Left = Last - 2*(s-1), Right = 2*s - 1
    const frontLeftPage = list[totalBookletPages - 1 - 2 * (s - 1)];
    const frontRightPage = list[2 * (s - 1)];

    // Booklet Back Side: Left = 2*s, Right = Last - 1 - 2*(s-1)
    const backLeftPage = list[2 * (s - 1) + 1];
    const backRightPage = list[totalBookletPages - 2 - 2 * (s - 1)];

    const grid = { rows: 1, cols: 2 };

    sheets.push({
      sheetNumber: s,
      isBooklet: true,
      front: {
        sideName: 'Front',
        grid,
        cells: [
          { pageNumber: frontLeftPage, slotIndex: 0, isBlank: frontLeftPage === null, rotation: 0 },
          { pageNumber: frontRightPage, slotIndex: 1, isBlank: frontRightPage === null, rotation: 0 }
        ]
      },
      back: duplex ? {
        sideName: 'Back',
        grid,
        cells: [
          { pageNumber: backLeftPage, slotIndex: 0, isBlank: backLeftPage === null, rotation: 0 },
          { pageNumber: backRightPage, slotIndex: 1, isBlank: backRightPage === null, rotation: 0 }
        ]
      } : null
    });
  }

  const preflight = analyzePreflight(
    { pagesPerSide: 'booklet', duplex: true, flipEdge: 'short', docOrientation: 'portrait' },
    pagesList.length,
    totalSheets,
    paddingNeeded
  );

  return {
    sheets,
    summary: {
      totalInputPages: pagesList.length,
      totalSheets,
      unusedSlots: paddingNeeded,
      pagesPerSide: 'booklet',
      duplex: true,
      flipEdge,
      paperSize,
      sheetsSaved: Math.max(0, pagesList.length - totalSheets),
      percentageSaved: Math.round(((pagesList.length - totalSheets) / pagesList.length) * 100),
      grid: { rows: 1, cols: 2 }
    },
    preflight
  };
}

/**
 * Returns grid rows and columns based on pages per side
 */
export function getGridDimensions(pagesPerSide, docOrientation = 'portrait') {
  switch (pagesPerSide) {
    case 1:
      return { rows: 1, cols: 1 };
    case 2:
      // 2-up on portrait paper placing 2 portrait pages side-by-side yields landscape sheet
      return { rows: 1, cols: 2 };
    case 4:
      return { rows: 2, cols: 2 };
    case 6:
      return { rows: 2, cols: 3 };
    case 9:
      return { rows: 3, cols: 3 };
    case 'booklet':
      return { rows: 1, cols: 2 };
    default:
      return { rows: 1, cols: 2 };
  }
}

/**
 * Calculates back page rotation to determine if back side text will be right-side-up or inverted
 */
function getBackPageRotation(docOrientation, pagesPerSide, flipEdge) {
  // Sheet physical orientation for 2-up portrait is landscape (wide paper)
  const isSheetLandscape = pagesPerSide === 2 || docOrientation === 'landscape';

  if (!isSheetLandscape) {
    // Normal Portrait Sheet:
    // Long Edge flip = flip left-to-right like a book -> Back page is upright (0°)
    // Short Edge flip = flip top-to-bottom like a notepad -> Back page needs 180° rotation if not flipped by driver
    return flipEdge === 'short' ? 180 : 0;
  } else {
    // Landscape Sheet:
    // Long Edge is top/bottom horizontal edge!
    // Flipping on Long Edge turns top-to-bottom like a wall calendar -> Needs 180° rotation!
    // Flipping on Short Edge turns left-to-right like a book -> Upright (0°)!
    return flipEdge === 'long' ? 180 : 0;
  }
}

/**
 * Preflight analysis engine to highlight potential user errors and warnings
 */
export function analyzePreflight(config, totalPages, totalSheets, unusedSlots) {
  const warnings = [];
  const recommendations = [];

  const { pagesPerSide, duplex, flipEdge, docOrientation } = config;

  // 1. Orientation vs Flip Edge Check (The #1 beginner confusion!)
  const isSheetLandscape = pagesPerSide === 2 || docOrientation === 'landscape';

  if (duplex) {
    if (!isSheetLandscape && flipEdge === 'short') {
      warnings.push({
        id: 'notepad-flip-notice',
        severity: 'warning',
        title: 'Short Edge Notepad Flip Selected',
        message: 'Turning this portrait document like a notepad (top-to-bottom) will make back pages upside down if flipped like a normal book.',
        recommendation: 'Use Long Edge (Book Flip) for normal reading, or ensure you turn paper top-to-bottom.'
      });
    }

    if (isSheetLandscape && flipEdge === 'long') {
      warnings.push({
        id: 'landscape-long-edge-inverted',
        severity: 'danger',
        title: 'Potential Upside-Down Back Page Warning!',
        message: 'On a 2-up / Landscape sheet, the "Long Edge" is the top horizontal border. Choosing Long Edge here turns the paper top-to-bottom like a wall calendar!',
        recommendation: 'For 2-up landscape reading like a book, select Short Edge Flip!'
      });
    }
  }

  // 2. Unused Slots / Blank Page Warning
  if (unusedSlots > 0) {
    warnings.push({
      id: 'unused-slots-info',
      severity: 'info',
      title: `${unusedSlots} Unused Page Slot${unusedSlots > 1 ? 's' : ''} Detected`,
      message: `The last sheet (Sheet ${totalSheets}) has ${unusedSlots} empty grid position${unusedSlots > 1 ? 's' : ''}. PrintSmart will automatically insert clean blank space.`,
      recommendation: 'No action needed. Paper layout is padded cleanly.'
    });
  }

  // 3. Margin Safety Check
  warnings.push({
    id: 'margin-safety',
    severity: 'tip',
    title: 'Printer Non-Printable Margin Safe',
    message: 'PrintSmart applies a default 5mm printer safety margin to prevent edge trimming by desktop inkjets/laser printers.',
    recommendation: 'Set printer driver to "100% Actual Size" or "Do Not Scale" to avoid double-scaling.'
  });

  return { warnings, recommendations };
}

/**
 * Parses user page range input string like "1-5, 8, 11-20"
 */
export function getPageRangeList(totalPdfPages, rangeConfig) {
  if (!rangeConfig || rangeConfig.type === 'all') {
    return Array.from({ length: totalPdfPages }, (_, i) => i + 1);
  }

  if (rangeConfig.type === 'range') {
    const start = Math.max(1, rangeConfig.start || 1);
    const end = Math.min(totalPdfPages, rangeConfig.end || totalPdfPages);
    const result = [];
    for (let i = start; i <= end; i++) result.push(i);
    return result;
  }

  if (rangeConfig.type === 'custom' && rangeConfig.customStr) {
    const parts = rangeConfig.customStr.split(',');
    const pagesSet = new Set();

    parts.forEach(part => {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [s, e] = trimmed.split('-').map(n => parseInt(n.trim(), 10));
        if (!isNaN(s) && !isNaN(e)) {
          for (let i = Math.max(1, s); i <= Math.min(totalPdfPages, e); i++) {
            pagesSet.add(i);
          }
        }
      } else {
        const num = parseInt(trimmed, 10);
        if (!isNaN(num) && num >= 1 && num <= totalPdfPages) {
          pagesSet.add(num);
        }
      }
    });

    const result = Array.from(pagesSet).sort((a, b) => a - b);
    return result.length > 0 ? result : Array.from({ length: totalPdfPages }, (_, i) => i + 1);
  }

  return Array.from({ length: totalPdfPages }, (_, i) => i + 1);
}
