const sharp = require('sharp');
const fs = require('fs');

async function generateWhiteLogo() {
  const { data, info } = await sharp('public/brand/logo.png').raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;

  const outData = Buffer.alloc(data.length);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a < 5) {
      // Clean transparent
      outData[i] = 0;
      outData[i + 1] = 0;
      outData[i + 2] = 0;
      outData[i + 3] = 0;
      continue;
    }

    const isRed = (r > g + 35) && (r > b + 35);

    if (isRed) {
      // Keep red as is
      outData[i] = r;
      outData[i + 1] = g;
      outData[i + 2] = b;
      outData[i + 3] = a;
    } else {
      // Turn black text / black emblem to pure white
      outData[i] = 255;
      outData[i + 1] = 255;
      outData[i + 2] = 255;
      outData[i + 3] = a;
    }
  }

  // Save as PNG
  await sharp(outData, {
    raw: {
      width,
      height,
      channels: 4,
    }
  })
  .png({ compressionLevel: 9 })
  .toFile('public/brand/logo-white.png');

  // Also save as WebP
  await sharp(outData, {
    raw: {
      width,
      height,
      channels: 4,
    }
  })
  .webp({ quality: 95, lossless: true })
  .toFile('public/brand/logo-white.webp');

  console.log('Successfully wrote public/brand/logo-white.png and public/brand/logo-white.webp');

  // Create preview on brand-dark (#1A1D20)
  await sharp({
    create: {
      width: width + 80,
      height: height + 80,
      channels: 4,
      background: { r: 26, g: 29, b: 32, alpha: 1 }
    }
  })
  .composite([
    {
      input: 'public/brand/logo-white.png',
      top: 40,
      left: 40,
    }
  ])
  .png()
  .toFile('scripts/footer-logo-dark-preview.png');

  console.log('Preview on dark footer background saved to scripts/footer-logo-dark-preview.png');
}

generateWhiteLogo().catch(console.error);
