const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];
const maskableSizes = [192, 512];

const iconsDir = path.join(__dirname, '../public/icons');
const svgPath = path.join(iconsDir, 'icon.svg');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generateIcons() {
  console.log('🚀 Generating PWA icons...');
  
  try {
    // Read SVG file
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Generate regular icons
    for (const size of sizes) {
      const outputPath = path.join(iconsDir, `icon-${size}.png`);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(outputPath);
      
      console.log(`✅ Generated icon-${size}.png`);
    }
    
    // Generate maskable icons (with padding for safe area)
    for (const size of maskableSizes) {
      const outputPath = path.join(iconsDir, `icon-maskable-${size}.png`);
      
      // Create a larger canvas with padding for maskable icons
      const paddedSize = Math.round(size * 1.2);
      const padding = Math.round((paddedSize - size) / 2);
      
      await sharp({
        create: {
          width: paddedSize,
          height: paddedSize,
          channels: 4,
          background: { r: 139, g: 92, b: 246, alpha: 1 } // Purple background
        }
      })
        .composite([
          {
            input: await sharp(svgBuffer)
              .resize(size, size)
              .png()
              .toBuffer(),
            top: padding,
            left: padding
          }
        ])
        .resize(size, size)
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(outputPath);
      
      console.log(`✅ Generated icon-maskable-${size}.png`);
    }
    
    // Generate favicon
    const faviconPath = path.join(__dirname, '../public/favicon.ico');
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(faviconPath.replace('.ico', '.png'));
    
    console.log('✅ Generated favicon.png');
    
    console.log('🎉 All PWA icons generated successfully!');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons(); 