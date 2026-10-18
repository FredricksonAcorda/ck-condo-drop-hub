const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const htmlPath = path.resolve(__dirname, "../docs/SERVICE_AND_MAINTENANCE_AGREEMENT.html");
const outDir = path.resolve(__dirname, "../output/pdf");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const pdfPath = path.resolve(outDir, "CK_Condo_Drop_Hub_Service_And_Maintenance_Agreement.pdf");

const chromePath = "C:\\Program Files\\Google\Chrome\\Application\\chrome.exe";
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const browserPath = fs.existsSync(chromePath) ? chromePath : edgePath;

console.log("Using browser:", browserPath);
console.log("Input HTML:", htmlPath);
console.log("Output PDF:", pdfPath);

const args = [
  "--headless=new",
  "--disable-gpu",
  "--no-pdf-header-footer",
  `--print-to-pdf=${pdfPath}`,
  `file:///${htmlPath.replace(/\\/g, "/")}`,
];

const res = spawnSync(browserPath, args, { stdio: "inherit" });

if (fs.existsSync(pdfPath)) {
  const stats = fs.statSync(pdfPath);
  console.log(`SUCCESS! Generated PDF (${stats.size} bytes) at: ${pdfPath}`);
} else {
  console.error("PDF was not created. spawnSync status:", res.status);
}
