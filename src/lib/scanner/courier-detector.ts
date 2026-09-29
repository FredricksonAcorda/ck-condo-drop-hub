export interface DetectedCourier {
  name: string;
  code: string;
  color: string;
  confidence: "HIGH" | "MEDIUM" | "UNKNOWN";
  icon?: string;
}

export function detectCourierFromBarcode(rawCode: string): DetectedCourier {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return {
      name: "Other Courier",
      code: "OTHER",
      color: "#6B7280",
      confidence: "UNKNOWN",
    };
  }

  // Normalize code by stripping spaces, hyphens, and underscores for robust barcode reading
  const cleanCode = code.replace(/[\s-_]/g, "");

  // 1. SPX Express (Shopee Xpress)
  // Prefixes: SPX, SPE, SPXPH, SPEPH, or PH followed by digits
  if (/^SPX/i.test(cleanCode) || /^SPE/i.test(cleanCode) || /^PH\d{6,}/i.test(cleanCode)) {
    return {
      name: "SPX Express",
      code: "SPX",
      color: "#EE4D2D",
      confidence: "HIGH",
    };
  }

  // 2. YTO Express
  // Patterns: Always starts with '200' (e.g., 2008077343558422, 200807758482509, 200807751202876),
  // or classic prefixes YT, YTO, DD, or digits starting with 88 or 80
  if (
    /^200\d{5,}/.test(cleanCode) ||
    /^YT/i.test(cleanCode) ||
    /^YTO/i.test(cleanCode) ||
    /^DD\d{6,}/i.test(cleanCode) ||
    /^(88|80)\d{10,16}$/.test(cleanCode)
  ) {
    return {
      name: "YTO Express",
      code: "YTO",
      color: "#592780",
      confidence: "HIGH",
    };
  }

  // 3. STO Express
  // Patterns: Always starts with 'S18' (e.g., S18910007351573),
  // or classic prefixes STO, ST followed by digits, or digits starting with 77 or 55
  if (
    /^S18/i.test(cleanCode) ||
    /^STO/i.test(cleanCode) ||
    /^ST\d{6,}/i.test(cleanCode) ||
    /^(77|55)\d{10,14}$/.test(cleanCode)
  ) {
    return {
      name: "STO Express",
      code: "STO",
      color: "#FF6600",
      confidence: "HIGH",
    };
  }

  // 4. Flash Express
  // Prefixes: FL, FLASH, TH, KEX, or digits starting with 00 or 01
  if (
    /^FL/i.test(cleanCode) ||
    /^TH\d{6,}/i.test(cleanCode) ||
    /^FLASH/i.test(cleanCode) ||
    /^KEX/i.test(cleanCode) ||
    /^(00|01)\d{10,14}$/.test(cleanCode)
  ) {
    return {
      name: "Flash Express",
      code: "FLASH",
      color: "#FFB800",
      confidence: "HIGH",
    };
  }

  // 5. LBC Express
  // Prefixes: LBC, 1000-, or 12 digits starting with 1
  if (/^LBC/i.test(cleanCode) || /^1000\d{6,}/.test(cleanCode) || /^1\d{11}$/.test(cleanCode)) {
    return {
      name: "LBC Express",
      code: "LBC",
      color: "#E31837",
      confidence: "HIGH",
    };
  }

  // 6. J&T Express (JNT)
  // Prefixes: JT, JNT, J&T, or numeric waybills (10-14 digits starting with 7, 8, 9, 5, 6, 3, etc.)
  // Explicitly excludes waybills starting with 200 (reserved for YTO) or S18 (reserved for STO)
  if (
    /^JT/i.test(cleanCode) ||
    /^JNT/i.test(cleanCode) ||
    /^J&T/i.test(cleanCode) ||
    (/^(7|8|9|5|6|3)\d{9,13}$/.test(cleanCode) && !/^200/.test(cleanCode)) ||
    (/^\d{10,14}$/.test(cleanCode) && !/^200/.test(cleanCode))
  ) {
    return {
      name: "J&T Express",
      code: "JNT",
      color: "#D21F1F",
      confidence: "HIGH",
    };
  }

  // 7. Fallback: Other Courier (for appliances, SM, unlisted delivery brands)
  return {
    name: "Other Courier",
    code: "OTHER",
    color: "#6B7280",
    confidence: "UNKNOWN",
  };
}

/**
 * Normalizes scanned data from 1D Barcodes and 2D QR Codes.
 * If the QR code contains an HTTPS tracking URL or JSON payload,
 * it extracts the pure courier tracking code.
 */
export function extractTrackingFromQrOrBarcode(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  // 1. If scanned as a URL (common in courier shipping label QR codes)
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const queryParams = [
        "id",
        "tracking",
        "track",
        "trackingNumber",
        "billcode",
        "bill",
        "bills",
        "code",
        "no",
        "awb",
        "waybill",
      ];
      for (const param of queryParams) {
        const val = url.searchParams.get(param);
        if (val && val.length >= 4) return val.trim().toUpperCase();
      }
      const segments = url.pathname.split("/").filter(Boolean);
      if (segments.length > 0) {
        const last = segments[segments.length - 1];
        if (last && last.length >= 4 && !/\.(html|php|aspx|jsp)$/i.test(last)) {
          return last.trim().toUpperCase();
        }
      }
    } catch {
      // Fallback if URL constructor fails
    }
  }

  // 2. If scanned as JSON
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      const keys = ["tracking", "trackingNumber", "code", "awb", "billCode", "parcelId", "waybill"];
      for (const k of keys) {
        if (parsed[k] && typeof parsed[k] === "string") {
          return (parsed[k] as string).trim().toUpperCase();
        }
      }
    } catch {
      // Fallback
    }
  }

  return trimmed.toUpperCase();
}
