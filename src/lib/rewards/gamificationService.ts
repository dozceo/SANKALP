import { Badge, StudentNode } from '@/data/docsData';

// ─── Badge Definitions ───────────────────────────────────────────────
// Each badge has criteria that can be checked against student data.

export interface BadgeDefinition {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    /** Returns true if the student qualifies for this badge */
    check: (student: StudentNode, context: GamificationContext) => boolean;
}

export interface GamificationContext {
    /** Number of quizzes the student has completed (lifetime) */
    quizzesCompleted: number;
    /** Number of quizzes completed today */
    quizzesCompletedToday: number;
    /** Current streak (before update) */
    currentStreak: number;
    /** Overall mastery percentage 0-100 */
    overallMastery: number;
    /** Number of subjects with mastery > 80% */
    masteredSubjects: number;
    /** Total subjects */
    totalSubjects: number;
}

// ─── Badge Catalog ───────────────────────────────────────────────────

export const BADGE_CATALOG: BadgeDefinition[] = [
    {
        id: 'first-quiz',
        title: 'First Steps',
        description: 'Completed your first quiz',
        icon: '🎯',
        color: 'hsl(200, 70%, 50%)',
        check: (_s, ctx) => ctx.quizzesCompleted >= 1,
    },
    {
        id: 'quiz-5',
        title: 'Quiz Enthusiast',
        description: 'Completed 5 quizzes',
        icon: '📝',
        color: 'hsl(160, 70%, 45%)',
        check: (_s, ctx) => ctx.quizzesCompleted >= 5,
    },
    {
        id: 'quiz-25',
        title: 'Quiz Master',
        description: 'Completed 25 quizzes',
        icon: '🏆',
        color: 'hsl(45, 90%, 50%)',
        check: (_s, ctx) => ctx.quizzesCompleted >= 25,
    },
    {
        id: 'streak-3',
        title: 'On a Roll',
        description: 'Maintained a 3-day streak',
        icon: '🔥',
        color: 'hsl(20, 90%, 55%)',
        check: (_s, ctx) => ctx.currentStreak >= 3,
    },
    {
        id: 'streak-7',
        title: 'Week Warrior',
        description: 'Maintained a 7-day streak',
        icon: '⚡',
        color: 'hsl(280, 70%, 55%)',
        check: (_s, ctx) => ctx.currentStreak >= 7,
    },
    {
        id: 'streak-30',
        title: 'Unstoppable',
        description: 'Maintained a 30-day streak',
        icon: '💎',
        color: 'hsl(200, 80%, 60%)',
        check: (_s, ctx) => ctx.currentStreak >= 30,
    },
    {
        id: 'mastery-50',
        title: 'Half Way There',
        description: 'Reached 50% overall mastery',
        icon: '📈',
        color: 'hsl(120, 60%, 45%)',
        check: (_s, ctx) => ctx.overallMastery >= 50,
    },
    {
        id: 'mastery-80',
        title: 'Scholar',
        description: 'Reached 80% overall mastery',
        icon: '🎓',
        color: 'hsl(260, 60%, 55%)',
        check: (_s, ctx) => ctx.overallMastery >= 80,
    },
    {
        id: 'subject-master',
        title: 'Subject Master',
        description: 'Mastered at least one subject (80%+)',
        icon: '⭐',
        color: 'hsl(45, 85%, 55%)',
        check: (_s, ctx) => ctx.masteredSubjects >= 1,
    },
    {
        id: 'all-rounder',
        title: 'All-Rounder',
        description: 'Mastered all subjects (80%+)',
        icon: '👑',
        color: 'hsl(35, 90%, 50%)',
        check: (_s, ctx) => ctx.totalSubjects > 0 && ctx.masteredSubjects >= ctx.totalSubjects,
    },
];

// ─── Streak Logic ────────────────────────────────────────────────────

/**
 * Calculate the updated streak based on the student's last active date.
 * - If last active was yesterday → increment streak
 * - If last active was today → keep streak (already counted)
 * - If last active was >1 day ago → reset streak to 1
 * - If no last active → start streak at 1
 */
export function calculateStreak(student: StudentNode): number {
    const now = new Date();
    const today = stripTime(now);

    if (!student.lastActive) {
        return 1; // First activity ever
    }

    const lastActive = stripTime(new Date(student.lastActive));
    const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        // Already active today — keep current streak
        return student.streak || 1;
    } else if (diffDays === 1) {
        // Active yesterday — increment streak
        return (student.streak || 0) + 1;
    } else {
        // Missed a day — reset streak
        return 1;
    }
}

/** Strips the time component from a Date, returning midnight UTC */
function stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// ─── Badge Awarding ──────────────────────────────────────────────────

/**
 * Check all badge definitions against the student's current state
 * and return any newly earned badges (ones they don't already have).
 */
export function checkAndAwardBadges(
    student: StudentNode,
    context: GamificationContext
): Badge[] {
    // ⚡ Bolt: Use explicit loop over student.badges to avoid mapping a potentially large intermediate array
    const existingIds = new Set<string>();
    if (student.badges) {
        for (const b of student.badges) {
            existingIds.add(b.id);
        }
    }
    const newBadges: Badge[] = [];

    for (const def of BADGE_CATALOG) {
        if (existingIds.has(def.id)) continue; // Already earned

        if (def.check(student, context)) {
            newBadges.push({
                id: def.id,
                title: def.title,
                description: def.description,
                icon: def.icon,
                color: def.color,
                earnedAt: new Date().toISOString(),
            });
        }
    }

    return newBadges;
}

// ─── Combined Update ─────────────────────────────────────────────────

export interface GamificationUpdate {
    updatedStreak: number;
    newBadges: Badge[];
    allBadges: Badge[];
}

/**
 * Perform a full gamification update for a student:
 * 1. Recalculate streak
 * 2. Check and award new badges
 * Returns the updated values (caller is responsible for persisting).
 */
export function processGamificationUpdate(
    student: StudentNode,
    context: Omit<GamificationContext, 'currentStreak'>
): GamificationUpdate {
    const updatedStreak = calculateStreak(student);

    const fullContext: GamificationContext = {
        ...context,
        currentStreak: updatedStreak,
    };

    const newBadges = checkAndAwardBadges(student, fullContext);
    const allBadges = [...(student.badges || []), ...newBadges];

    return {
        updatedStreak,
        newBadges,
        allBadges,
    };
}
