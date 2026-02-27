
const colorCache = new Map<string, string>();

// Optimization: Use Int8Array for O(1) character code lookup instead of object property access
// Initialize with -1 to represent invalid hex chars
const HEX_TABLE = new Int8Array(256).fill(-1);

// Populate table for 0-9
for (let i = 48; i <= 57; i++) HEX_TABLE[i] = i - 48;
// Populate table for A-F
for (let i = 65; i <= 70; i++) HEX_TABLE[i] = i - 55;
// Populate table for a-f
for (let i = 97; i <= 102; i++) HEX_TABLE[i] = i - 87;

const HEX_CHARS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

/**
 * Lightens a hex color by a given percentage.
 * Optimized for performance: avoids parseInt, uses lookup tables, and minimizes string allocation.
 *
 * @param hex The hex color string (e.g., "#9333EA")
 * @param percent The percentage to lighten (e.g., 20)
 * @returns The lightened hex color string
 */
export function lightenColor(hex: string, percent: number): string {
  const key = `${hex}-${percent}`;
  if (colorCache.has(key)) {
    return colorCache.get(key)!;
  }

  const len = hex.length;
  let r = 0, g = 0, b = 0;
  let valid = true;

  // Parsing using character codes and pre-computed table
  if (len === 7 || (len === 6 && hex.charCodeAt(0) !== 35)) { // 35 is '#'
      // #RRGGBB or RRGGBB
      const start = len === 7 ? 1 : 0;

      const r1 = HEX_TABLE[hex.charCodeAt(start)];
      const r2 = HEX_TABLE[hex.charCodeAt(start + 1)];
      const g1 = HEX_TABLE[hex.charCodeAt(start + 2)];
      const g2 = HEX_TABLE[hex.charCodeAt(start + 3)];
      const b1 = HEX_TABLE[hex.charCodeAt(start + 4)];
      const b2 = HEX_TABLE[hex.charCodeAt(start + 5)];

      // ⚡ Bolt: Early return for invalid input using efficient table lookup check
      // -1 indicates invalid character
      if (r1 === -1 || r2 === -1 || g1 === -1 || g2 === -1 || b1 === -1 || b2 === -1) return hex;

      r = (r1 << 4) | r2;
      g = (g1 << 4) | g2;
      b = (b1 << 4) | b2;
  } else if (len === 4 || (len === 3 && hex.charCodeAt(0) !== 35)) {
      // #RGB or RGB
      const start = len === 4 ? 1 : 0;

      const rVal = HEX_TABLE[hex.charCodeAt(start)];
      const gVal = HEX_TABLE[hex.charCodeAt(start + 1)];
      const bVal = HEX_TABLE[hex.charCodeAt(start + 2)];

      if (rVal === -1 || gVal === -1 || bVal === -1) return hex;

      r = (rVal << 4) | rVal;
      g = (gVal << 4) | gVal;
      b = (bVal << 4) | bVal;
  } else {
      // Fallback for invalid length
      valid = false;
  }

  if (!valid) {
      return hex;
  }

  const amt = Math.round(2.55 * percent);

  // Apply lightness
  let newR = r + amt;
  let newG = g + amt;
  let newB = b + amt;

  // Clamp using Math.min/max logic manually for speed
  if (newR > 255) newR = 255; else if (newR < 0) newR = 0;
  if (newG > 255) newG = 255; else if (newG < 0) newG = 0;
  if (newB > 255) newB = 255; else if (newB < 0) newB = 0;

  // Convert to hex string manually to avoid toString(16)
  // Optimization: Pre-calculated chars array
  const result = '#' +
    HEX_CHARS[(newR >> 4) & 0xF] + HEX_CHARS[newR & 0xF] +
    HEX_CHARS[(newG >> 4) & 0xF] + HEX_CHARS[newG & 0xF] +
    HEX_CHARS[(newB >> 4) & 0xF] + HEX_CHARS[newB & 0xF];

  // Cache management
  if (colorCache.size > 1000) {
    const firstKey = colorCache.keys().next().value;
    if (firstKey) colorCache.delete(firstKey);
  }
  colorCache.set(key, result);

  return result;
}
