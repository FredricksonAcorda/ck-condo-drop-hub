"use client";

import Link from "next/link";
import { useState } from "react";

export default function ScannerPage() {
  const [scannerMode, setScannerMode] = useState<"camera" | "usb" | "manual">("camera");
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [detectedCourier, setDetectedCourier] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [beepSound, setBeepSound] = useState(true);

  const simulateScan = (barcode: string, courierName: string) => {
    setLastScanned(barcode);
    setDetectedCourier(courierName);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-brand-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📷</span>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black uppercase tracking-wide">
              BARCODE & QR <span className="text-brand-red">SCANNER</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-brand-text-secondary mt-0.5">
            Rapid intake terminal with multi-mode scanning: Webcam, USB Hardware Scanner, or Manual Input.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBeepSound(!beepSound)}
            className={`btn btn-sm text-xs flex items-center gap-1.5 ${
              beepSound ? "btn-outline border-green-600 text-green-700" : "btn-outline text-brand-text-muted"
            }`}
          >
            {beepSound ? "🔔 Beep On Scan" : "🔕 Muted"}
          </button>
          <Link href="/admin" className="btn btn-outline btn-sm">
            ← Back to Admin
          </Link>
        </div>
      </div>

      {/* Mode Chooser Tabs */}
      <div className="flex bg-white rounded-xl border border-brand-border p-1.5 gap-1.5 shadow-sm">
        {[
          { id: "camera", label: "Camera Viewfinder", icon: "📷" },
          { id: "usb", label: "USB Barcode Gun", icon: "🔫" },
          { id: "manual", label: "Manual Keypad", icon: "⌨️" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setScannerMode(tab.id as typeof scannerMode)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
              scannerMode === tab.id
                ? "bg-brand-red text-white shadow"
                : "text-brand-text-secondary hover:text-brand-black hover:bg-brand-surface"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Camera Viewfinder Mode */}
      {scannerMode === "camera" && (
        <div className="bg-brand-black text-white rounded-2xl p-6 relative overflow-hidden shadow-xl border border-white/10">
          <div className="max-w-md mx-auto aspect-video bg-brand-dark rounded-xl relative border-2 border-brand-red/50 flex flex-col items-center justify-center overflow-hidden">
            {/* Viewfinder Target Reticle */}
            <div className="absolute inset-8 border border-white/20 rounded-lg pointer-events-none flex flex-col justify-between p-2">
              <div className="flex justify-between">
                <span className="w-5 h-5 border-t-2 border-l-2 border-brand-red" />
                <span className="w-5 h-5 border-t-2 border-r-2 border-brand-red" />
              </div>
              {/* Laser Line Scanning Effect */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-brand-red to-transparent animate-pulse" />
              <div className="flex justify-between">
                <span className="w-5 h-5 border-b-2 border-l-2 border-brand-red" />
                <span className="w-5 h-5 border-b-2 border-r-2 border-brand-red" />
              </div>
            </div>

            <div className="text-center p-4 z-10">
              <span className="text-2xl mb-1 block">📦</span>
              <p className="text-xs text-white/70">
                Point camera at courier shipping label or barcode
              </p>
            </div>
          </div>

          {/* Quick Simulation Trigger Buttons */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-white/60">Simulate Test Scans:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => simulateScan("SPX-PH-2026-9921", "SPX Express")}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-xs font-semibold"
              >
                Scan SPX Label
              </button>
              <button
                onClick={() => simulateScan("JT-PH-5510928", "J&T Express")}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-xs font-semibold"
              >
                Scan J&T Label
              </button>
              <button
                onClick={() => simulateScan("FL-2026-88192", "Flash Express")}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-xs font-semibold"
              >
                Scan Flash Label
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USB Barcode Gun Mode */}
      {scannerMode === "usb" && (
        <div className="bg-white p-8 rounded-2xl border border-brand-border text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto">
            🔫
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-heading)] text-2xl uppercase text-brand-black">
              USB SCANNER READY
            </h3>
            <p className="text-xs text-brand-text-secondary max-w-md mx-auto mt-1">
              Standard HID keyboard wedge mode enabled. Pull the trigger on your handheld laser scanner — incoming keystrokes are automatically intercepted.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-brand-surface p-4 rounded-xl border border-brand-border">
            <span className="text-xs text-brand-text-muted block mb-1">Keystroke Buffer Active</span>
            <input
              type="text"
              placeholder="Awaiting hardware scanner input..."
              autoFocus
              className="input text-center font-mono text-base tracking-widest uppercase bg-white"
              onChange={(e) => {
                if (e.target.value.length > 8) {
                  simulateScan(e.target.value.toUpperCase(), "Auto-Detected Courier");
                  e.target.value = "";
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Manual Keypad Mode */}
      {scannerMode === "manual" && (
        <div className="bg-white p-8 rounded-2xl border border-brand-border space-y-4 shadow-sm max-w-lg mx-auto">
          <div className="text-center">
            <h3 className="font-[family-name:var(--font-heading)] text-2xl uppercase text-brand-black">
              MANUAL TRACKING INPUT
            </h3>
            <p className="text-xs text-brand-text-secondary mt-1">
              Type tracking code if the printed barcode label is smudged or torn.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualCode) simulateScan(manualCode.toUpperCase(), "Manual Input");
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold uppercase text-brand-text mb-1">
                Tracking Number
              </label>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. SPX-PH-12345678"
                className="input font-mono uppercase"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full">
              PROCESS TRACKING NUMBER
            </button>
          </form>
        </div>
      )}

      {/* Scanned Result Card */}
      {lastScanned && (
        <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-6 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="bg-green-700 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              ✓ BARCODE DETECTED
            </span>
            <span className="text-xs text-green-800 font-bold">{detectedCourier}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-green-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-[10px] text-brand-text-muted uppercase font-bold tracking-wider">
                SCANNED TRACKING IDENTIFIER
              </span>
              <div className="font-mono text-2xl font-black text-brand-black tracking-wider mt-0.5">
                {lastScanned}
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/admin?tracking=${encodeURIComponent(lastScanned)}&courier=${encodeURIComponent(detectedCourier || "SPX Express")}`}
                className="btn btn-primary btn-sm whitespace-nowrap"
              >
                Log In Intake Form →
              </Link>
              <button
                onClick={() => setLastScanned(null)}
                className="btn btn-outline btn-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
