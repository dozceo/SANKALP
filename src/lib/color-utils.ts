
const colorCache = new Map<string, string>();

/**
 * Lightens a hex color by a given percentage.
 * Memoized to prevent repeated parsing and calculation.
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

  let num: number;
  // Check for hash and get length effectively
  const hasHash = hex.charCodeAt(0) === 35; // '#' is 35
  const start = hasHash ? 1 : 0;
  const len = hex.length - start;

  if (len === 3) {
    // Optimization: Handle shorthand #RGB without string allocation
    const r = parseInt(hex[start], 16);
    const g = parseInt(hex[start + 1], 16);
    const b = parseInt(hex[start + 2], 16);
    // Expand to RRGGBB: (r << 4 | r) << 16 | (g << 4 | g) << 8 | (b << 4 | b)
    num = (r << 20) | (r << 16) | (g << 12) | (g << 8) | (b << 4) | b;
  } else {
    // Full #RRGGBB or RRGGBB
    // If hasHash, we must slice, otherwise use as is
    num = parseInt(start === 0 ? hex : hex.slice(1), 16);
  }

  const amt = Math.round(2.55 * percent);

  // Extract components
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;

  // Clamp values between 0 and 255
  const newR = R < 255 ? (R < 0 ? 0 : R) : 255;
  const newG = G < 255 ? (G < 0 ? 0 : G) : 255;
  const newB = B < 255 ? (B < 0 ? 0 : B) : 255;

  // Bitwise composition with 0x1000000 to ensure zero-padding
  const result = `#${(0x1000000 + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;

  // Cache the result
  if (colorCache.size > 1000) {
    // Optimization: Delete oldest entry instead of clearing all to maintain hit rate
    const firstKey = colorCache.keys().next().value;
    if (firstKey) colorCache.delete(firstKey);
  }
  colorCache.set(key, result);

  return result;
}
