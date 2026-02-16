
import * as fs from 'fs';
import * as path from 'path';

// Helper: HSL to RGB
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
colorMap['transparent'] = [0, 0, 0]; // Ignore or handle specially

// Define pairs to check
const pairsToCheck = [
  ['background', 'foreground'],
  ['primary', 'primary-foreground'],
  ['secondary', 'secondary-foreground'],
  ['muted', 'muted-foreground'],
  ['accent', 'accent-foreground'],
  ['destructive', 'destructive-foreground'],
  ['card', 'card-foreground'],
  ['popover', 'popover-foreground'],
];

const violations: string[] = [];

// Check defined pairs
pairsToCheck.forEach(([bg, fg]) => {
  if (colorMap[bg] && colorMap[fg]) {
    const l1 = getLuminance(...colorMap[bg]);
    const l2 = getLuminance(...colorMap[fg]);
    const ratio = getContrastRatio(l1, l2);
    if (ratio < 4.5) {
      violations.push(`Contrast violation: bg-${bg} (${colorMap[bg].join(',')}) vs text-${fg} (${colorMap[fg].join(',')}). Ratio: ${ratio.toFixed(2)} (Expected >= 4.5)`);
    }
  } else {
    // violation? or just missing definition?
    // console.warn(`Missing color definition for pair: ${bg}, ${fg}`);
  }
});

// Scan files for ad-hoc usage
// This is harder. We'll look for className containing both bg-X and text-Y.
function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const classMatches = content.matchAll(/className=["']([^"']+)["']/g);
  for (const match of classMatches) {
    const classes = match[1].split(/\s+/);
    const bgClass = classes.find(c => c.startsWith('bg-'));
    const textClass = classes.find(c => c.startsWith('text-'));

    if (bgClass && textClass) {
      const bgName = bgClass.replace('bg-', '');
      const textName = textClass.replace('text-', '');

      // Check if mapped
      // Handle slash notation for opacity e.g. bg-primary/90 - simple approximation: ignore opacity for contrast check or warn
      const bgBase = bgName.split('/')[0];
      const textBase = textName.split('/')[0];

      if (colorMap[bgBase] && colorMap[textBase]) {
         const l1 = getLuminance(...colorMap[bgBase]);
         const l2 = getLuminance(...colorMap[textBase]);
         const ratio = getContrastRatio(l1, l2);
         if (ratio < 4.5) {
            violations.push(`File: ${filePath} - Contrast violation: ${bgClass} vs ${textClass}. Ratio: ${ratio.toFixed(2)}`);
         }
      }
    }
  }
}

function traverseDir(dir: string) {
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
if (violations.length === 0) {
  report += 'No contrast violations found.\n';
} else {
  report += '| Violation |\n|---|\n';
  violations.forEach(v => {
    report += `| ${v} |\n`;
  });
}

fs.writeFileSync('contrast-violation-report.md', report);
console.log('Contrast Audit Complete. Report saved to contrast-violation-report.md');
