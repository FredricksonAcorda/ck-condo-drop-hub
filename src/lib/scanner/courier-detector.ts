export interface DetectedCourier {
  name: string;
  code: string;
  color: string;
  confidence: "HIGH" | "MEDIUM" | "UNKNOWN";
  icon?: string;
}

export function detectCourierFromBarcode(rawCode: string): DetectedCourier {
  const code = rawCode.trim().toUpperCase();

  // SPX Express / Shopee Xpress: usually begins with SPX, PH, SPE, or SPXPH
  if (/^SPX/i.test(code) || /^SPE/i.test(code) || /^PH\d{10,}/i.test(code)) {
    return {
      name: "SPX Express",
      code: "SPX",
      color: "#EE4D2D",
      confidence: "HIGH",
    };
  }

  // J&T Express: usually begins with JT, JNT, or 10-12 digit starting with 7, 8, 9
  if (/^JT/i.test(code) || /^JNT/i.test(code) || /^7\d{11}$/.test(code) || /^9\d{11}$/.test(code)) {
    return {
      name: "J&T Express",
      code: "JT",
      color: "#D21F1F",
      confidence: "HIGH",
    };
  }

  // Flash Express: usually begins with FL, TH, or starts with 00/01 followed by 10-12 digits
  if (/^FL/i.test(code) || /^TH\d{10,}/i.test(code) || /^FLASH/i.test(code)) {
    return {
      name: "Flash Express",
      code: "FLASH",
      color: "#FFB800",
      confidence: "HIGH",
    };
  }

  // LBC Express: usually begins with 1000-, LBC, or 12 digits starting with 1
  if (/^LBC/i.test(code) || /^1\d{11}$/.test(code) || /^1000\d{8}/.test(code)) {
    return {
      name: "LBC Express",
      code: "LBC",
      color: "#E31837",
      confidence: "HIGH",
    };
  }

  // Ninja Van: usually begins with NVD, NV, or SHPV
  if (/^NV/i.test(code) || /^SHPV/i.test(code) || /^NINJA/i.test(code)) {
    return {
      name: "Ninja Van",
      code: "NINJA",
      color: "#C10015",
      confidence: "HIGH",
    };
  }

  // DHL Express: 10 numeric digits
  if (/^DHL/i.test(code) || /^\d{10}$/.test(code)) {
    return {
      name: "DHL Express",
      code: "DHL",
      color: "#D40511",
      confidence: "MEDIUM",
    };
  }

  // Fallback default
  return {
    name: "General Courier",
    code: "GEN",
    color: "#4B5563",
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
