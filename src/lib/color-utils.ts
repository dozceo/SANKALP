
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

  // Optimization: Use slice instead of replace for faster string processing
  let cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  if (cleanHex.length === 3) {
    cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
  }

  const num = parseInt(cleanHex, 16);
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
  // Limit cache size to prevent memory leaks in long running sessions
  if (colorCache.size > 1000) {
    colorCache.clear();
  }
  colorCache.set(key, result);

  return result;
}
