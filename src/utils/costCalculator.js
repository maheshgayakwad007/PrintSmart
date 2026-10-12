/**
 * Pricing & Paper Savings Engine for PrintSmart
 */

export const DEFAULT_PRICING = {
  currencySymbol: '₹',
  paperCostPerSheet: 0.50,   // Raw blank A4 sheet cost
  bwPrintPerSheet: 1.50,     // B&W printing cost per sheet side
  colorPrintPerSheet: 5.00,  // Color printing cost per sheet side
  duplexDiscountPercent: 10, // 10% discount for duplex paper saving
  stapleFee: 2.00,           // Per staple
  spiralBindingFee: 35.00,   // Spiral binding flat fee
  combBindingFee: 25.00      // Comb binding flat fee
};

export function calculatePrintCost(summary, settings = DEFAULT_PRICING, colorMode = 'bw', bindingType = 'none') {
  const { totalInputPages, totalSheets, duplex } = summary;
  const currency = settings.currencySymbol || '₹';

  // 1. Single-sided baseline cost (no imposition, single sided)
  const baselineSheets = totalInputPages;
  const baselinePaperCost = baselineSheets * settings.paperCostPerSheet;
  const printCostPerSide = colorMode === 'color' ? settings.colorPrintPerSheet : settings.bwPrintPerSheet;
  const baselinePrintCost = totalInputPages * printCostPerSide;
  const baselineTotal = baselinePaperCost + baselinePrintCost;

  // 2. Optimized PrintSmart cost
  const actualPaperCost = totalSheets * settings.paperCostPerSheet;
  
  // Total sides printed
  const printedSides = duplex ? Math.ceil(totalInputPages / summary.pagesPerSide) : totalInputPages;
  const actualPrintCost = printedSides * printCostPerSide;

  // Binding fee
  let bindingFee = 0;
  if (bindingType === 'staple' || bindingType === '2-staples') bindingFee = settings.stapleFee * 2;
  else if (bindingType === 'spiral') bindingFee = settings.spiralBindingFee;
  else if (bindingType === 'comb') bindingFee = settings.combBindingFee;

  const totalCost = actualPaperCost + actualPrintCost + bindingFee;
  const moneySaved = Math.max(0, baselineTotal - totalCost);

  // Environmental Impact metrics
  // 1 ream of paper (500 sheets) = ~0.05 trees, ~50 liters of water
  const sheetsSaved = Math.max(0, baselineSheets - totalSheets);
  const treesSaved = (sheetsSaved / 500) * 0.05;
  const waterSavedLiters = (sheetsSaved / 500) * 50;

  return {
    currency,
    baselineSheets,
    baselineTotal: baselineTotal.toFixed(2),
    optimizedSheets: totalSheets,
    totalCost: totalCost.toFixed(2),
    moneySaved: moneySaved.toFixed(2),
    breakdown: {
      paper: actualPaperCost.toFixed(2),
      printing: actualPrintCost.toFixed(2),
      binding: bindingFee.toFixed(2)
    },
    environmental: {
      sheetsSaved,
      treesSaved: treesSaved.toFixed(3),
      waterSavedLiters: waterSavedLiters.toFixed(1)
    }
  };
}
