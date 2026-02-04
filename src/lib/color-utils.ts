/**
 * Utility functions for color manipulation
 */

const colorCache: Record<string, string> = {};

/**
 * Lightens a hex color by a given percentage.
 * Results are cached to avoid redundant string parsing and bitwise operations.
 *
 * @param hex The hex color string (e.g., "#ff0000")
 * @param percent The percentage to lighten (e.g., 20)
 * @returns The lightened hex color string
 */
export function lightenColor(hex: string, percent: number): string {
    const key = `${hex}-${percent}`;
    if (colorCache[key]) {
        return colorCache[key];
    }

    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
    const B = Math.min(255, (num & 0x0000ff) + amt);

    const result = `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    colorCache[key] = result;

    return result;
}
