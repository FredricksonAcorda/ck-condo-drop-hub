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

  // 1. SPX Express (Shopee Xpress)
  // Prefixes: SPX, SPE, SPXPH, SPEPH, or PH followed by digits
  if (/^SPX/i.test(code) || /^SPE/i.test(code) || /^PH\d{6,}/i.test(code)) {
    return {
      name: "SPX Express",
      code: "SPX",
      color: "#EE4D2D",
      confidence: "HIGH",
    };
  }

  // 2. YTO Express
  // Prefixes: YT, YTO, DD, or digits starting with 88 or 80 (common YTO waybills)
  if (/^YT/i.test(code) || /^YTO/i.test(code) || /^DD\d{6,}/i.test(code) || /^(88|80)\d{10,16}$/.test(code)) {
    return {
      name: "YTO Express",
      code: "YTO",
      color: "#592780",
      confidence: "HIGH",
    };
  }

  // 3. STO Express
  // Prefixes: STO, ST, or digits starting with 77 or 55 (common STO waybills)
  if (/^STO/i.test(code) || /^(77|55)\d{10,14}$/.test(code)) {
    return {
      name: "STO Express",
      code: "STO",
      color: "#FF6600",
      confidence: "HIGH",
    };
  }

  // 4. Flash Express
  // Prefixes: FL, FLASH, TH, KEX, or digits starting with 00 or 01
  if (/^FL/i.test(code) || /^TH\d{6,}/i.test(code) || /^FLASH/i.test(code) || /^KEX/i.test(code) || /^(00|01)\d{10,14}$/.test(code)) {
    return {
      name: "Flash Express",
      code: "FLASH",
      color: "#FFB800",
      confidence: "HIGH",
    };
  }

  // 5. LBC Express
  // Prefixes: LBC, 1000-, or 12 digits starting with 1
  if (/^LBC/i.test(code) || /^1000\d{6,}/.test(code) || /^1\d{11}$/.test(code)) {
    return {
      name: "LBC Express",
      code: "LBC",
      color: "#E31837",
      confidence: "HIGH",
    };
  }

  // 6. J&T Express (JNT)
  // Prefixes: JT, JNT, J&T, or numeric waybills (10-14 digits, typically starting with 7, 8, 9, 5, 6, 3, etc.)
  // This prevents JNT from incorrectly detecting as DHL or failing if not starting with JT0.
  if (
    /^JT/i.test(code) ||
    /^JNT/i.test(code) ||
    /^J&T/i.test(code) ||
    /^(7|8|9|5|6|3)\d{9,13}$/.test(code) ||
    /^\d{10,12}$/.test(code)
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
