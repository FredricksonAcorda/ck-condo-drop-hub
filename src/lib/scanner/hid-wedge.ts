"use client";

import { useEffect, useRef } from "react";

export interface BarcodeWedgeOptions {
  onScan: (scannedText: string) => void;
  minChars?: number;
  maxKeystrokeIntervalMs?: number;
  enabled?: boolean;
}

/**
 * Hook to listen for rapid keyboard input characteristic of USB / Bluetooth
 * hardware barcode scanners in HID keyboard-wedge mode.
 */
export function useBarcodeWedge({
  onScan,
  minChars = 4,
  maxKeystrokeIntervalMs = 60,
  enabled = true,
}: BarcodeWedgeOptions) {
  const bufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is intentionally typing in regular input/textarea
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isTypingInInput = activeTag === "input" || activeTag === "textarea" || activeTag === "select";

      const now = performance.now();
      const interval = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Enter key indicates end of barcode string
      if (e.key === "Enter" || e.key === "Tab") {
        if (bufferRef.current.length >= minChars) {
          e.preventDefault();
          const code = bufferRef.current.trim();
          bufferRef.current = "";
          onScanRef.current(code);
        } else {
          bufferRef.current = "";
        }
        return;
      }

      // Single printable character
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // If interval is too long and user was typing in an input, reset buffer
        if (interval > maxKeystrokeIntervalMs && bufferRef.current.length > 0) {
          bufferRef.current = "";
        }

        // If not typing in input, or if keystrokes are coming in ultra fast (<60ms), accumulate
        if (!isTypingInInput || interval <= maxKeystrokeIntervalMs) {
          bufferRef.current += e.key;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [enabled, minChars, maxKeystrokeIntervalMs]);
}
