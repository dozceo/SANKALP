import { StudentNode, Badge } from '@/data/docsData';

// Re-export gamification logic for convenient access
export {
    calculateStreak,
    checkAndAwardBadges,
    processGamificationUpdate,
    BADGE_CATALOG,
} from './gamificationService';
export type { GamificationContext, GamificationUpdate, BadgeDefinition } from './gamificationService';

export interface SubjectProgress {
    subject: string;
    value: number;
    label: string;
}

export interface ProjectionData {
    week: string;
    past: number;
    current: number;
    projected: number;
}

/**
 * Formats mastery scores into a subject-wise progress list.
 */
export function getSubjectMastery(student: StudentNode | null): SubjectProgress[] {
    if (!student || !student.masteryScores) return [];

    return Object.entries(student.masteryScores).map(([subject, score]) => ({
        subject,
        label: subject.charAt(0).toUpperCase() + subject.slice(1),
        value: Math.round(score * 100),
    }));
}

/**
 * Calculates the overall mastery percentage.
 */
export function getOverallMastery(student: StudentNode | null): number {
    const subjects = getSubjectMastery(student);
    if (subjects.length === 0) return 0;

    const total = subjects.reduce((acc, curr) => acc + curr.value, 0);
    return Math.round(total / subjects.length);
}

/**
 * Gets the student's badges, ensuring a clean array.
 */
export function getStudentBadges(student: StudentNode | null): Badge[] {
    return student?.badges || [];
}

/**
 * Generates personalized progress projection data.
 * In a real app, this might use historical data if available.
 * For now, it calculates a projection based on current mastery.
 */
export function getProgressProjection(student: StudentNode | null): ProjectionData[] {
    const averageMastery = getOverallMastery(student);

    // Simulate growth over 4 weeks
    return [
        {
            week: 'Week 1',
            past: Math.max(0, averageMastery - 30),
            current: Math.max(0, averageMastery - 25),
            projected: Math.max(0, averageMastery - 28)
        },
        {
            week: 'Week 2',
            past: Math.max(0, averageMastery - 20),
            current: Math.max(0, averageMastery - 15),
            projected: Math.max(0, averageMastery - 18)
        },
        {
            week: 'Week 3',
            past: Math.max(0, averageMastery - 10),
            current: Math.max(0, averageMastery - 5),
            projected: Math.max(0, averageMastery - 8)
        },
        {
            week: 'Week 4',
            past: averageMastery,
            current: averageMastery,
            projected: Math.max(0, averageMastery - 3)
        },
    ];
}
