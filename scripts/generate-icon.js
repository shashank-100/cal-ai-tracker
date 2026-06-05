// Run with: node scripts/generate-icon.js
// Generates a simple 1024x1024 app icon using SVG -> PNG via sharp
const fs = require('fs');
const path = require('path');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#000000" rx="200"/>
  <!-- Apple icon -->
  <text x="512" y="580" font-size="480" text-anchor="middle" fill="white" font-family="Arial">🍎</text>
  <!-- Cal AI text -->
  <text x="512" y="860" font-size="110" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold">CalAI</text>
</svg>`;

fs.writeFileSync(path.join(__dirname, '../assets/icon.svg'), svg);
console.log('SVG written to assets/icon.svg');
console.log('To convert to PNG, use: npx svgexport assets/icon.svg assets/icon.png 1024:1024');
