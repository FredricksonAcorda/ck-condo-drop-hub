"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParcels, useAuth } from "@/context";
import { Parcel } from "@/types";
import { detectCourierFromBarcode } from "@/lib/scanner/courier-detector";
import { scannerAudio } from "@/lib/scanner/audio-feedback";
import { useBarcodeWedge } from "@/lib/scanner/hid-wedge";
import { printClaimReleaseSlip } from "@/lib/print/label-generator";

type TerminalMode = "COURIER_INTAKE" | "RESIDENT_CLAIM";
type InputSource = "camera" | "usb" | "manual";

export default function ScannerStationPage() {
  const { parcels, releaseParcel, verifyClaimCode, hubSettings } = useParcels();
  const { user } = useAuth();

  // Mode & Input controls
  const [terminalMode, setTerminalMode] = useState<TerminalMode>("COURIER_INTAKE");
  const [inputSource, setInputSource] = useState<InputSource>("camera");
  const [soundMuted, setSoundMuted] = useState<boolean>(!hubSettings.soundEnabled);

  // Camera video stream
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Manual input state
  const [manualInput, setManualInput] = useState<string>("");

  // Scan match state
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [matchedParcel, setMatchedParcel] = useState<Parcel | null>(null);
  const [residentActiveParcels, setResidentActiveParcels] = useState<Parcel[]>([]);
  const [scanStatus, setScanStatus] = useState<"IDLE" | "SUCCESS" | "NOT_FOUND">("IDLE");
  const [releasedAlert, setReleasedAlert] = useState<string | null>(null);

  // Scan log history
  const [scanHistory, setScanHistory] = useState<Array<{ code: string; type: string; time: string }>>([]);

  // Sync mute with scanner audio
  useEffect(() => {
    scannerAudio.setSoundEnabled(!soundMuted);
  }, [soundMuted]);

  // Handle barcode processing
  const handleBarcodeProcess = useCallback(
    async (code: string) => {
      const clean = code.trim().toUpperCase();
      if (!clean) return;

      setLastScannedCode(clean);
      setScanHistory((prev) => [
        {
          code: clean,
          type: terminalMode === "COURIER_INTAKE" ? "Courier Label" : "Resident Claim",
          time: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 7),
      ]);

      if (terminalMode === "COURIER_INTAKE") {
        scannerAudio.playScanSuccess();
        setScanStatus("SUCCESS");
      } else {
        // RESIDENT_CLAIM mode: Check if code is a claim code (e.g. CK-8921) or resident code (e.g. CK-000123)
        const matched = await verifyClaimCode(clean);
        if (matched) {
          scannerAudio.playScanSuccess();
          setMatchedParcel(matched);
          setResidentActiveParcels([matched]);
          setScanStatus("SUCCESS");
        } else {
          // Check if it matches a resident's overall parcels (by resident code or unit)
          const matchingByResident = parcels.filter(
            (p) =>
              (p.claimCode.toUpperCase() === clean ||
                p.trackingNumber.toUpperCase() === clean ||
                p.unit.toUpperCase().includes(clean)) &&
              p.status !== "PICKED_UP"
          );

          if (matchingByResident.length > 0) {
            scannerAudio.playScanSuccess();
            setMatchedParcel(matchingByResident[0]);
            setResidentActiveParcels(matchingByResident);
            setScanStatus("SUCCESS");
          } else {
            scannerAudio.playScanError();
            setMatchedParcel(null);
            setResidentActiveParcels([]);
            setScanStatus("NOT_FOUND");
          }
        }
      }
    },
    [terminalMode, verifyClaimCode, parcels]
  );

  // USB Barcode Wedge listener
  useBarcodeWedge({
    onScan: (barcode) => {
      handleBarcodeProcess(barcode);
    },
    enabled: true,
  });

  // Camera stream initializer
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported on this browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: unknown) {
      setCameraError(err instanceof Error ? err.message : "Could not access camera device.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Quick 1-click release handler
  const handleQuickRelease = async (parcelToRelease: Parcel) => {
    const staffName = user?.name || hubSettings.stationName || "Front Desk Officer";
    try {
      const updated = await releaseParcel(parcelToRelease.id, parcelToRelease.residentName);
      scannerAudio.playReleaseSuccess();
      setReleasedAlert(`✓ Released package ${updated.trackingNumber} to ${updated.residentName}!`);
      setMatchedParcel(null);
      setResidentActiveParcels((prev) => prev.filter((p) => p.id !== updated.id));
      if (residentActiveParcels.length <= 1) {
        setScanStatus("IDLE");
      }
    } catch (err) {
      console.error(err);
      scannerAudio.playScanError();
    }
  };

  // Detected courier for intake mode
  const detectedCourier = lastScannedCode ? detectCourierFromBarcode(lastScannedCode) : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">📷</span>
            <div>
              <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black uppercase tracking-wide">
                STATION <span className="text-brand-red">SCANNER</span> TERMINAL
              </h1>
              <p className="text-xs text-brand-text-secondary mt-0.5">
                Hardware-accelerated barcode and QR capture for Inbound Parcel Intake & Instant Resident Release.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSoundMuted(!soundMuted)}
            className={`btn btn-sm text-xs flex items-center gap-1.5 ${
              !soundMuted
                ? "bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                : "bg-gray-100 text-gray-600 border-gray-300"
            }`}
          >
            {!soundMuted ? "🔔 Audio Beep: ON" : "🔕 Audio: MUTED"}
          </button>
          <Link href="/admin/parcels" className="btn btn-outline btn-sm">
            📦 Inventory View
          </Link>
          <Link href="/admin" className="btn btn-primary btn-sm">
            ← Station Admin
          </Link>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-2 rounded-2xl border border-brand-border shadow-sm">
        <button
          type="button"
          onClick={() => {
            setTerminalMode("COURIER_INTAKE");
            setScanStatus("IDLE");
            setLastScannedCode(null);
          }}
          className={`flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${
            terminalMode === "COURIER_INTAKE"
              ? "bg-brand-red text-white shadow-md"
              : "text-brand-text-secondary hover:text-brand-black hover:bg-brand-surface"
          }`}
        >
          <span className="text-xl">🚚</span>
          <span>1. Inbound Courier Shipping Label</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTerminalMode("RESIDENT_CLAIM");
            setScanStatus("IDLE");
            setLastScannedCode(null);
          }}
          className={`flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${
            terminalMode === "RESIDENT_CLAIM"
              ? "bg-brand-black text-white shadow-md border-2 border-brand-red"
              : "text-brand-text-secondary hover:text-brand-black hover:bg-brand-surface"
          }`}
        >
          <span className="text-xl">📱</span>
          <span>2. Resident Claim QR & Passcode</span>
        </button>
      </div>

      {/* Released Alert Banner */}
      {releasedAlert && (
        <div className="bg-green-600 text-white p-4 rounded-xl font-bold flex items-center justify-between shadow-lg animate-in fade-in">
          <span>{releasedAlert}</span>
          <button
            onClick={() => setReleasedAlert(null)}
            className="text-white/80 hover:text-white text-xs uppercase px-2 py-1 bg-black/20 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Scanner Canvas & Input Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Viewfinder & Input Controls (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Sub-Tabs for Input Type */}
          <div className="flex bg-white rounded-xl border border-brand-border p-1 gap-1">
            {[
              { id: "camera", label: "Webcam Viewfinder", icon: "📹" },
              { id: "usb", label: "USB Barcode Gun (HID)", icon: "🔫" },
              { id: "manual", label: "Manual Keypad", icon: "⌨️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setInputSource(tab.id as InputSource)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  inputSource === tab.id
                    ? "bg-brand-dark text-white font-black shadow-sm"
                    : "text-brand-text-secondary hover:text-brand-black hover:bg-brand-surface"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* 1. Camera Viewfinder Screen */}
          {inputSource === "camera" && (
            <div className="bg-brand-black text-white rounded-2xl p-6 shadow-xl border border-white/10 space-y-4">
              <div className="relative max-w-lg mx-auto aspect-video bg-neutral-900 rounded-xl overflow-hidden border-2 border-white/20 flex flex-col items-center justify-center">
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <span className="text-4xl block">📹</span>
                    <p className="text-xs text-white/70 font-medium">
                      Camera viewfinder inactive. Click below to stream front-desk camera.
                    </p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="btn btn-primary btn-sm mt-2"
                    >
                      ▶ Start Camera Video Feed
                    </button>
                    {cameraError && (
                      <p className="text-[11px] text-red-400 mt-2">
                        {cameraError} (You can also use the Test Triggers below).
                      </p>
                    )}
                  </div>
                )}

                {/* Laser Reticle Overlay */}
                {cameraActive && (
                  <div className="absolute inset-6 border border-white/20 rounded-lg pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex justify-between">
                      <span className="w-6 h-6 border-t-2 border-l-2 border-brand-red" />
                      <span className="w-6 h-6 border-t-2 border-r-2 border-brand-red" />
                    </div>
                    {/* Animated Scanning Laser */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_#ff0000] animate-pulse" />
                    <div className="flex justify-between">
                      <span className="w-6 h-6 border-b-2 border-l-2 border-brand-red" />
                      <span className="w-6 h-6 border-b-2 border-r-2 border-brand-red" />
                    </div>
                  </div>
                )}
              </div>

              {cameraActive && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="btn btn-outline btn-sm text-white/80 border-white/20 hover:bg-white/10"
                  >
                    ⏹ Stop Camera
                  </button>
                </div>
              )}

              {/* Simulation Quick-Action Triggers */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                  <span>Fast Simulation Triggers:</span>
                  <span className="text-[10px] uppercase font-mono text-white/40">
                    Mode: {terminalMode}
                  </span>
                </div>

                {terminalMode === "COURIER_INTAKE" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleBarcodeProcess("SPX-PH-2026-9921")}
                      className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg text-xs font-semibold text-center border border-white/10"
                    >
                      <span className="block text-[10px] text-orange-400">SPX Express</span>
                      SPX-9921
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBarcodeProcess("JT-PH-5510928")}
                      className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg text-xs font-semibold text-center border border-white/10"
                    >
                      <span className="block text-[10px] text-red-400">J&T Express</span>
                      JT-5510
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBarcodeProcess("FL-2026-88192")}
                      className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg text-xs font-semibold text-center border border-white/10"
                    >
                      <span className="block text-[10px] text-yellow-400">Flash Express</span>
                      FL-8819
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBarcodeProcess("LBC-2026-77312")}
                      className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg text-xs font-semibold text-center border border-white/10"
                    >
                      <span className="block text-[10px] text-rose-400">LBC Express</span>
                      LBC-7731
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleBarcodeProcess("CK-8921")}
                      className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg text-xs font-semibold text-center border border-white/10"
                    >
                      <span className="block text-[10px] text-green-400">Juan (Unit 101)</span>
                      Pass: CK-8921
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBarcodeProcess("CK-0148")}
                      className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg text-xs font-semibold text-center border border-white/10"
                    >
                      <span className="block text-[10px] text-green-400">Juan (Unit 101)</span>
                      Pass: CK-0148
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBarcodeProcess("CK-3901")}
                      className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg text-xs font-semibold text-center border border-white/10"
                    >
                      <span className="block text-[10px] text-blue-400">Maria (Unit 304)</span>
                      Pass: CK-3901
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. USB Scanner Wedge Mode */}
          {inputSource === "usb" && (
            <div className="bg-white p-8 rounded-2xl border border-brand-border text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-inner">
                🔫
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-2xl uppercase text-brand-black">
                  HARDWARE USB SCANNER ENGAGED
                </h3>
                <p className="text-xs text-brand-text-secondary max-w-md mx-auto mt-1">
                  Global keyboard-wedge hook is actively listening. Point your physical laser scanner gun anywhere on this screen and pull the trigger!
                </p>
              </div>

              <div className="max-w-md mx-auto bg-brand-surface p-4 rounded-xl border border-brand-border text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted block mb-1">
                  Wedge Input Monitor
                </span>
                <input
                  type="text"
                  placeholder="Scan with USB gun or type here..."
                  className="input font-mono text-center tracking-widest text-base uppercase bg-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const target = e.target as HTMLInputElement;
                      handleBarcodeProcess(target.value);
                      target.value = "";
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* 3. Manual Keypad Mode */}
          {inputSource === "manual" && (
            <div className="bg-white p-8 rounded-2xl border border-brand-border space-y-4 shadow-sm max-w-md mx-auto">
              <div className="text-center">
                <h3 className="font-[family-name:var(--font-heading)] text-2xl uppercase text-brand-black">
                  KEYPAD ENTRY
                </h3>
                <p className="text-xs text-brand-text-secondary mt-1">
                  Enter tracking number or resident claim code manually.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualInput) {
                    handleBarcodeProcess(manualInput);
                    setManualInput("");
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold uppercase text-brand-text mb-1">
                    {terminalMode === "COURIER_INTAKE" ? "Tracking Number" : "Claim Code or Passcode"}
                  </label>
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder={terminalMode === "COURIER_INTAKE" ? "e.g. SPX-PH-2026-8921" : "e.g. CK-8921"}
                    className="input font-mono uppercase text-base"
                    required
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full">
                  SUBMIT IDENTIFIER →
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Scan Result & Next Steps Action Card */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted flex items-center justify-between">
              <span>ACTIVE SCAN INSPECTOR</span>
              {scanStatus === "SUCCESS" && (
                <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-[10px] font-bold">
                  ✓ VERIFIED
                </span>
              )}
            </h2>

            {lastScannedCode ? (
              <div className="space-y-4">
                <div className="bg-brand-surface p-4 rounded-xl border border-brand-border">
                  <span className="text-[10px] uppercase font-bold text-brand-text-secondary">
                    RAW SCANNED STRING
                  </span>
                  <div className="font-mono text-xl font-black text-brand-black mt-0.5 break-all">
                    {lastScannedCode}
                  </div>
                </div>

                {/* Intake Mode Response */}
                {terminalMode === "COURIER_INTAKE" && detectedCourier && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between p-3 bg-brand-surface rounded-xl border border-brand-border">
                      <span className="text-xs font-bold text-brand-text">Detected Courier:</span>
                      <span
                        className="text-xs font-black uppercase px-2.5 py-1 rounded text-white"
                        style={{ backgroundColor: detectedCourier.color }}
                      >
                        {detectedCourier.name}
                      </span>
                    </div>

                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-3">
                      <div className="text-xs text-orange-900 font-semibold">
                        Ready to log package into Station 1 shelf inventory.
                      </div>
                      <Link
                        href={`/admin?tracking=${encodeURIComponent(lastScannedCode)}&courier=${encodeURIComponent(detectedCourier.name)}`}
                        className="btn btn-primary w-full text-center"
                      >
                        Proceed to Intake Form →
                      </Link>
                    </div>
                  </div>
                )}

                {/* Resident Claim Mode Response */}
                {terminalMode === "RESIDENT_CLAIM" && (
                  <div className="space-y-3 animate-in fade-in">
                    {residentActiveParcels.length > 0 ? (
                      <div className="space-y-3">
                        <div className="text-xs font-bold text-green-700 bg-green-50 p-2.5 rounded-lg border border-green-200">
                          Found {residentActiveParcels.length} package(s) matching claim query!
                        </div>

                        {residentActiveParcels.map((p) => (
                          <div
                            key={p.id}
                            className="bg-brand-surface p-4 rounded-xl border border-brand-border space-y-3"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-[10px] font-bold text-brand-text-muted uppercase">
                                  {p.courier} • {p.size || "Standard"}
                                </span>
                                <div className="font-mono text-sm font-bold text-brand-black">
                                  {p.trackingNumber}
                                </div>
                                <div className="text-xs text-brand-text font-bold mt-1">
                                  {p.residentName} ({p.unit})
                                </div>
                              </div>
                              <span className="bg-brand-black text-white text-xs font-black px-2 py-1 rounded">
                                {p.shelf}
                              </span>
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-brand-border">
                              <button
                                type="button"
                                onClick={() => handleQuickRelease(p)}
                                className="btn btn-primary btn-sm flex-1"
                              >
                                ✓ Instant Release
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  printClaimReleaseSlip({
                                    parcel: p,
                                    releasedByStaff: user?.name || "Station 1 Staff",
                                    hubName: hubSettings.hubName,
                                  })
                                }
                                className="btn btn-outline btn-sm px-2.5"
                                title="Print Paper Slip"
                              >
                                🧾 Slip
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : scanStatus === "NOT_FOUND" ? (
                      <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-center space-y-2">
                        <span className="text-2xl">⚠️</span>
                        <div className="text-xs font-bold text-red-800">
                          No active package found for passcode &quot;{lastScannedCode}&quot;.
                        </div>
                        <p className="text-[11px] text-red-600">
                          The package may have already been claimed or the code is incorrect.
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-brand-text-muted space-y-2">
                <span className="text-3xl block">⏳</span>
                <p className="text-xs">
                  Awaiting scan. Use the camera, pull the trigger on a USB barcode gun, or click a simulation trigger.
                </p>
              </div>
            )}
          </div>

          {/* Recent Scan History Feed */}
          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">
              Recent Scans Stream
            </h3>
            {scanHistory.length === 0 ? (
              <p className="text-xs text-brand-text-muted italic">No scans recorded this session.</p>
            ) : (
              <div className="space-y-2">
                {scanHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-brand-surface border border-brand-border"
                  >
                    <div>
                      <span className="font-mono font-bold text-brand-black block">{item.code}</span>
                      <span className="text-[10px] text-brand-text-muted">{item.type}</span>
                    </div>
                    <span className="text-[10px] text-brand-text-secondary font-mono">{item.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
