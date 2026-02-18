import fs from 'fs';
import path from 'path';

const TARGET_DIRS = ['src/app', 'src/components'];
const OUTPUT_FILE = 'contrast-violation-report.md';

interface ContrastViolation {
  file: string;
  line: number;
  bgClass: string;
  textClass: string;
  contrast: number;
}

const violations: ContrastViolation[] = [];

// Helper: HSL to Hex
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Helper: Hex to Luminance
function getLuminance(hex: string): number {
  if (hex === 'transparent' || hex === 'currentColor') return 1; // Assume light for safety
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Helper: Contrast Ratio
function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Standard Tailwind Colors (subset of v3)
const TAILWIND_COLORS: Record<string, string> = {
  'white': '#ffffff', 'black': '#000000',
  'slate-50': '#f8fafc', 'slate-100': '#f1f5f9', 'slate-200': '#e2e8f0', 'slate-300': '#cbd5e1', 'slate-400': '#94a3b8', 'slate-500': '#64748b', 'slate-600': '#475569', 'slate-700': '#334155', 'slate-800': '#1e293b', 'slate-900': '#0f172a',
  'gray-50': '#f9fafb', 'gray-100': '#f3f4f6', 'gray-200': '#e5e7eb', 'gray-300': '#d1d5db', 'gray-400': '#9ca3af', 'gray-500': '#6b7280', 'gray-600': '#4b5563', 'gray-700': '#374151', 'gray-800': '#1f2937', 'gray-900': '#111827',
  'zinc-50': '#fafafa', 'zinc-100': '#f4f4f5', 'zinc-200': '#e4e4e7', 'zinc-300': '#d4d4d8', 'zinc-400': '#a1a1aa', 'zinc-500': '#71717a', 'zinc-600': '#52525b', 'zinc-700': '#3f3f3f', 'zinc-800': '#27272a', 'zinc-900': '#18181b',
  'neutral-50': '#fafafa', 'neutral-100': '#f5f5f5', 'neutral-200': '#e5e5e5', 'neutral-300': '#d4d4d4', 'neutral-400': '#a3a3a3', 'neutral-500': '#737373', 'neutral-600': '#525252', 'neutral-700': '#404040', 'neutral-800': '#262626', 'neutral-900': '#171717',
  'stone-50': '#fafaf9', 'stone-100': '#f5f5f4', 'stone-200': '#e7e5e4', 'stone-300': '#d6d3d1', 'stone-400': '#a8a29e', 'stone-500': '#78716c', 'stone-600': '#57534e', 'stone-700': '#44403c', 'stone-800': '#292524', 'stone-900': '#1c1917',
  'red-50': '#fef2f2', 'red-100': '#fee2e2', 'red-200': '#fecaca', 'red-300': '#fca5a5', 'red-400': '#f87171', 'red-500': '#ef4444', 'red-600': '#dc2626', 'red-700': '#b91c1c', 'red-800': '#991b1b', 'red-900': '#7f1d1d',
  'orange-50': '#fff7ed', 'orange-100': '#ffedd5', 'orange-200': '#fed7aa', 'orange-300': '#fdba74', 'orange-400': '#fb923c', 'orange-500': '#f97316', 'orange-600': '#ea580c', 'orange-700': '#c2410c', 'orange-800': '#9a3412', 'orange-900': '#7c2d12',
  'amber-50': '#fffbeb', 'amber-100': '#fef3c7', 'amber-200': '#fde68a', 'amber-300': '#fcd34d', 'amber-400': '#fbbf24', 'amber-500': '#f59e0b', 'amber-600': '#d97706', 'amber-700': '#b45309', 'amber-800': '#92400e', 'amber-900': '#78350f',
  'yellow-50': '#fefce8', 'yellow-100': '#fef9c3', 'yellow-200': '#fef08a', 'yellow-300': '#fde047', 'yellow-400': '#facc15', 'yellow-500': '#eab308', 'yellow-600': '#ca8a04', 'yellow-700': '#a16207', 'yellow-800': '#854d0e', 'yellow-900': '#713f12',
  'lime-50': '#f7fee7', 'lime-100': '#ecfccb', 'lime-200': '#d9f99d', 'lime-300': '#bef264', 'lime-400': '#a3e635', 'lime-500': '#84cc16', 'lime-600': '#65a30d', 'lime-700': '#4d7c0f', 'lime-800': '#3f6212', 'lime-900': '#365314',
  'green-50': '#f0fdf4', 'green-100': '#dcfce7', 'green-200': '#bbf7d0', 'green-300': '#86efac', 'green-400': '#4ade80', 'green-500': '#22c55e', 'green-600': '#16a34a', 'green-700': '#15803d', 'green-800': '#166534', 'green-900': '#14532d',
  'emerald-50': '#ecfdf5', 'emerald-100': '#d1fae5', 'emerald-200': '#a7f3d0', 'emerald-300': '#6ee7b7', 'emerald-400': '#34d399', 'emerald-500': '#10b981', 'emerald-600': '#059669', 'emerald-700': '#047857', 'emerald-800': '#065f46', 'emerald-900': '#064e3b',
  'teal-50': '#f0fdfa', 'teal-100': '#ccfbf1', 'teal-200': '#99f6e4', 'teal-300': '#5eead4', 'teal-400': '#2dd4bf', 'teal-500': '#14b8a6', 'teal-600': '#0d9488', 'teal-700': '#0f766e', 'teal-800': '#115e59', 'teal-900': '#134e4a',
  'cyan-50': '#ecfeff', 'cyan-100': '#cffafe', 'cyan-200': '#a5f3fc', 'cyan-300': '#67e8f9', 'cyan-400': '#22d3ee', 'cyan-500': '#06b6d4', 'cyan-600': '#0891b2', 'cyan-700': '#0e7490', 'cyan-800': '#155f75', 'cyan-900': '#164e63',
  'sky-50': '#f0f9ff', 'sky-100': '#e0f2fe', 'sky-200': '#bae6fd', 'sky-300': '#7dd3fc', 'sky-400': '#38bdf8', 'sky-500': '#0ea5e9', 'sky-600': '#0284c7', 'sky-700': '#0369a1', 'sky-800': '#075985', 'sky-900': '#0c4a6e',
  'blue-50': '#eff6ff', 'blue-100': '#dbeafe', 'blue-200': '#bfdbfe', 'blue-300': '#93c5fd', 'blue-400': '#60a5fa', 'blue-500': '#3b82f6', 'blue-600': '#2563eb', 'blue-700': '#1d4ed8', 'blue-800': '#1e40af', 'blue-900': '#1e3a8a',
  'indigo-50': '#eef2ff', 'indigo-100': '#e0e7ff', 'indigo-200': '#c7d2fe', 'indigo-300': '#a5b4fc', 'indigo-400': '#818cf8', 'indigo-500': '#6366f1', 'indigo-600': '#4f46e5', 'indigo-700': '#4338ca', 'indigo-800': '#3730a3', 'indigo-900': '#312e81',
  'violet-50': '#f5f3ff', 'violet-100': '#ede9fe', 'violet-200': '#ddd6fe', 'violet-300': '#c4b5fd', 'violet-400': '#a78bfa', 'violet-500': '#8b5cf6', 'violet-600': '#7c3aed', 'violet-700': '#6d28d9', 'violet-800': '#5b21b6', 'violet-900': '#4c1d95',
  'purple-50': '#faf5ff', 'purple-100': '#f3e8ff', 'purple-200': '#e9d5ff', 'purple-300': '#d8b4fe', 'purple-400': '#c084fc', 'purple-500': '#a855f7', 'purple-600': '#9333ea', 'purple-700': '#7e22ce', 'purple-800': '#6b21a8', 'purple-900': '#581c87',
  'fuchsia-50': '#fdf4ff', 'fuchsia-100': '#fae8ff', 'fuchsia-200': '#f5d0fe', 'fuchsia-300': '#f0abfc', 'fuchsia-400': '#e879f9', 'fuchsia-500': '#d946ef', 'fuchsia-600': '#c026d3', 'fuchsia-700': '#a21caf', 'fuchsia-800': '#86198f', 'fuchsia-900': '#701a75',
  'pink-50': '#fdf2f8', 'pink-100': '#fce7f3', 'pink-200': '#fbcfe8', 'pink-300': '#f9a8d4', 'pink-400': '#f472b6', 'pink-500': '#ec4899', 'pink-600': '#db2777', 'pink-700': '#be185d', 'pink-800': '#9d174d', 'pink-900': '#831843',
  'rose-50': '#fff1f2', 'rose-100': '#ffe4e6', 'rose-200': '#fecdd3', 'rose-300': '#fda4af', 'rose-400': '#fb7185', 'rose-500': '#f43f5e', 'rose-600': '#e11d48', 'rose-700': '#be123c', 'rose-800': '#9f1239', 'rose-900': '#881337',
};

// 1. Parse Globals CSS for Variables
const globalCss = fs.readFileSync('src/app/globals.css', 'utf-8');
const cssVars: Record<string, string> = {};

// Regex for --name: h s% l%; or --name: h s% l% / a;
// Simplified to capture value until semicolon
const varRegex = /--([a-z0-9-]+):\s*([^;]+);/g;
let match;
while ((match = varRegex.exec(globalCss)) !== null) {
  const name = match[1];
  const val = match[2].trim();
  // Assume "h s% l%" format or similar space separated
  // We need to parse this later if used
  cssVars[name] = val;
}

function resolveColor(className: string): string | null {
  // 1. Remove prefix
  const colorName = className.replace(/^(bg-|text-)/, '');

  // 2. Handle arbitrary values [color]
  if (colorName.startsWith('[') && colorName.endsWith(']')) {
    return colorName.slice(1, -1);
  }

  // 3. Handle standard colors
  if (TAILWIND_COLORS[colorName]) {
    return TAILWIND_COLORS[colorName];
  }

  // 4. Handle CSS variables (e.g., primary, background)
  // These map to hsl(var(--name))
  if (cssVars[colorName]) {
    const hsl = cssVars[colorName];
    // hsl string: "210 29% 96%"
    const parts = hsl.split(' ');
    if (parts.length >= 3) {
      const h = parseFloat(parts[0]);
      const s = parseFloat(parts[1]);
      const l = parseFloat(parts[2]);
      return hslToHex(h, s, l);
    }
  }

  return null;
}

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  // Find elements with className
  const classMatches = content.matchAll(/className=["']([^"']+)["']/g);
  let lineNum = 1; // Approximation if we scan strictly regex match index...
  // Actually, let's process line by line to get correct line number
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    const match = line.match(/className=["']([^"']+)["']/);
    if (match) {
        const classes = match[1].split(/\s+/);
        const bgClass = classes.find(c => c.startsWith('bg-') && !c.includes('gradient'));
        const textClass = classes.find(c => c.startsWith('text-'));

        if (bgClass && textClass) {
            const bgHex = resolveColor(bgClass);
            const textHex = resolveColor(textClass);

            if (bgHex && textHex) {
                const contrast = getContrastRatio(bgHex, textHex);
                if (contrast < 4.5) {
                    violations.push({
                        file: filePath,
                        line: index + 1,
                        bgClass,
                        textClass,
                        contrast
                    });
                }
            }
        }
    }
  });
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
TARGET_DIRS.forEach(dir => traverseDir(dir));

let report = '# Contrast Violation Report\n\n';
if (violations.length === 0) {
  report += 'No contrast violations found.\n';
} else {
  report += '| File | Line | Classes | Ratio | Result |\n|---|---|---|---|---|\n';
  violations.forEach(v => {
    report += `| ${v.file} | ${v.line} | \`${v.bgClass}\` on \`${v.textClass}\` | ${v.contrast.toFixed(2)} | ❌ |\n`;
  });
}

fs.writeFileSync(OUTPUT_FILE, report);
console.log(`Contrast Audit Complete. Report saved to ${OUTPUT_FILE}`);
