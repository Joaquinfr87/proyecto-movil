const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SVG_PATH = path.join(__dirname, '..', 'assets', 'logo.svg');
const OUTPUT_DIR = path.join(__dirname, '..', 'assets');

// SVG estático para iconos (sin animaciones, que sharp no puede renderizar)
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563EB;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="innerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#1D4ED8" flood-opacity="0.25"/>
    </filter>
  </defs>
  
  <!-- Pin shape -->
  <path d="M100 12 C60 12 28 44 28 84 C28 112 46 136 68 156 L100 192 L132 156 C154 136 172 112 172 84 C172 44 140 12 100 12Z" 
        fill="url(#pinGrad)" filter="url(#shadow)"/>
  
  <!-- Inner circle -->
  <circle cx="100" cy="82" r="36" fill="url(#innerGrad)"/>
  
  <!-- Stadium field lines -->
  <circle cx="100" cy="82" r="12" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.9"/>
  <circle cx="100" cy="82" r="3" fill="#FFFFFF" opacity="0.9"/>
  <line x1="100" y1="46" x2="100" y2="118" stroke="#FFFFFF" stroke-width="1.5" opacity="0.7"/>
  <rect x="72" y="52" width="56" height="60" rx="2" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.7"/>
  <path d="M72 58 Q72 52 78 52" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.7"/>
  <path d="M128 58 Q128 52 122 52" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.7"/>
  <path d="M72 106 Q72 112 78 112" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.7"/>
  <path d="M128 106 Q128 112 122 112" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.7"/>
</svg>`;

// SVG para el foreground de Android (pin centrado, más grande, con safe zone)
const ANDROID_FOREGROUND_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 432" width="432" height="432">
  <defs>
    <linearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563EB;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="innerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#1D4ED8" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Pin shape - centrado en el safe zone (inner 66% = ~144px desde cada borde) -->
  <g transform="translate(216, 200) scale(1.1) translate(-100, -100)">
    <path d="M100 12 C60 12 28 44 28 84 C28 112 46 136 68 156 L100 192 L132 156 C154 136 172 112 172 84 C172 44 140 12 100 12Z" 
          fill="url(#pinGrad)" filter="url(#shadow)"/>
    <circle cx="100" cy="82" r="36" fill="url(#innerGrad)"/>
    <circle cx="100" cy="82" r="12" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.9"/>
    <circle cx="100" cy="82" r="3" fill="#FFFFFF" opacity="0.9"/>
    <line x1="100" y1="46" x2="100" y2="118" stroke="#FFFFFF" stroke-width="1.5" opacity="0.7"/>
    <rect x="72" y="52" width="56" height="60" rx="2" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.7"/>
    <path d="M72 58 Q72 52 78 52" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.7"/>
    <path d="M128 58 Q128 52 122 52" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.7"/>
    <path d="M72 106 Q72 112 78 112" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.7"/>
    <path d="M128 106 Q128 112 122 112" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.7"/>
  </g>
</svg>`;

// SVG monocromático para Android (solo la forma del pin, sin color)
const MONOCHROME_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 432" width="432" height="432">
  <g transform="translate(216, 200) scale(1.1) translate(-100, -100)">
    <path d="M100 12 C60 12 28 44 28 84 C28 112 46 136 68 156 L100 192 L132 156 C154 136 172 112 172 84 C172 44 140 12 100 12Z" 
          fill="#000000"/>
    <circle cx="100" cy="82" r="36" fill="#000000"/>
    <circle cx="100" cy="82" r="12" fill="none" stroke="#FFFFFF" stroke-width="2"/>
    <circle cx="100" cy="82" r="3" fill="#FFFFFF"/>
    <line x1="100" y1="46" x2="100" y2="118" stroke="#FFFFFF" stroke-width="1.5"/>
    <rect x="72" y="52" width="56" height="60" rx="2" fill="none" stroke="#FFFFFF" stroke-width="1.5"/>
    <path d="M72 58 Q72 52 78 52" fill="none" stroke="#FFFFFF" stroke-width="1.5"/>
    <path d="M128 58 Q128 52 122 52" fill="none" stroke="#FFFFFF" stroke-width="1.5"/>
    <path d="M72 106 Q72 112 78 112" fill="none" stroke="#FFFFFF" stroke-width="1.5"/>
    <path d="M128 106 Q128 112 122 112" fill="none" stroke="#FFFFFF" stroke-width="1.5"/>
  </g>
</svg>`;

// Splash icon - logo más simple centrado
const SPLASH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563EB;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="innerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>
  <path d="M100 12 C60 12 28 44 28 84 C28 112 46 136 68 156 L100 192 L132 156 C154 136 172 112 172 84 C172 44 140 12 100 12Z" 
        fill="url(#pinGrad)"/>
  <circle cx="100" cy="82" r="36" fill="url(#innerGrad)"/>
  <circle cx="100" cy="82" r="12" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.9"/>
  <circle cx="100" cy="82" r="3" fill="#FFFFFF" opacity="0.9"/>
  <line x1="100" y1="46" x2="100" y2="118" stroke="#FFFFFF" stroke-width="1.5" opacity="0.7"/>
  <rect x="72" y="52" width="56" height="60" rx="2" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.7"/>
  <path d="M72 58 Q72 52 78 52" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.7"/>
  <path d="M128 58 Q128 52 122 52" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.7"/>
  <path d="M72 106 Q72 112 78 112" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.7"/>
  <path d="M128 106 Q128 112 122 112" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.7"/>
</svg>`;

async function generateIcons() {
  console.log('🎨 Generando iconos desde el logo SVG...\n');

  const tasks = [
    {
      name: 'icon.png',
      svg: LOGO_SVG,
      size: 1024,
      path: path.join(OUTPUT_DIR, 'icon.png'),
    },
    {
      name: 'splash-icon.png',
      svg: SPLASH_SVG,
      size: 200,
      path: path.join(OUTPUT_DIR, 'splash-icon.png'),
    },
    {
      name: 'android-icon-foreground.png',
      svg: ANDROID_FOREGROUND_SVG,
      size: 432,
      path: path.join(OUTPUT_DIR, 'android-icon-foreground.png'),
    },
    {
      name: 'android-icon-background.png',
      svg: null, // Solid color
      size: 432,
      path: path.join(OUTPUT_DIR, 'android-icon-background.png'),
      color: '#E6F4FE',
    },
    {
      name: 'android-icon-monochrome.png',
      svg: MONOCHROME_SVG,
      size: 432,
      path: path.join(OUTPUT_DIR, 'android-icon-monochrome.png'),
    },
    {
      name: 'favicon.png',
      svg: SPLASH_SVG,
      size: 48,
      path: path.join(OUTPUT_DIR, 'favicon.png'),
    },
  ];

  for (const task of tasks) {
    try {
      if (task.color) {
        // Solid color background
        await sharp({
          create: {
            width: task.size,
            height: task.size,
            channels: 4,
            background: { r: 230, g: 244, b: 254, alpha: 1 },
          },
        })
          .png()
          .toFile(task.path);
      } else {
        const svgBuffer = Buffer.from(task.svg);
        await sharp(svgBuffer)
          .resize(task.size, task.size)
          .png()
          .toFile(task.path);
      }
      console.log(`  ✅ ${task.name} (${task.size}x${task.size})`);
    } catch (err) {
      console.error(`  ❌ ${task.name}: ${err.message}`);
    }
  }

  console.log('\n🎉 ¡Iconos generados exitosamente!');
  console.log(`📁 Ubicación: ${OUTPUT_DIR}`);
}

generateIcons().catch(console.error);
