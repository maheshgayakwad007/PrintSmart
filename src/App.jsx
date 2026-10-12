import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import StepProgress from './components/StepProgress';

import UploadPage from './pages/UploadPage';
import SettingsPage from './pages/SettingsPage';
import PreviewPage from './pages/PreviewPage';
import SummaryPage from './pages/SummaryPage';
import ManualDuplexWizard from './components/ManualDuplexWizard';
import FlipEducationModal from './components/FlipEducationModal';
import JobTicketModal from './components/JobTicketModal';
import PrinterConnectionModal from './components/PrinterConnectionModal';

import { SAMPLE_DOCUMENTS, renderSamplePageCanvas } from './utils/samplePdfGenerator';
import { calculatePrintPlan } from './utils/imposition';
import { loadPdfDocument, renderPdfPageToDataUrl, generatePrintReadyPdf, printDocumentDirectly } from './utils/pdfEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'settings' | 'preview' | 'summary'
  const [uxMode, setUxMode] = useState('simple'); // 'simple' | 'pro'
  const [appMode, setAppMode] = useState('student'); // 'student' | 'shop'
  
  const [pdfData, setPdfData] = useState(null);
  const [loadedPdfDoc, setLoadedPdfDoc] = useState(null);
  
  const [docInfo, setDocInfo] = useState({
    name: 'Computer Networks - Lecture Notes (12 Pages)',
    pageCount: 12,
    pageSize: 'A4',
    orientation: 'portrait'
  });

  const [activeSampleId, setActiveSampleId] = useState('computer-networks');
  const [pageThumbnails, setPageThumbnails] = useState({});
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);

  // Printer State
  const [activePrinter, setActivePrinter] = useState({
    id: 'system-spooler',
    name: 'System Default Printer (Browser Spooler)',
    type: 'system',
    status: 'ready',
    location: 'Local Computer / Mobile Device',
    ip: '127.0.0.1 (Local Spooler)',
    duplex: 'Hardware Auto-Duplex Supported',
    paperTray: 'A4 / Letter (Loaded)',
    inkLevels: { black: 95, cyan: 88, magenta: 90, yellow: 82 }
  });

  // Configuration State
  const [config, setConfig] = useState({
    pageCount: 12,
    pagesPerSide: 2, // 1, 2, 4, 6, 9, 'booklet'
    duplex: true,
    flipEdge: 'long', // 'long' | 'short'
    paperSize: 'A4',
    margins: 8,
    bindingType: 'none',
    pageRange: { type: 'all', start: 1, end: 12, customStr: '' }
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Modals state
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [showFlipHelp, setShowFlipHelp] = useState(false);
  const [showManualDuplex, setShowManualDuplex] = useState(false);
  const [showJobTicket, setShowJobTicket] = useState(false);

  // 1. Load initial sample document on mount
  useEffect(() => {
    loadSamplePreset(SAMPLE_DOCUMENTS[0]);
  }, []);

  // 2. Compute Imposition Print Plan
  const printPlan = useMemo(() => {
    return calculatePrintPlan({
      ...config,
      pageCount: docInfo.pageCount,
      docOrientation: docInfo.orientation
    });
  }, [config, docInfo]);

  // Keep sheet index in bounds
  useEffect(() => {
    if (printPlan && printPlan.sheets && activeSheetIndex >= printPlan.sheets.length) {
      setActiveSheetIndex(0);
    }
  }, [printPlan]);

  // 3. Load Sample Preset
  const loadSamplePreset = (sample) => {
    setActiveSampleId(sample.id);
    setPdfData(null);
    setLoadedPdfDoc(null);

    setDocInfo({
      name: sample.name,
      pageCount: sample.pageCount,
      pageSize: sample.pageSize,
      orientation: sample.orientation
    });

    setConfig(prev => ({
      ...prev,
      pageCount: sample.pageCount,
      pagesPerSide: sample.id.includes('booklet') ? 'booklet' : 2,
      pageRange: { type: 'all', start: 1, end: sample.pageCount, customStr: '' }
    }));

    const thumbs = {};
    for (let i = 1; i <= sample.pageCount; i++) {
      thumbs[i] = renderSamplePageCanvas(sample.id, i, sample.pageCount);
    }
    setPageThumbnails(thumbs);
    setActiveSheetIndex(0);
  };

  // 4. Handle Upload
  const handleFileUpload = async (file) => {
    try {
      setActiveSampleId(null);
      const doc = await loadPdfDocument(file);
      setPdfData(doc.arrayBuffer.slice(0));
      setLoadedPdfDoc(doc.pdfDoc);

      setDocInfo({
        name: file.name,
        pageCount: doc.pageCount,
        pageSize: doc.pageSize,
        orientation: doc.orientation
      });

      setConfig(prev => ({
        ...prev,
        pageCount: doc.pageCount,
        pageRange: { type: 'all', start: 1, end: doc.pageCount, customStr: '' }
      }));

      const thumbs = {};
      for (let i = 1; i <= Math.min(doc.pageCount, 32); i++) {
        const thumbUrl = await renderPdfPageToDataUrl(doc.pdfDoc, i, 0.6);
        if (thumbUrl) thumbs[i] = thumbUrl;
      }
      setPageThumbnails(thumbs);
      setActiveSheetIndex(0);
    } catch (err) {
      alert(`Error loading PDF: ${err.message}`);
    }
  };

  // 5. Generate PDF Download
  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    const result = await generatePrintReadyPdf(pdfData, printPlan, config, docInfo.name);
    setIsGenerating(false);
    return result;
  };

  // 6. Direct Print
  const handleDirectPrint = async () => {
    setIsPrinting(true);
    const result = await printDocumentDirectly(pdfData, printPlan, config, docInfo.name);
    setIsPrinting(false);
    return result;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Main Navbar */}
      <Navbar
        uxMode={uxMode}
        setUxMode={setUxMode}
        activePrinter={activePrinter}
        onOpenPrinterModal={() => setShowPrinterModal(true)}
        onOpenHelp={() => setShowFlipHelp(true)}
        onOpenJobTicket={() => setShowJobTicket(true)}
        pdfLoaded={true}
        activeDocName={docInfo.name}
      />

      {/* Step Progress Wizard Bar (Clean 4 Steps) */}
      <StepProgress
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Page Viewport Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 transition-all">
        
        {/* STEP 1: Choose Document */}
        {activeTab === 'upload' && (
          <UploadPage
            onFileUpload={handleFileUpload}
            onSelectSample={loadSamplePreset}
            activeSampleId={activeSampleId}
            pdfLoaded={!!pdfData || !!activeSampleId}
            docInfo={docInfo}
            onNext={() => setActiveTab('settings')}
          />
        )}

        {/* STEP 2: Print Style */}
        {activeTab === 'settings' && (
          <SettingsPage
            config={config}
            setConfig={setConfig}
            uxMode={uxMode}
            setUxMode={setUxMode}
            onOpenFlipHelp={() => setShowFlipHelp(true)}
            preflight={printPlan.preflight}
            onNext={() => setActiveTab('preview')}
          />
        )}

        {/* STEP 3: 3D Paper & Flip Simulator */}
        {activeTab === 'preview' && (
          <PreviewPage
            printPlan={printPlan}
            pageThumbnails={pageThumbnails}
            activeSheetIndex={activeSheetIndex}
            setActiveSheetIndex={setActiveSheetIndex}
            flipEdge={config.flipEdge}
            duplex={config.duplex}
            bindingType={config.bindingType}
            docInfo={docInfo}
            pagesPerSide={config.pagesPerSide}
            onPrev={() => setActiveTab('settings')}
            onNext={() => setActiveTab('summary')}
          />
        )}

        {/* STEP 4: Print & Download */}
        {activeTab === 'summary' && (
          <SummaryPage
            summary={printPlan.summary}
            docInfo={docInfo}
            appMode={appMode}
            bindingType={config.bindingType}
            onGeneratePdf={handleGeneratePdf}
            isGenerating={isGenerating}
            onDirectPrint={handleDirectPrint}
            isPrinting={isPrinting}
            activePrinter={activePrinter}
            onOpenPrinterModal={() => setShowPrinterModal(true)}
            onOpenJobTicket={() => setShowJobTicket(true)}
            onOpenManualDuplex={() => setShowManualDuplex(true)}
            onPrev={() => setActiveTab('preview')}
          />
        )}

      </main>

      {/* Global Modals */}
      <PrinterConnectionModal
        isOpen={showPrinterModal}
        onClose={() => setShowPrinterModal(false)}
        activePrinter={activePrinter}
        setActivePrinter={setActivePrinter}
        onDirectPrint={handleDirectPrint}
        isPrinting={isPrinting}
      />

      <FlipEducationModal
        isOpen={showFlipHelp}
        onClose={() => setShowFlipHelp(false)}
      />

      <ManualDuplexWizard
        isOpen={showManualDuplex}
        onClose={() => setShowManualDuplex(false)}
      />

      <JobTicketModal
        isOpen={showJobTicket}
        onClose={() => setShowJobTicket(false)}
        summary={printPlan?.summary}
        docInfo={docInfo}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-slate-400">PrintSmart</strong> — Simple, Visual & Mobile-Friendly PDF Print Planner
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>🔒 100% Browser Local</span>
            <span>•</span>
            <span>🌱 Eco Paper Savings</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
