/**
 * Generates sample document pages rendered directly to canvas/image data
 * so users can test the print planner instantly without needing their own PDF file.
 */

export const SAMPLE_DOCUMENTS = [
  {
    id: 'computer-networks',
    name: 'Computer Networks - Lecture Notes (12 Pages)',
    pageCount: 12,
    pageSize: 'A4',
    orientation: 'portrait',
    description: 'Standard multi-page portrait study notes. Ideal for testing 2-up & 4-up duplex printing.',
    type: 'notes'
  },
  {
    id: 'financial-report',
    name: 'Q3 Financial Slides (8 Pages - Landscape)',
    pageCount: 8,
    pageSize: 'A4',
    orientation: 'landscape',
    description: 'Landscape presentation slides. Great for seeing why Short Edge flip is recommended for landscape!',
    type: 'slides'
  },
  {
    id: 'project-booklet',
    name: 'Student Project Booklet (16 Pages)',
    pageCount: 16,
    pageSize: 'A4',
    orientation: 'portrait',
    description: 'Complete 16-page project report designed for Booklet Imposition (Saddle-Stitch Folding).',
    type: 'booklet'
  },
  {
    id: 'mixed-orientation',
    name: 'Engineering Thesis (10 Pages - Mixed Portrait & Landscape)',
    pageCount: 10,
    pageSize: 'A4',
    orientation: 'mixed',
    description: 'Contains portrait text pages & landscape data diagrams. Tests preflight orientation warnings.',
    type: 'mixed'
  }
];

/**
 * Render a simulated page onto an HTML5 Canvas and return data URL
 */
export function renderSamplePageCanvas(docId, pageNumber, totalPages, width = 600, height = 848) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const isLandscape = height < width;
  const isOdd = pageNumber % 2 !== 0;

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, isOdd ? '#ffffff' : '#f8fafc');
  bgGrad.addColorStop(1, isOdd ? '#f1f5f9' : '#e2e8f0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Border & Printable Margin Guide
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.strokeRect(15, 15, width - 30, height - 30);

  // Non-printable safety zone line (dashed red light)
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#fca5a5';
  ctx.strokeRect(25, 25, width - 50, height - 50);
  ctx.setLineDash([]);

  // Header Banner
  const headerHeight = Math.min(80, height * 0.1);
  const themeColor = docId.includes('financial') ? '#0284c7' : (docId.includes('booklet') ? '#0d9488' : '#6366f1');
  
  ctx.fillStyle = themeColor;
  ctx.fillRect(25, 25, width - 50, headerHeight);

  // Header Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Inter, sans-serif';
  ctx.fillText(`PAGE ${pageNumber} of ${totalPages}`, 40, 55);

  ctx.font = '13px Inter, sans-serif';
  ctx.fillText(docId.toUpperCase().replace('-', ' '), 40, 78);

  // Orientation & Upright Arrow Indicator
  ctx.fillStyle = '#e0e7ff';
  ctx.fillRect(width - 150, 35, 110, 50);
  ctx.fillStyle = '#312e81';
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.fillText('TOP ▲ UPRIGHT', width - 145, 55);
  ctx.font = '10px Inter, sans-serif';
  ctx.fillText(isLandscape ? 'LANDSCAPE' : 'PORTRAIT', width - 145, 72);

  // Document Content Simulation
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 22px Inter, sans-serif';
  
  let titleText = `Chapter ${Math.ceil(pageNumber / 2)}: `;
  if (docId.includes('financial')) titleText = `Slide ${pageNumber}: Q3 Metrics & Key Highlights`;
  else if (docId.includes('booklet')) titleText = `Section ${pageNumber}: Detailed Analysis`;
  else titleText += `Network Protocol Layer ${pageNumber}`;

  ctx.fillText(titleText, 45, 140);

  // Mock Paragraph Lines
  ctx.fillStyle = '#475569';
  const startY = 175;
  const lineGap = 22;
  const numLines = Math.floor((height - 240) / lineGap);

  for (let i = 0; i < numLines; i++) {
    const currentY = startY + i * lineGap;
    if (currentY > height - 100) break;

    // Add a diagram block halfway through
    if (i === 4 && pageNumber % 3 === 0) {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(45, currentY, width - 90, 100);
      ctx.strokeStyle = themeColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(45, currentY, width - 90, 100);

      ctx.fillStyle = themeColor;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(`[ Figure ${pageNumber}.1 Data Diagram ]`, 65, currentY + 55);

      i += 4;
      ctx.fillStyle = '#475569';
      continue;
    }

    // Vary line length for text realism
    const lineWidth = (i % 7 === 6) ? (width - 90) * 0.5 : ((i % 3 === 0) ? width - 150 : width - 90);
    ctx.fillRect(45, currentY, lineWidth, 10);
  }

  // Large Watermark Page Number in center background
  ctx.fillStyle = 'rgba(99, 102, 241, 0.06)';
  ctx.font = 'bold 160px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${pageNumber}`, width / 2, height / 2 + 50);
  ctx.textAlign = 'left';

  // Bottom Footer
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px Inter, sans-serif';
  ctx.fillText(`PrintSmart Sample Doc • Sheet Side: ${isOdd ? 'Front Candidate' : 'Back Candidate'}`, 45, height - 40);
  
  // Bottom Right Arrow
  ctx.fillStyle = themeColor;
  ctx.fillRect(width - 160, height - 60, 120, 25);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillText('BOTTOM ▼ END', width - 150, height - 43);

  return canvas.toDataURL('image/png');
}
