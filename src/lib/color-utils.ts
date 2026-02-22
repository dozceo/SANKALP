
const colorCache = new Map<string, string>();

const HEX_MAP: Record<string, number> = {
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'a': 10, 'b': 11, 'c': 12, 'd': 13, 'e': 14, 'f': 15,
  'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15
};

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

  // Parsing without parseInt and substrings
  if (len === 7 || (len === 6 && hex[0] !== '#')) {
      // #RRGGBB or RRGGBB
      const start = len === 7 ? 1 : 0;
      r = (HEX_MAP[hex[start]] << 4) | HEX_MAP[hex[start + 1]];
      g = (HEX_MAP[hex[start + 2]] << 4) | HEX_MAP[hex[start + 3]];
      b = (HEX_MAP[hex[start + 4]] << 4) | HEX_MAP[hex[start + 5]];
  } else if (len === 4 || (len === 3 && hex[0] !== '#')) {
      // #RGB or RGB
      const start = len === 4 ? 1 : 0;
      const rVal = HEX_MAP[hex[start]];
      const gVal = HEX_MAP[hex[start + 1]];
      const bVal = HEX_MAP[hex[start + 2]];
      r = (rVal << 4) | rVal;
      g = (gVal << 4) | gVal;
      b = (bVal << 4) | bVal;
  } else {
      // Fallback for invalid length, though existing code didn't handle it explicitly well
      // Treat as black or return input? Original code would crash or return weird result.
      // Let's assume valid input for now but handle undefined lookup
      valid = false;
  }

  // Safety check for invalid characters
  if (isNaN(r) || isNaN(g) || isNaN(b)) valid = false;

  if (!valid) {
      // If parsing failed, return original (or could throw)
      return hex;
  }

  const amt = Math.round(2.55 * percent);

  // Apply lightness
  let newR = r + amt;
  let newG = g + amt;
  let newB = b + amt;

  // Clamp
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
