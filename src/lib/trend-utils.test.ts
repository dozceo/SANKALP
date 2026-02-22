
import { calculateTrend } from './trend-utils';

describe('calculateTrend', () => {
    it('should return STABLE for fewer than 2 results', () => {
        expect(calculateTrend([], true)).toBe('STABLE');
        expect(calculateTrend([0.5], true)).toBe('STABLE');
    });

    it('should correctly identify IMPROVING trend (numbers)', () => {
        // Recent average (0.9, 0.8) = 0.85
        // Previous average (0.5, 0.4) = 0.45
        // Diff = 0.4 > 0.1 -> IMPROVING
        const results = [0.9, 0.8, 0.5, 0.4];
        expect(calculateTrend(results, true)).toBe('IMPROVING');
    });

    it('should correctly identify DECLINING trend (numbers)', () => {
        // Recent average (0.4, 0.3) = 0.35
        // Previous average (0.8, 0.9) = 0.85
        // Diff = -0.5 < -0.1 -> DECLINING
        const results = [0.4, 0.3, 0.8, 0.9];
        expect(calculateTrend(results, true)).toBe('DECLINING');
    });

    it('should correctly identify STABLE trend (numbers)', () => {
        // Recent average (0.55, 0.5) = 0.525
        // Previous average (0.5, 0.45) = 0.475
        // Diff = 0.05 < 0.1 -> STABLE
        const results = [0.55, 0.5, 0.5, 0.45];
        expect(calculateTrend(results, true)).toBe('STABLE');
    });

    it('should handle odd number of results (>= 4)', () => {
        // 5 items. mid = floor(5/2) = 2.
        // Recent: index 0, 1 (2 items). Previous: index 2, 3, 4 (3 items).
        // Recent: [0.9, 0.9] avg 0.9
        // Previous: [0.5, 0.5, 0.5] avg 0.5
        // Diff 0.4 -> IMPROVING
        const results = [0.9, 0.9, 0.5, 0.5, 0.5];
        expect(calculateTrend(results, true)).toBe('IMPROVING');
    });

    it('should handle small number of results (2 or 3)', () => {
        // 3 items.
        // Recent: index 0 (1 item). Previous: index 1, 2 (2 items).
        // Recent: [0.9] avg 0.9
        // Previous: [0.5, 0.5] avg 0.5
        // Diff 0.4 -> IMPROVING
        expect(calculateTrend([0.9, 0.5, 0.5], true)).toBe('IMPROVING');

        // 2 items.
        // Recent: [0.4] avg 0.4
        // Previous: [0.8] avg 0.8
        // Diff -0.4 -> DECLINING
        expect(calculateTrend([0.4, 0.8], true)).toBe('DECLINING');
    });

    it('should sort objects correctly if skipSort is false', () => {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 86400000);
        const twoDaysAgo = new Date(now.getTime() - 86400000 * 2);
        const threeDaysAgo = new Date(now.getTime() - 86400000 * 3);

        const input = [
            { score: 0.5, timestamp: twoDaysAgo },
            { score: 0.9, timestamp: now },
            { score: 0.4, timestamp: threeDaysAgo },
            { score: 0.8, timestamp: yesterday },
        ];
        // Sorted: 0.9 (now), 0.8 (yesterday), 0.5 (2d ago), 0.4 (3d ago)
        // Recent: 0.9, 0.8 -> avg 0.85
        // Previous: 0.5, 0.4 -> avg 0.45
        // Diff 0.4 -> IMPROVING

        expect(calculateTrend(input)).toBe('IMPROVING');
    });
});
