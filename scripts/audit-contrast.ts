
import * as fs from 'fs';
import * as path from 'path';

// Helper: HSL to RGB (Standard implementation)
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

// Helper: Luminance
function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Helper: Contrast Ratio
function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Helper: Blend with White
function blendWithWhite(color: [number, number, number], alpha: number): [number, number, number] {
  return [
    Math.round(color[0] * alpha + 255 * (1 - alpha)),
    Math.round(color[1] * alpha + 255 * (1 - alpha)),
    Math.round(color[2] * alpha + 255 * (1 - alpha))
  ];
}

// Parse CSS Variables from globals.css
const cssContent = fs.readFileSync('src/app/globals.css', 'utf-8');
const colorMap: Record<string, [number, number, number]> = {};

const regex = /--([a-z0-9-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%;/g;
let match;
while ((match = regex.exec(cssContent)) !== null) {
  const name = match[1];
  const h = parseFloat(match[2]);
  const s = parseFloat(match[3]);
  const l = parseFloat(match[4]);
  colorMap[name] = hslToRgb(h, s, l);
}

// Add standard colors
colorMap['white'] = [255, 255, 255];
colorMap['black'] = [0, 0, 0];
colorMap['transparent'] = [255, 255, 255]; // Treat as white for contrast check against text

const violations: string[] = [];
const stats = {
  totalPairsChecked: 0,
  violations: 0
};

// Scan files for ad-hoc usage
function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  // Match className="..."
  const classMatches = content.matchAll(/className=["']([^"']+)["']/g);
  for (const match of classMatches) {
    const classes = match[1].split(/\s+/);
    const bgClass = classes.find(c => c.startsWith('bg-'));
    const textClass = classes.find(c => c.startsWith('text-'));

    if (bgClass && textClass) {
      // Parse bg class
      const bgParts = bgClass.replace('bg-', '').split('/');
      const bgName = bgParts[0];
      const bgOpacity = bgParts[1] ? parseInt(bgParts[1], 10) / 100 : 1;

      // Parse text class
      const textParts = textClass.replace('text-', '').split('/');
      const textName = textParts[0];
      const textOpacity = textParts[1] ? parseInt(textParts[1], 10) / 100 : 1;

      if (colorMap[bgName] && colorMap[textName]) {
         let bgColor = colorMap[bgName];
         if (bgOpacity < 1) {
             bgColor = blendWithWhite(bgColor, bgOpacity);
         }

         let textColor = colorMap[textName];
         if (textOpacity < 1) {
            textColor = [
                Math.round(textColor[0] * textOpacity + bgColor[0] * (1 - textOpacity)),
                Math.round(textColor[1] * textOpacity + bgColor[1] * (1 - textOpacity)),
                Math.round(textColor[2] * textOpacity + bgColor[2] * (1 - textOpacity))
            ];
         }

         const l1 = getLuminance(...bgColor);
         const l2 = getLuminance(...textColor);
         const ratio = getContrastRatio(l1, l2);

         stats.totalPairsChecked++;

         if (ratio < 4.5) { // Strict WCAG AA for normal text
            violations.push(`File: ${filePath} - Contrast violation: ${bgClass} vs ${textClass}. Ratio: ${ratio.toFixed(2)}`);
            stats.violations++;
         }
      }
    }
  }
}

function traverseDir(dir: string) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverseDir(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      scanFile(fullPath);
    }
  }
}

console.log('Starting Contrast Audit...');
traverseDir('src/app');
traverseDir('src/components');

let report = '# Contrast Violation Report\n\n';
report += '## Executive Summary\n';
report += `- **Total Color Pairs Checked**: ${stats.totalPairsChecked}\n`;
report += `- **Violations Found**: ${stats.violations}\n\n`;
report += '## Recommendations\n';
report += '1. **Increase Contrast**: Ensure all text/background combinations meet WCAG AA (4.5:1 ratio).\n';
report += '2. **Avoid Low Opacity Backgrounds**: Low opacity backgrounds on text often reduce contrast significantly.\n';
report += '3. **Review Color Palette**: Check if primary colors need adjustment for better accessibility.\n\n';

if (violations.length === 0) {
  report += 'No contrast violations found.\n';
} else {
  report += '## Detailed Violations\n';
  report += '| Violation |\n|---|\n';
  violations.forEach(v => {
    report += `| ${v} |\n`;
  });
}

const outputPath = 'reports/CONTRAST_VIOLATION_REPORT.md';
fs.writeFileSync(outputPath, report);
console.log(`Contrast Audit Complete. Report saved to ${outputPath}`);
