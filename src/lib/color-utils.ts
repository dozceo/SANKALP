
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
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  const num = parseInt(cleanHex, 16);

  const amt = Math.round(2.55 * percent);

  // Use bitwise operations for color component extraction
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);

  // Bitwise composition with 0x1000000 to ensure zero-padding
  const result = `#${(0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;

  // Cache the result
  // Limit cache size to prevent memory leaks in long running sessions
  if (colorCache.size > 1000) {
    colorCache.clear();
  }
  colorCache.set(key, result);

  return result;
}
