const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicons() {
  const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
  const publicDir = path.join(__dirname, '..', 'public');

  console.log('Generating favicons from logo.png...');

  try {
    // Read the original logo
    const logoBuffer = fs.readFileSync(logoPath);

    // Generate different sizes for favicon
    const sizes = [16, 32, 48, 64, 128, 180, 192, 512];
    
    for (const size of sizes) {
      const outputPath = path.join(publicDir, `favicon-${size}x${size}.png`);
      await sharp(logoBuffer)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(outputPath);
      console.log(`Created: favicon-${size}x${size}.png`);
    }

    // Create apple-touch-icon (180x180)
    await sharp(logoBuffer)
      .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('Created: apple-touch-icon.png');

    // Generate ICO file - copy 32x32 PNG as fallback (browsers support PNG favicons)
    const ico32Buffer = await sharp(logoBuffer)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico32Buffer);
    console.log('Created: favicon.ico (as PNG - supported by modern browsers)');

    // Create SVG wrapper that embeds the PNG as base64
    const base64Logo = logoBuffer.toString('base64');
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <image href="data:image/png;base64,${base64Logo}" width="200" height="200" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
    fs.writeFileSync(path.join(publicDir, 'logo.svg'), svgContent);
    console.log('Created: logo.svg');

    // Create favicon.svg (32x32)
    const favicon32Buffer = await sharp(logoBuffer)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    const base64Favicon = favicon32Buffer.toString('base64');
    const faviconSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <image href="data:image/png;base64,${base64Favicon}" width="32" height="32" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
    fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvgContent);
    console.log('Created: favicon.svg');

    console.log('\nAll favicons generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();

