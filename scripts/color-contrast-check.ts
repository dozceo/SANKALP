import fs from 'fs';
import path from 'path';

const GLOBALS_CSS = 'src/app/globals.css';
const TARGET_DIRS = ['src/app', 'src/components'];
const OUTPUT_FILE = 'contrast-violation-report.md';

// Helper to convert HSL string (e.g., "210 29% 96%") to RGB [r, g, b] 0-255
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

// Helper to calculate luminance
function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Helper to calculate contrast ratio
function getContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const l1 = getLuminance(...rgb1);
  const l2 = getLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// 1. Parse globals.css
const cssContent = fs.readFileSync(GLOBALS_CSS, 'utf-8');
const lightColors: Record<string, [number, number, number]> = {};
const darkColors: Record<string, [number, number, number]> = {};

// Regex to find variable definitions: --name: H S% L%;
// We need to handle block context (:root vs .dark)
// Simple state machine parsing
const lines = cssContent.split('\n');
let currentMode = 'light'; // default to light (inside :root)

lines.forEach(line => {
  if (line.includes('.dark {')) {
    currentMode = 'dark';
  } else if (line.includes('}')) {
    // simplistic, assumes .dark block ends with }
    // but works for typical globals.css structure
    // if nested, might fail, but globals.css is usually flat
  }

  const match = /--([\w-]+):\s*([\d\.]+)\s+([\d\.]+)%\s+([\d\.]+)%;/.exec(line);
  if (match) {
    const name = match[1];
    const h = parseFloat(match[2]);
    const s = parseFloat(match[3]);
    const l = parseFloat(match[4]);
    const rgb = hslToRgb(h, s, l);

    if (currentMode === 'light') {
      lightColors[name] = rgb;
    } else {
      darkColors[name] = rgb;
    }
  }
});

// Also handle colors that might not be overridden in dark mode (inherit from light)
Object.keys(lightColors).forEach(key => {
    if (!darkColors[key]) {
        darkColors[key] = lightColors[key];
    }
});


// 2. Scan components
interface ContrastCheck {
  file: string;
  bgClass: string;
  textClass: string;
  bgVar: string;
  textVar: string;
  lightRatio: number;
  darkRatio: number;
}

const violations: ContrastCheck[] = [];

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  // Find className strings
  const classNameRegex = /className=["']([^"']+)["']/g;
  let match;

  while ((match = classNameRegex.exec(content)) !== null) {
    const classes = match[1].split(/\s+/);
    let bgClass = '';
    let textClass = '';

    classes.forEach(cls => {
        if (cls.startsWith('bg-')) bgClass = cls;
        if (cls.startsWith('text-')) textClass = cls;
    });

    if (bgClass && textClass) {
        // Resolve to variable names
        // bg-primary -> primary
        // bg-background -> background
        // bg-muted/50 -> muted (ignoring opacity for now, creates false positives/negatives but simpler)

        const extractVar = (cls: string, prefix: string) => {
            let name = cls.replace(prefix, '');
            // remove modifiers like /50, hover:, etc (hover is already handled by not parsing it? No, classes list has hover:bg-...)
            // Wait, regex captured explicit strings. 'hover:bg-primary' is one string? No, split by space.
            // If class is 'hover:bg-primary', split gives 'hover:bg-primary'.
            // I should filter out pseudo-classes for now or handle them.
            // Let's only handle default state for simplicity.
            if (name.includes(':')) return null;
            if (name.includes('/')) name = name.split('/')[0];
            return name;
        };

        const bgVarName = extractVar(bgClass, 'bg-');
        const textVarName = extractVar(textClass, 'text-');

        if (bgVarName && textVarName && lightColors[bgVarName] && lightColors[textVarName]) {
            const lightRatio = getContrastRatio(lightColors[bgVarName], lightColors[textVarName]);
            const darkRatio = getContrastRatio(darkColors[bgVarName], darkColors[textVarName]);

            if (lightRatio < 4.5 || darkRatio < 4.5) {
                violations.push({
                    file: filePath,
                    bgClass,
                    textClass,
                    bgVar: bgVarName,
                    textVar: textVarName,
                    lightRatio,
                    darkRatio
                });
            }
        }
    }
  }
}

function traverseDir(dir: string) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverseDir(fullPath);
    } else if (file.endsWith('.tsx')) {
      scanFile(fullPath);
    }
  });
}

TARGET_DIRS.forEach(dir => traverseDir(dir));

// Generate Report
let report = `# Color Contrast Violation Report

Audit of text/background color combinations against WCAG 2.1 AA standards (Minimum 4.5:1 ratio for normal text).

Total pairs checked found: ${violations.length} violations found (in either Light or Dark mode).

| File | Background | Text | Light Mode Ratio | Dark Mode Ratio | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
${violations.map(v => {
    const lightStatus = v.lightRatio < 4.5 ? 'FAIL' : 'PASS';
    const darkStatus = v.darkRatio < 4.5 ? 'FAIL' : 'PASS';
    return `| \`${v.file}\` | \`${v.bgClass}\` | \`${v.textClass}\` | **${v.lightRatio.toFixed(2)}** (${lightStatus}) | **${v.darkRatio.toFixed(2)}** (${darkStatus}) | ${lightStatus === 'FAIL' || darkStatus === 'FAIL' ? '⚠️' : '✅'} |`;
}).join('\n')}

## Notes
- Colors derived from CSS variables in \`src/app/globals.css\`.
- Opacity modifiers (e.g., \`bg-primary/50\`) are ignored in static analysis (assumed 100%), which may affect actual contrast.
- Only checks explicit \`bg-*\` and \`text-*\` pairs on the same element. Inherited backgrounds are not tracked.
`;

fs.writeFileSync(OUTPUT_FILE, report);
console.log(`Report generated: ${OUTPUT_FILE}`);
