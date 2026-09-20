import { Parcel } from "@/types";

export interface PrintLabelOptions {
  parcel: Parcel;
  hubName?: string;
  station?: string;
}

export function generateShelfLabelHtml(options: PrintLabelOptions): string {
  const { parcel, hubName = "CK CONDO DROP HUB", station = "Station 1 Front Desk" } = options;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Shelf Label - ${parcel.trackingNumber}</title>
  <style>
    @page {
      size: 58mm 40mm;
      margin: 0;
    }
    body {
      margin: 0;
      padding: 6px 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #000;
      background: #fff;
      font-size: 10px;
      line-height: 1.2;
    }
    .header {
      border-bottom: 1.5px solid #000;
      padding-bottom: 3px;
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .hub-title {
      font-weight: 900;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .shelf-badge {
      font-size: 13px;
      font-weight: 900;
      background: #000;
      color: #fff;
      padding: 2px 6px;
      border-radius: 3px;
      text-transform: uppercase;
    }
    .recipient-block {
      margin-bottom: 4px;
    }
    .unit-text {
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0.5px;
    }
    .name-text {
      font-size: 11px;
      font-weight: bold;
      color: #222;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      font-size: 8.5px;
      color: #333;
      margin-bottom: 4px;
    }
    .tracking-block {
      border-top: 1px dashed #444;
      padding-top: 4px;
      text-align: center;
    }
    .tracking-num {
      font-family: monospace;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 1px;
    }
    .claim-code {
      font-size: 9px;
      font-weight: bold;
      color: #444;
    }
    .footer {
      font-size: 7px;
      text-align: center;
      color: #666;
      margin-top: 2px;
    }
    @media print {
      body {
        width: 58mm;
        height: 40mm;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="hub-title">${hubName}</div>
    <div class="shelf-badge">${parcel.shelf}</div>
  </div>

  <div class="recipient-block">
    <div class="unit-text">${parcel.unit.toUpperCase()}</div>
    <div class="name-text">${parcel.residentName}</div>
  </div>

  <div class="meta-row">
    <div><strong>COURIER:</strong> ${parcel.courier}</div>
    <div><strong>SIZE:</strong> ${parcel.size || "Standard"}</div>
  </div>

  <div class="meta-row">
    <div><strong>ARRIVED:</strong> ${parcel.dateArrived.split("•")[0] || parcel.dateArrived}</div>
    <div><strong>DEADLINE:</strong> ${parcel.deadline}</div>
  </div>

  <div class="tracking-block">
    <div class="tracking-num">${parcel.trackingNumber}</div>
    <div class="claim-code">CLAIM PASS: <strong>${parcel.claimCode}</strong></div>
  </div>

  <div class="footer">
    ${station} • Please present Claim QR or Passcode at pickup
  </div>

  <script>
    window.onload = function() {
      window.print();
      setTimeout(function() { window.close(); }, 500);
    };
  </script>
</body>
</html>
  `.trim();
}

export function generateReleaseSlipHtml(options: {
  parcel: Parcel;
  releasedByStaff: string;
  hubName?: string;
}): string {
  const { parcel, releasedByStaff, hubName = "CK CONDO DROP HUB" } = options;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Release Slip - ${parcel.trackingNumber}</title>
  <style>
    @page {
      size: 80mm 100mm;
      margin: 4mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 8px;
      color: #000;
      font-size: 11px;
      line-height: 1.3;
    }
    .center { text-align: center; }
    .hub-name { font-size: 13px; font-weight: 900; letter-spacing: 0.5px; }
    .title { font-size: 11px; font-weight: bold; margin: 2px 0 6px 0; }
    .divider { border-bottom: 1px dashed #000; margin: 6px 0; }
    .row { display: flex; justify-content: space-between; margin: 3px 0; }
    .bold { font-weight: bold; }
    .big-value { font-size: 13px; font-weight: 900; }
    .sign-box {
      margin-top: 18px;
      border-top: 1px solid #000;
      padding-top: 4px;
      text-align: center;
      font-size: 9px;
    }
    .footer { font-size: 8px; color: #555; text-align: center; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="center">
    <div class="hub-name">${hubName}</div>
    <div class="title">OFFICIAL PARCEL RELEASE RECEIPT</div>
    <div>Buildersville Condominium • Station 1</div>
  </div>

  <div class="divider"></div>

  <div class="row">
    <span>Date & Time:</span>
    <span class="bold">${parcel.claimedAt || new Date().toLocaleString()}</span>
  </div>
  <div class="row">
    <span>Tracking Number:</span>
    <span class="bold font-mono">${parcel.trackingNumber}</span>
  </div>
  <div class="row">
    <span>Courier Partner:</span>
    <span class="bold">${parcel.courier}</span>
  </div>
  <div class="row">
    <span>Package Size:</span>
    <span>${parcel.size || "Standard"}</span>
  </div>

  <div class="divider"></div>

  <div class="row">
    <span>Recipient Unit:</span>
    <span class="big-value">${parcel.unit}</span>
  </div>
  <div class="row">
    <span>Resident Name:</span>
    <span class="bold">${parcel.residentName}</span>
  </div>
  <div class="row">
    <span>Claimed By:</span>
    <span class="bold">${parcel.claimedBy || "Authorized Recipient"}</span>
  </div>
  <div class="row">
    <span>Storage Fee:</span>
    <span class="bold">${parcel.holdingFee}</span>
  </div>
  <div class="row">
    <span>Staff Officer:</span>
    <span>${releasedByStaff}</span>
  </div>

  <div class="sign-box">
    Recipient / Proxy Signature Above
  </div>

  <div class="footer">
    Thank you for trusting CK Condo Drop Hub.<br>
    Questions? Visit the front desk or call building management.
  </div>

  <script>
    window.onload = function() {
      window.print();
      setTimeout(function() { window.close(); }, 500);
    };
  </script>
</body>
</html>
  `.trim();
}

export function printThermalShelfLabel(options: PrintLabelOptions): void {
  if (typeof window === "undefined") return;
  const printWindow = window.open("", "_blank", "width=400,height=300");
  if (!printWindow) {
    alert("Please allow popups to print shelf labels.");
    return;
  }
  printWindow.document.write(generateShelfLabelHtml(options));
  printWindow.document.close();
}

export function printClaimReleaseSlip(options: {
  parcel: Parcel;
  releasedByStaff: string;
  hubName?: string;
}): void {
  if (typeof window === "undefined") return;
  const printWindow = window.open("", "_blank", "width=450,height=500");
  if (!printWindow) {
    alert("Please allow popups to print release slips.");
    return;
  }
  printWindow.document.write(generateReleaseSlipHtml(options));
  printWindow.document.close();
}
