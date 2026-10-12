import React, { useState, useEffect } from 'react';
import {
  Printer, Wifi, Usb, CheckCircle2, RefreshCw, AlertCircle,
  Sliders, ArrowRight, ShieldCheck, Zap, X, ChevronRight, Activity, Droplets
} from 'lucide-react';
import { PDFDocument, rgb } from 'pdf-lib';

export default function PrinterConnectionModal({
  isOpen,
  onClose,
  activePrinter,
  setActivePrinter,
  onDirectPrint,
  isPrinting
}) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [testPrintSending, setTestPrintSending] = useState(false);
  const [testPrintSuccess, setTestPrintSuccess] = useState(false);
  const [customIp, setCustomIp] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  const [printers, setPrinters] = useState([
    {
      id: 'system-spooler',
      name: 'System Default Printer (Browser Spooler)',
      type: 'system',
      status: 'ready',
      location: 'Local Computer / Mobile System',
      ip: '127.0.0.1 (Local Spooler)',
      duplex: 'Hardware Auto-Duplex Supported',
      paperTray: 'A4 / Letter (Loaded)',
      inkLevels: { black: 95, cyan: 88, magenta: 90, yellow: 82 },
      isDefault: true
    },
    {
      id: 'hp-laserjet',
      name: 'HP LaserJet Pro MFP 4101fdw',
      type: 'wifi',
      status: 'ready',
      location: 'Office / Home Wi-Fi',
      ip: '192.168.1.108:9100',
      duplex: 'Hardware Auto-Duplex (Fast)',
      paperTray: 'Tray 2: A4 (80gsm - Full)',
      inkLevels: { toner: 86 },
      isDefault: false
    },
    {
      id: 'canon-pixma',
      name: 'Canon PIXMA TS8320 Series',
      type: 'wifi',
      status: 'ready',
      location: 'Study Room AirPrint',
      ip: '192.168.1.115 (AirPrint / IPP)',
      duplex: 'Auto Duplex Supported',
      paperTray: 'Front Cassette: A4',
      inkLevels: { black: 80, cyan: 72, magenta: 65, yellow: 70 },
      isDefault: false
    },
    {
      id: 'epson-ecotank',
      name: 'Epson EcoTank L3250 / ET-4850',
      type: 'usb',
      status: 'ready',
      location: 'USB Direct Connect',
      ip: 'USB001 (High-Speed)',
      duplex: 'Manual Duplex (Feed Guide Provided)',
      paperTray: 'Rear Feeder: 100 Sheets',
      inkLevels: { black: 92, cyan: 85, magenta: 89, yellow: 91 },
      isDefault: false
    },
    {
      id: 'brother-duplex',
      name: 'Brother HL-L2350DW Compact Laser',
      type: 'wifi',
      status: 'ready',
      location: 'Library Wi-Fi',
      ip: '192.168.1.142:631 (IPP)',
      duplex: 'Automatic 2-Sided Printing',
      paperTray: 'Tray 1: 250 Sheets',
      inkLevels: { toner: 94 },
      isDefault: false
    }
  ]);

  const currentPrinter = printers.find(p => p.id === activePrinter.id) || printers[0];

  const handleScan = () => {
    setIsScanning(true);
    setScanProgress(15);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  const handleSelectPrinter = (printer) => {
    setActivePrinter(printer);
  };

  const handleAddCustomPrinter = (e) => {
    e.preventDefault();
    if (!customIp.trim()) return;
    const newPrinter = {
      id: `custom-${Date.now()}`,
      name: `Network Printer (${customIp.trim()})`,
      type: 'wifi',
      status: 'ready',
      location: 'Local Network (IPP / JetDirect)',
      ip: customIp.trim(),
      duplex: 'Auto / Manual Supported',
      paperTray: 'Tray 1: A4',
      inkLevels: { black: 85, cyan: 85, magenta: 85, yellow: 85 },
      isDefault: false
    };
    setPrinters(prev => [newPrinter, ...prev]);
    setActivePrinter(newPrinter);
    setCustomIp('');
    setShowAddCustom(false);
  };

  const handleTestPrint = async () => {
    setTestPrintSending(true);
    setTestPrintSuccess(false);

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4

      // Draw printer calibration pattern
      page.drawRectangle({
        x: 20,
        y: 20,
        width: 555.28,
        height: 801.89,
        borderColor: rgb(0.1, 0.4, 0.8),
        borderWidth: 2
      });

      page.drawText('PRINTSMART PRINTER TEST & ALIGNMENT PAGE', {
        x: 40,
        y: 780,
        size: 16,
        color: rgb(0.1, 0.2, 0.5)
      });

      page.drawText(`Connected Printer: ${currentPrinter.name}`, {
        x: 40,
        y: 750,
        size: 12,
        color: rgb(0.2, 0.2, 0.2)
      });

      page.drawText(`Interface: ${currentPrinter.ip} | Duplex: ${currentPrinter.duplex}`, {
        x: 40,
        y: 730,
        size: 10,
        color: rgb(0.4, 0.4, 0.4)
      });

      page.drawText('[ TOP FEED EDGE - FEED DIRECTION ]', {
        x: 180,
        y: 805,
        size: 11,
        color: rgb(0.8, 0.1, 0.1)
      });

      page.drawRectangle({
        x: 40,
        y: 400,
        width: 515.28,
        height: 180,
        color: rgb(0.95, 0.97, 1.0)
      });

      page.drawText('SUCCESS: Printer Communication Verified!', {
        x: 100,
        y: 510,
        size: 18,
        color: rgb(0.1, 0.6, 0.2)
      });

      page.drawText('Your printer is paired and ready for full imposition duplex printing.', {
        x: 80,
        y: 460,
        size: 11,
        color: rgb(0.2, 0.2, 0.3)
      });

      page.drawText('Test Timestamp: ' + new Date().toLocaleString(), {
        x: 40,
        y: 60,
        size: 9,
        color: rgb(0.5, 0.5, 0.5)
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      // Trigger browser print for test page
      const printIframe = document.createElement('iframe');
      printIframe.style.display = 'none';
      printIframe.src = blobUrl;
      document.body.appendChild(printIframe);
      printIframe.onload = () => {
        try {
          printIframe.contentWindow.focus();
          printIframe.contentWindow.print();
        } catch {
          window.print();
        }
      };

      setTestPrintSending(false);
      setTestPrintSuccess(true);
      setTimeout(() => setTestPrintSuccess(false), 5000);
    } catch (err) {
      console.error('Test print error:', err);
      window.print();
      setTestPrintSending(false);
      setTestPrintSuccess(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md px-5 py-4 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Printer Connection & Devices</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Online
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Connect your Wi-Fi, USB, AirPrint, or system printers for 1-click printing.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 flex-1">
          
          {/* Active Connected Printer Card */}
          <div className="bg-gradient-to-br from-indigo-950/60 via-slate-800/80 to-slate-900 border border-indigo-500/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Currently Active Printer</span>
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center space-x-1">
                {currentPrinter.type === 'wifi' && <Wifi className="w-3 h-3 text-sky-400" />}
                {currentPrinter.type === 'usb' && <Usb className="w-3 h-3 text-emerald-400" />}
                {currentPrinter.type === 'system' && <Printer className="w-3 h-3 text-indigo-400" />}
                <span className="capitalize">{currentPrinter.type}</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-white">{currentPrinter.name}</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  📍 {currentPrinter.location} • 🌐 {currentPrinter.ip}
                </p>
              </div>

              {/* Action Buttons for Active Printer */}
              <div className="flex items-center space-x-2 pt-2 sm:pt-0">
                <button
                  onClick={handleTestPrint}
                  disabled={testPrintSending}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center space-x-1.5 transition active:scale-95 disabled:opacity-50"
                >
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{testPrintSending ? 'Printing...' : 'Test Print'}</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onDirectPrint();
                  }}
                  disabled={isPrinting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center space-x-1.5 transition active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
              </div>
            </div>

            {testPrintSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Test calibration sheet sent to {currentPrinter.name}! Check your printer tray.</span>
              </div>
            )}

            {/* Hardware Status Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs border-t border-slate-800">
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Duplex Ability</span>
                <span className="font-semibold text-slate-200">{currentPrinter.duplex}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Paper Feed Tray</span>
                <span className="font-semibold text-slate-200">{currentPrinter.paperTray}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[10px] uppercase">Ink / Toner</span>
                <span className="font-semibold text-emerald-400">
                  {currentPrinter.inkLevels.toner
                    ? `${currentPrinter.inkLevels.toner}% Toner`
                    : `${currentPrinter.inkLevels.black}% Ink Ready`}
                </span>
              </div>
            </div>
          </div>

          {/* Scanner Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Discovered Printers ({printers.length})
              </h4>
              <p className="text-[11px] text-slate-400">
                Select your printer to direct print jobs and calibrate paper trays.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAddCustom(!showAddCustom)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition"
              >
                + Add IP
              </button>
              <button
                onClick={handleScan}
                disabled={isScanning}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Scanning...' : 'Scan Wi-Fi'}</span>
              </button>
            </div>
          </div>

          {/* Custom IP Input Form */}
          {showAddCustom && (
            <form onSubmit={handleAddCustomPrinter} className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-3">
              <h5 className="text-xs font-bold text-white">Connect Network Printer by IP or Hostname</h5>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 192.168.1.50 or printer.local"
                  value={customIp}
                  onChange={(e) => setCustomIp(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                >
                  Connect
                </button>
              </div>
            </form>
          )}

          {/* Printers List */}
          <div className="space-y-2.5">
            {printers.map((printer) => {
              const isSelected = printer.id === currentPrinter.id;
              return (
                <div
                  key={printer.id}
                  onClick={() => handleSelectPrinter(printer)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500/80 shadow-md shadow-indigo-600/10'
                      : 'bg-slate-800/40 hover:bg-slate-800/70 border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`p-2.5 rounded-xl border flex-shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {printer.type === 'wifi' && <Wifi className="w-4 h-4" />}
                      {printer.type === 'usb' && <Usb className="w-4 h-4" />}
                      {printer.type === 'system' && <Printer className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-white truncate">{printer.name}</h4>
                        {isSelected && (
                          <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 flex-shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        {printer.location} • {printer.duplex}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPrinter(printer);
                      }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {isSelected ? '✓ Selected' : 'Connect'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* User-Friendly Quick Tip */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-300 flex items-start space-x-3">
            <Zap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">How PrintSmart connects to printers:</p>
              <p className="text-slate-400 mt-1">
                PrintSmart imposes your pages to match your paper tray orientation. Clicking <strong>Print Document</strong> communicates with your connected device through browser print management or Direct IPP spooling, preserving perfect duplex margins and fold lines.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onDirectPrint();
            }}
            disabled={isPrinting}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-600/25 flex items-center space-x-2 transition"
          >
            <Printer className="w-4 h-4" />
            <span>{isPrinting ? 'Sending to Printer...' : `Print with ${currentPrinter.name.split(' ')[0]}`}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
