/**
 * Database Helper Functions
 * 
 * Centralized database operations for SANKALP.
 * Uses Firebase Admin SDK for server-side operations.
 */

import { db } from './firebase-admin';
import { FieldValue, WriteBatch } from 'firebase-admin/firestore';
import { chaos } from './chaos-config';

// ============================================
// Type Definitions
// ============================================

export interface User {
    uid: string;
    email: string;
    name: string;
    role: 'student' | 'teacher';
    createdAt: Date;
    lastLoginAt: Date;
    onboardingCompleted?: boolean;
}

export interface Teacher {
    id: string;
    userId: string;
    name: string;
    email: string;
    school: string;
    subject: string;
    classIds: string[];
    onboardingCompleted?: boolean;
}

export interface Class {
    id?: string;
    classCode: string;
    className: string;
    teacherId: string;
    teacherName: string;
    subject: string;
    grade: string;
    studentIds: string[];
    createdAt: Date;
    isActive: boolean;
}

export interface Student {
    id: string;
    userId: string;
    email: string;
    name: string;
    classId?: string;
    className?: string;
    classSubject?: string;
    teacherId?: string;
    teacherName?: string;
    grade?: string;
    joinedClassAt?: Date;
    registrationDate: Date;
    lastLoginDate: Date;
    chatbotPersonality?: string;
    chatbotInstructions?: string;
    onboardingCompleted?: boolean;
}

export interface QuizResult {
    id?: string;
    studentId: string;
    classId?: string;
    teacherId?: string;
    topic: string;
    score: number; // 0.0 to 1.0
    timeSpent: number; // seconds
    questionsAttempted: number;
    questionsCount?: number; // Total questions in quiz
    timestamp: Date;
}

export interface MLPrediction {
    id?: string;
    studentId: string;
    topic: string;
    masteryProbability: number;
    confidence: number;
    daysSinceRevision: number;
    createdAt: Date;
    expiresAt: Date;
}

export interface ADKDecision {
    id?: string;
    studentId: string;
    topic: string;
    action: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    reasoning: string;
    flags: string[];
    timestamp: Date;
}

export interface TeacherIntervention {
    id?: string;
    studentId: string;
    topic: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reason: string;
    suggestedAction: string;
    resolved: boolean;
    createdAt: Date;
}

// ============================================
// SANKALP Loop & Analytics Types
// ============================================

export interface SankalpSession {
    id?: string;
    studentId: string;
    startTime: Date;
    endTime?: Date;
    duration: number;
    targetDuration: number;
    status: 'active' | 'completed' | 'interrupted';

    activitiesCompleted: {
        addedClassData: boolean;
        reviewedTopics: boolean;
        checkedSchedule: boolean;
        chatWithMentor: boolean;
        updatedBrainMap: boolean;
    };

    timeBreakdown: {
        plannerTime: number;
        brainMapTime: number;
        chatTime: number;
        reviewTime: number;
        quizTime: number;
    };

    dataEntryMetrics: {
        topicsAdded: number;
        subjectsReviewed: number;
        nodesCreated: number;
        chatMessages: number;
        keystrokesCount: number;
        averageEntrySpeed: number;
    };

    completionPercentage: number;
    createdAt: Date;
}

export interface ActivityLog {
    id?: string;
    studentId: string;
    sessionId?: string;
    timestamp: Date;

    activityType:
    | 'planner_add_topic'
    | 'planner_review_item'
    | 'brainmap_create_node'
    | 'brainmap_view_node'
    | 'chat_send_message'
    | 'quiz_start'
    | 'quiz_submit'
    | 'syllabus_generate'
    | 'page_view';

    details: {
        page?: string;
        topic?: string;
        subject?: string;
        timeSpent?: number;
        inputLength?: number;
        action?: string;
    };

    metadata?: {
        deviceType?: string;
        browser?: string;
    };
}

export interface ChatHistory {
    id?: string;
    studentId: string;
    sessionId?: string;
    timestamp: Date;

    message: string;
    role: 'user' | 'assistant';
    topic?: string;
    category?: 'academic' | 'motivation' | 'planning' | 'other';

    isPrivate: boolean;
    sharedWithTeacher: boolean;

    messageLength: number;
    responseTime?: number;
    sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface BrainMapNode {
    id?: string;
    studentId: string;

    title: string;
    subject: string;
    topic: string;
    description?: string;
    masteryLevel: number;

    parentNodeId?: string;
    childNodeIds: string[];
    relatedNodeIds: string[];

    createdAt: Date;
    lastReviewedAt?: Date;
    reviewCount: number;

    quizResultIds: string[];
    plannerItemIds: string[];

    position?: {
        x: number;
        y: number;
    };
}

export interface PlannerData {
    id?: string;
    studentId: string;

    subject: string;
    topic: string;
    date: Date;
    type: 'class_notes' | 'revision' | 'homework' | 'practice';

    content: string;
    attachments?: string[];

    scheduledFor?: Date;
    completed: boolean;
    completedAt?: Date;

    reviewDates: Date[];
    nextReviewDate?: Date;
    reviewCount: number;

    brainMapNodeId?: string;

    createdAt: Date;
    updatedAt: Date;
}

export interface DailySummary {
    id?: string;
    studentId: string;
    date: string;

    sankalpSessionsCount: number;
    totalSankalpTime: number;
    averageSessionDuration: number;

    topicsAddedCount: number;
    subjectsReviewedCount: number;
    brainMapNodesCreated: number;

    chatMessagesCount: number;
    chatTopicsDiscussed: string[];
    chatCategories: Record<string, number>;

    quizzesTaken: number;
    syllabusGenerated: number;
    averageQuizScore: number;

    timeByActivity: {
        planner: number;
        brainMap: number;
        quiz: number;
        chat: number;
        syllabus: number;
    };

    engagementScore: number;
    consistencyScore: number;

    createdAt: Date;
}

// ============================================
// Student Operations
// ============================================

/**
 * Get student by ID
 */
export async function getStudent(studentId: string): Promise<Student | null> {
    await chaos.checkChaos('firestoreRead');
    try {
        const studentDoc = await db.collection('students').doc(studentId).get();

        if (!studentDoc.exists) {
            return null;
        }

        const data = studentDoc.data();
        return {
            id: studentDoc.id,
            userId: data?.userId || studentDoc.id,
            email: data?.email || '',
            name: data?.name || '',
            classId: data?.classId,
            className: data?.className,
            classSubject: data?.classSubject,
            teacherId: data?.teacherId,
            teacherName: data?.teacherName,
            grade: data?.grade,
            joinedClassAt: data?.joinedClassAt?.toDate(),
            registrationDate: data?.registrationDate?.toDate() || new Date(),
            lastLoginDate: data?.lastLoginDate?.toDate() || new Date(),
            chatbotPersonality: data?.chatbotPersonality,
            chatbotInstructions: data?.chatbotInstructions,
            onboardingCompleted: data?.onboardingCompleted,
        };
    } catch (error) {
        console.error('Error fetching student:', error);
        throw error;
    }
}

/**
 * Create a new student
 */
export async function createStudent(data: {
    id: string;
    email: string;
    name: string;
}): Promise<Student> {
    await chaos.checkChaos('firestoreWrite');
    try {
        const student: Student = {
            ...data,
            userId: data.id,
            registrationDate: new Date(),
            lastLoginDate: new Date(),
        };

        await db.collection('students').doc(data.id).set({
            userId: data.id,
            email: student.email,
            name: student.name,
            registrationDate: FieldValue.serverTimestamp(),
            lastLoginDate: FieldValue.serverTimestamp(),
        });

        return student;
    } catch (error) {
        console.error('Error creating student:', error);
        throw error;
    }
}

/**
 * Update student's last login time
 */
export async function updateLastLogin(studentId: string): Promise<void> {
    await chaos.checkChaos('firestoreWrite');
    try {
        await db.collection('students').doc(studentId).update({
            lastLoginDate: FieldValue.serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating last login:', error);
        throw error;
    }
}

// ============================================
// Quiz Results Operations
// ============================================

/**
 * Get quiz results for a student
 */
export async function getQuizResults(
    studentId: string,
    limit: number = 100,
    options?: { select?: string[] }
): Promise<QuizResult[]> {
    await chaos.checkChaos('firestoreRead');
    try {
        let query = db
            .collection('quizResults')
            .where('studentId', '==', studentId)
            .orderBy('timestamp', 'desc')
            .limit(limit);

        if (options?.select && options.select.length > 0) {
            query = query.select(...options.select);
        }

        const snapshot = await query.get();

        return snapshot.docs.map((doc: any) => {
            const data = doc.data();
            return {
                id: doc.id,
                studentId: data.studentId,
                topic: data.topic,
                score: data.score,
                timeSpent: data.timeSpent,
                questionsAttempted: data.questionsAttempted,
                timestamp: data.timestamp?.toDate() || new Date(),
            };
        });
    } catch (error) {
        console.error('Error fetching quiz results:', error);
        throw error;
    }
}

/**
 * Get batched quiz results for multiple students
 * Fetches data in chunks to respect Firestore 'in' query limits (10).
 * Results are sorted by timestamp desc in memory.
 */
export async function getBatchedQuizResults(
    studentIds: string[],
    limitPerStudent?: number,
    options?: { select?: string[] }
): Promise<Map<string, QuizResult[]>> {
    await chaos.checkChaos('firestoreRead');
    if (!studentIds.length) {
        return new Map();
    }

    // Chunk size 10 for 'in' query
    const chunkSize = 10;
    const chunks = [];
    for (let i = 0; i < studentIds.length; i += chunkSize) {
        chunks.push(studentIds.slice(i, i + chunkSize));
    }

    try {
        const resultsMap = new Map<string, QuizResult[]>();

        // Process chunks in parallel
        await Promise.all(chunks.map(async (chunk) => {
            let query = db
                .collection('quizResults')
                .where('studentId', 'in', chunk)
                .orderBy('timestamp', 'desc');

            if (options?.select && options.select.length > 0) {
                query = query.select(...options.select);
            }

            // We fetch all and sort in memory to be safe and avoid composite index requirements
            // and to correctly apply per-student limits
            const snapshot = await query.get();
            // Optimization: avoid object allocation inside loop
            const now = new Date();

            snapshot.docs.forEach((doc: any) => {
                const data = doc.data();
                const result: QuizResult = {
                    id: doc.id,
                    studentId: data.studentId,
                    topic: data.topic,
                    score: data.score,
                    timeSpent: data.timeSpent,
                    questionsAttempted: data.questionsAttempted,
                    timestamp: data.timestamp?.toDate() || now,
                };

                // Optimization: Avoid redundant Map.set calls
                let existing = resultsMap.get(result.studentId);
                if (!existing) {
                    existing = [];
                    resultsMap.set(result.studentId, existing);
                }
                existing.push(result);
            });
        }));

        // Sort and slice per student
        resultsMap.forEach((results, studentId) => {
            // Results are already sorted by timestamp due to orderBy in query and sequential processing

            // Apply limit if requested
            if (limitPerStudent && results.length > limitPerStudent) {
                resultsMap.set(studentId, results.slice(0, limitPerStudent));
            } else {
                // Ensure sorted array is set back (sort mutates, but good to be explicit)
                resultsMap.set(studentId, results);
            }
        });

        return resultsMap;
    } catch (error) {
        console.error('Error fetching batched quiz results:', error);
        throw error;
    }
}

/**
 * Save a quiz result
 */
export async function saveQuizResult(result: Omit<QuizResult, 'id'>): Promise<string> {
    await chaos.checkChaos('firestoreWrite');
    try {
        // Fetch student to get class and teacher info
        const student = await getStudent(result.studentId);

        const docRef = await db.collection('quizResults').add({
            studentId: result.studentId,
            classId: student?.classId || result.classId || null,
            teacherId: student?.teacherId || result.teacherId || null,
            topic: result.topic,
            score: result.score,
            timeSpent: result.timeSpent,
            questionsAttempted: result.questionsAttempted,
            timestamp: FieldValue.serverTimestamp(),
        });

        return docRef.id;
    } catch (error) {
        console.error('Error saving quiz result:', error);
        throw error;
    }
}

// ============================================
// ML Predictions (Cache)
// ============================================

/**
 * Get cached ML prediction
 */
export async function getCachedPrediction(
    studentId: string,
    topic: string
): Promise<MLPrediction | null> {
    await chaos.checkChaos('firestoreRead');
    try {
        const snapshot = await db
            .collection('mlPredictions')
            .where('studentId', '==', studentId)
            .where('topic', '==', topic)
            .where('expiresAt', '>', new Date())
            .orderBy('expiresAt', 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        const data = doc.data();

        return {
            id: doc.id,
            studentId: data.studentId,
            topic: data.topic,
            masteryProbability: data.masteryProbability,
            confidence: data.confidence,
            daysSinceRevision: data.daysSinceRevision,
            createdAt: data.createdAt?.toDate() || new Date(),
            expiresAt: data.expiresAt?.toDate() || new Date(),
        };
    } catch (error) {
        console.error('Error fetching cached prediction:', error);
        throw error;
    }
}

/**
 * Cache ML prediction
 */
export async function cachePrediction(prediction: Omit<MLPrediction, 'id'>): Promise<string> {
    await chaos.checkChaos('firestoreWrite');
    try {
        const docRef = await db.collection('mlPredictions').add({
            studentId: prediction.studentId,
            topic: prediction.topic,
            masteryProbability: prediction.masteryProbability,
            confidence: prediction.confidence,
            daysSinceRevision: prediction.daysSinceRevision,
            createdAt: FieldValue.serverTimestamp(),
            expiresAt: prediction.expiresAt,
        });

        return docRef.id;
    } catch (error) {
        console.error('Error caching prediction:', error);
        throw error;
    }
}

/**
 * Batch cache ML predictions
 */
export async function batchCachePredictions(predictions: Omit<MLPrediction, 'id'>[]): Promise<void> {
    await chaos.checkChaos('firestoreWrite');
    if (!predictions.length) return;

    try {
        const batch = db.batch();
        predictions.forEach(prediction => {
            const docRef = db.collection('mlPredictions').doc();
            batch.set(docRef, {
                studentId: prediction.studentId,
                topic: prediction.topic,
                masteryProbability: prediction.masteryProbability,
                confidence: prediction.confidence,
                daysSinceRevision: prediction.daysSinceRevision,
                createdAt: FieldValue.serverTimestamp(),
                expiresAt: prediction.expiresAt,
            });
        });

        await batch.commit();
    } catch (error) {
        console.error('Error batch caching predictions:', error);
        throw error;
    }
}

// ============================================
// ADK Decisions (Audit Trail)
// ============================================

/**
 * Save ADK decision
 */
export async function saveADKDecision(decision: Omit<ADKDecision, 'id'>): Promise<string> {
    await chaos.checkChaos('firestoreWrite');
    try {
        const docRef = await db.collection('adkDecisions').add({
            studentId: decision.studentId,
            topic: decision.topic,
            action: decision.action,
            priority: decision.priority,
            reasoning: decision.reasoning,
            flags: decision.flags,
            timestamp: FieldValue.serverTimestamp(),
        });

        return docRef.id;
    } catch (error) {
        console.error('Error saving ADK decision:', error);
        throw error;
    }
}

/**
 * Batch save ADK decisions
 */
export async function batchSaveADKDecisions(decisions: Omit<ADKDecision, 'id'>[]): Promise<void> {
    await chaos.checkChaos('firestoreWrite');
    if (!decisions.length) return;

    try {
        const batch = db.batch();
        decisions.forEach(decision => {
            const docRef = db.collection('adkDecisions').doc();
            batch.set(docRef, {
                studentId: decision.studentId,
                topic: decision.topic,
                action: decision.action,
                priority: decision.priority,
                reasoning: decision.reasoning,
                flags: decision.flags,
                timestamp: FieldValue.serverTimestamp(),
            });
        });

        await batch.commit();
    } catch (error) {
        console.error('Error batch saving ADK decisions:', error);
        throw error;
    }
}

/**
 * Get recent ADK decisions for a student
 */
export async function getADKDecisions(
    studentId: string,
    limit: number = 50
): Promise<ADKDecision[]> {
    await chaos.checkChaos('firestoreRead');
    try {
        const snapshot = await db
            .collection('adkDecisions')
            .where('studentId', '==', studentId)
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map((doc: any) => {
            const data = doc.data();
            return {
                id: doc.id,
                studentId: data.studentId,
                topic: data.topic,
                action: data.action,
                priority: data.priority,
                reasoning: data.reasoning,
                flags: data.flags || [],
                timestamp: data.timestamp?.toDate() || new Date(),
            };
        });
    } catch (error) {
        console.error('Error fetching ADK decisions:', error);
        throw error;
    }
}

// ============================================
// Teacher Interventions
// ============================================

/**
 * Create teacher intervention
 */
export async function createIntervention(
    intervention: Omit<TeacherIntervention, 'id'>
): Promise<string> {
    await chaos.checkChaos('firestoreWrite');
    try {
        const docRef = await db.collection('teacherInterventions').add({
            studentId: intervention.studentId,
            topic: intervention.topic,
            severity: intervention.severity,
            reason: intervention.reason,
            suggestedAction: intervention.suggestedAction,
            resolved: false,
            createdAt: FieldValue.serverTimestamp(),
        });

        return docRef.id;
    } catch (error) {
        console.error('Error creating intervention:', error);
        throw error;
    }
}

/**
 * Get unresolved interventions for a student
 */
export async function getUnresolvedInterventions(
    studentId: string
): Promise<TeacherIntervention[]> {
    await chaos.checkChaos('firestoreRead');
    try {
        const snapshot = await db
            .collection('teacherInterventions')
            .where('studentId', '==', studentId)
            .where('resolved', '==', false)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map((doc: any) => {
            const data = doc.data();
            return {
                id: doc.id,
                studentId: data.studentId,
                topic: data.topic,
                severity: data.severity,
                reason: data.reason,
                suggestedAction: data.suggestedAction,
                resolved: data.resolved,
                createdAt: data.createdAt?.toDate() || new Date(),
            };
        });
    } catch (error) {
        console.error('Error fetching interventions:', error);
        throw error;
    }
}

/**
 * Mark intervention as resolved
 */
/**
 * Mark intervention as resolved
 */
export async function resolveIntervention(interventionId: string): Promise<void> {
    await chaos.checkChaos('firestoreWrite');
    try {
        await db.collection('teacherInterventions').doc(interventionId).update({
            resolved: true,
        });
    } catch (error) {
        console.error('Error resolving intervention:', error);
        throw error;
    }
}

// ============================================
// User Management
// ============================================

/**
 * Get user by ID
 */
export async function getUser(userId: string): Promise<User | null> {
    await chaos.checkChaos('firestoreRead');
    try {
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return null;
        }

        const data = userDoc.data();
        return {
            uid: userDoc.id,
            email: data?.email || '',
            name: data?.name || '',
            role: data?.role || 'student',
            createdAt: data?.createdAt?.toDate() || new Date(),
            lastLoginAt: data?.lastLoginAt?.toDate() || new Date(),
            onboardingCompleted: data?.onboardingCompleted,
        };
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}

/**
 * Create a new user
 */
export async function createUser(data: {
    uid: string;
    email: string;
    name: string;
    role: 'student' | 'teacher';
}): Promise<User> {
    await chaos.checkChaos('firestoreWrite');
    try {
        const user: User = {
            ...data,
            createdAt: new Date(),
            lastLoginAt: new Date(),
        };

        await db.collection('users').doc(data.uid).set({
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: FieldValue.serverTimestamp(),
            lastLoginAt: FieldValue.serverTimestamp(),
        });

        return user;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
    await chaos.checkChaos('firestoreRead');
    try {
        const snapshot = await db
            .collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        const data = doc.data();

        return {
            uid: doc.id,
            email: data.email,
            name: data.name,
            role: data.role,
            createdAt: data.createdAt?.toDate() || new Date(),
            lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
        };
    } catch (error) {
        console.error('Error fetching user by email:', error);
        throw error;
    }
}

// ============================================
// Teacher Operations
// ============================================

/**
 * Create a new teacher
 */
export async function createTeacher(data: {
    id: string;
    userId: string;
    name: string;
    email: string;
    school: string;
    subject: string;
}): Promise<Teacher> {
    await chaos.checkChaos('firestoreWrite');
    try {
        const teacher: Teacher = {
            ...data,
            classIds: [],
        };

        await db.collection('teachers').doc(data.id).set({
            userId: data.userId,
            name: data.name,
            email: data.email,
            school: data.school,
            subject: data.subject,
            classIds: [],
        });

        return teacher;
    } catch (error) {
        console.error('Error creating teacher:', error);
        throw error;
    }
}

/**
 * Get teacher by ID
 */
export async function getTeacher(teacherId: string): Promise<Teacher | null> {
    await chaos.checkChaos('firestoreRead');
    try {
        const teacherDoc = await db.collection('teachers').doc(teacherId).get();

        if (!teacherDoc.exists) {
            return null;
        }

        const data = teacherDoc.data();
        return {
            id: teacherDoc.id,
            userId: data?.userId || teacherDoc.id,
            name: data?.name || '',
            email: data?.email || '',
            school: data?.school || '',
            subject: data?.subject || '',
            classIds: data?.classIds || [],
            onboardingCompleted: data?.onboardingCompleted,
        };
    } catch (error) {
        console.error('Error fetching teacher:', error);
        throw error;
    }
}

// ============================================
// Class Management
// ============================================

/**
 * Generate unique class code
 */
function generateClassCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Create a new class
 */
export async function createClass(data: {
    teacherId: string;
    teacherName: string;
    className: string;
    subject: string;
    grade: string;
}): Promise<Class> {
    await chaos.checkChaos('firestoreWrite');
    try {
        // Generate unique class code
        let classCode = generateClassCode();
        let exists = true;

        // Ensure code is unique
        while (exists) {
            const existing = await getClassByCode(classCode);
            if (!existing) {
                exists = false;
            } else {
                classCode = generateClassCode();
            }
        }

        const classData: Omit<Class, 'id'> = {
            classCode,
            className: data.className,
            teacherId: data.teacherId,
            teacherName: data.teacherName,
            subject: data.subject,
            grade: data.grade,
            studentIds: [],
            createdAt: new Date(),
            isActive: true,
        };

        const docRef = await db.collection('classes').add({
            ...classData,
            createdAt: FieldValue.serverTimestamp(),
        });

        // Add class ID to teacher's classIds
        await db.collection('teachers').doc(data.teacherId).update({
            classIds: FieldValue.arrayUnion(docRef.id),
        });

        return {
            id: docRef.id,
            ...classData,
        };
    } catch (error) {
        console.error('Error creating class:', error);
        throw error;
    }
}

/**
 * Get class by code
 */
export async function getClassByCode(classCode: string): Promise<Class | null> {
    await chaos.checkChaos('firestoreRead');
    try {
        const snapshot = await db
            .collection('classes')
            .where('classCode', '==', classCode)
            .where('isActive', '==', true)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        const data = doc.data();

        return {
            id: doc.id,
            classCode: data.classCode,
            className: data.className,
            teacherId: data.teacherId,
            teacherName: data.teacherName,
            subject: data.subject,
            grade: data.grade,
            studentIds: data.studentIds || [],
            createdAt: data.createdAt?.toDate() || new Date(),
            isActive: data.isActive,
        };
    } catch (error) {
        console.error('Error fetching class by code:', error);
        throw error;
    }
}

/**
 * Get teacher's classes
 */
export async function getTeacherClasses(teacherId: string): Promise<Class[]> {
    await chaos.checkChaos('firestoreRead');
    try {
        const snapshot = await db
            .collection('classes')
            .where('teacherId', '==', teacherId)
            .where('isActive', '==', true)
            .get();

        return snapshot.docs.map((doc: any) => {
            const data = doc.data();
            return {
                id: doc.id,
                classCode: data.classCode,
                className: data.className,
                teacherId: data.teacherId,
                teacherName: data.teacherName,
                subject: data.subject,
                grade: data.grade,
                studentIds: data.studentIds || [],
                createdAt: data.createdAt?.toDate() || new Date(),
                isActive: data.isActive,
            };
        });
    } catch (error) {
        console.error('Error fetching teacher classes:', error);
        throw error;
    }
}

/**
 * Add student to class
 */
export async function addStudentToClass(studentId: string, classCode: string): Promise<void> {
    await chaos.checkChaos('firestoreWrite');
    try {
        const classDoc = await getClassByCode(classCode);

        if (!classDoc || !classDoc.id) {
            throw new Error('Class not found');
        }

        const batch = db.batch();

        // Check if student is already in a class and remove them if so
        const student = await getStudent(studentId);
        if (student?.classId) {
            // Only remove if it's a different class
            if (student.classId !== classDoc.id) {
                // Pass the batch so removal is part of the atomic update
                await removeStudentFromClass(studentId, student.classId, batch);
            } else {
                // Already in this class, nothing to do
                return;
            }
        }

        // Add student to new class
        const classRef = db.collection('classes').doc(classDoc.id);
        batch.update(classRef, {
            studentIds: FieldValue.arrayUnion(studentId),
        });

        // Update student document
        const studentRef = db.collection('students').doc(studentId);
        batch.update(studentRef, {
            classId: classDoc.id,
            className: classDoc.className,
            classSubject: classDoc.subject,
            teacherId: classDoc.teacherId,
            teacherName: classDoc.teacherName,
            grade: classDoc.grade,
            joinedClassAt: FieldValue.serverTimestamp(),
        });

        // Commit all changes atomically
        await batch.commit();
    } catch (error) {
        console.error('Error adding student to class:', error);
        throw error;
    }
}

/**
 * Remove student from class
 */
export async function removeStudentFromClass(
    studentId: string,
    classId: string,
    batch?: WriteBatch
): Promise<void> {
    await chaos.checkChaos('firestoreWrite');
    try {
        const writeBatch = batch || db.batch();

        // Remove student from class document
        const classRef = db.collection('classes').doc(classId);
        writeBatch.update(classRef, {
            studentIds: FieldValue.arrayRemove(studentId),
        });

        // Clear class info from student document
        const studentRef = db.collection('students').doc(studentId);
        writeBatch.update(studentRef, {
            classId: FieldValue.delete(),
            className: FieldValue.delete(),
            classSubject: FieldValue.delete(),
            teacherId: FieldValue.delete(),
            teacherName: FieldValue.delete(),
            grade: FieldValue.delete(),
            joinedClassAt: FieldValue.delete(),
        });

        // Only commit if we created the batch
        if (!batch) {
            await writeBatch.commit();
        }
    } catch (error) {
        console.error('Error removing student from class:', error);
        throw error;
    }
}

/**
 * Get students in a class
 */
export async function getStudentsInClass(classId: string): Promise<Student[]> {
    await chaos.checkChaos('firestoreRead');
    try {
        const snapshot = await db
            .collection('students')
            .where('classId', '==', classId)
            .get();

        return snapshot.docs.map((doc: any) => {
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.userId || doc.id,
                email: data.email,
                name: data.name,
                classId: data.classId,
                className: data.className,
                classSubject: data.classSubject,
                teacherId: data.teacherId,
                grade: data.grade,
                joinedClassAt: data.joinedClassAt?.toDate(),
                registrationDate: data.registrationDate?.toDate() || new Date(),
                lastLoginDate: data.lastLoginDate?.toDate() || new Date(),
            };
        });
    } catch (error) {
        console.error('Error fetching students in class:', error);
        throw error;
    }
}

/**
 * Get all students for a teacher (across all their classes)
 */
export async function getTeacherStudents(
    teacherId: string,
    options?: { select?: string[] }
): Promise<Student[]> {
    await chaos.checkChaos('firestoreRead');
    try {
        let query = db
            .collection('students')
            .where('teacherId', '==', teacherId);

        if (options?.select && options.select.length > 0) {
            query = query.select(...options.select);
        }

        const snapshot = await query.get();

        return snapshot.docs.map((doc: any) => {
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.userId || doc.id,
                email: data.email || '',
                name: data.name || '',
                classId: data.classId,
                className: data.className,
                classSubject: data.classSubject,
                teacherId: data.teacherId,
                grade: data.grade,
                joinedClassAt: data.joinedClassAt?.toDate(),
                registrationDate: data.registrationDate?.toDate() || new Date(),
                lastLoginDate: data.lastLoginDate?.toDate() || new Date(),
            };
        });
    } catch (error) {
        console.error('Error fetching teacher students:', error);
        throw error;
    }
}

// ============================================
// Syllabus Operations
// ============================================

export interface Syllabus {
    id?: string;
    studentId: string;
    examName: string;
    title: string;
    structure: any;
    strategy: string;
    createdAt: Date;
}

/**
 * Save syllabus
 */
export async function saveSyllabus(syllabus: Omit<Syllabus, 'id'>): Promise<string> {
    await chaos.checkChaos('firestoreWrite');
    try {
        const docRef = await db.collection('syllabi').add({
            studentId: syllabus.studentId,
            examName: syllabus.examName,
            title: syllabus.title,
            structure: syllabus.structure,
            strategy: syllabus.strategy,
            createdAt: FieldValue.serverTimestamp(),
        });

        return docRef.id;
    } catch (error) {
        console.error('Error saving syllabus:', error);
        throw error;
    }
}

/**
 * Get student's syllabi
 */
export async function getStudentSyllabi(studentId: string): Promise<Syllabus[]> {
    await chaos.checkChaos('firestoreRead');
    try {
        const snapshot = await db
            .collection('syllabi')
            .where('studentId', '==', studentId)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map((doc: any) => {
            const data = doc.data();
            return {
                id: doc.id,
                studentId: data.studentId,
                examName: data.examName,
                title: data.title,
                structure: data.structure,
                strategy: data.strategy,
                createdAt: data.createdAt?.toDate() || new Date(),
            };
        });
    } catch (error) {
        console.error('Error fetching syllabi:', error);
        throw error;
    }
}

// ============================================
// Quiz Generation
// ============================================

export interface QuizGeneration {
    id?: string;
    studentId: string;
    topic: string;
    difficulty: string;
    educationLevel: string;
    numQuestions: number;
    questions: any[];
    generatedAt: Date;
}

/**
 * Save quiz generation
 */
export async function saveQuizGeneration(quiz: Omit<QuizGeneration, 'id'>): Promise<string> {
    await chaos.checkChaos('firestoreWrite');
    try {
        const docRef = await db.collection('quizGenerations').add({
            studentId: quiz.studentId,
            topic: quiz.topic,
            difficulty: quiz.difficulty,
            educationLevel: quiz.educationLevel,
            numQuestions: quiz.numQuestions,
            questions: quiz.questions,
            generatedAt: FieldValue.serverTimestamp(),
        });

        return docRef.id;
    } catch (error) {
        console.error('Error saving quiz generation:', error);
        throw error;
    }
}


/**
 * Get batched cached ML predictions
 * Fetches data in chunks to respect Firestore 'in' query limits (10).
 */
export async function getBatchedCachedPredictions(
    studentId: string,
    topics: string[]
): Promise<Map<string, MLPrediction>> {
    await chaos.checkChaos('firestoreRead');
    if (!topics.length) {
        return new Map();
    }

    // Chunk size 10 for 'in' query
    const chunkSize = 10;
    const chunks = [];
    for (let i = 0; i < topics.length; i += chunkSize) {
        chunks.push(topics.slice(i, i + chunkSize));
    }

    try {
        const resultsMap = new Map<string, MLPrediction>();
        const now = new Date();

        // Process chunks in parallel
        await Promise.all(chunks.map(async (chunk) => {
            // Optimization: Filter by expiration in query to reduce data transfer
            // Supports existing index: studentId ASC, topic ASC, expiresAt DESC
            const snapshot = await db
                .collection('mlPredictions')
                .where('studentId', '==', studentId)
                .where('topic', 'in', chunk)
                .where('expiresAt', '>', now)
                .get();

            snapshot.docs.forEach((doc: any) => {
                const data = doc.data();
                const expiresAt = data.expiresAt?.toDate() || now;

                const prediction: MLPrediction = {
                    id: doc.id,
                    studentId: data.studentId,
                    topic: data.topic,
                    masteryProbability: data.masteryProbability,
                    confidence: data.confidence,
                    daysSinceRevision: data.daysSinceRevision,
                    createdAt: data.createdAt?.toDate() || now,
                    expiresAt: expiresAt,
                };

                // Keep the one with the latest expiration (or creation)
                // If map already has this topic, check which one is newer
                if (resultsMap.has(prediction.topic)) {
                    const existing = resultsMap.get(prediction.topic)!;
                    if (prediction.createdAt > existing.createdAt) {
                        resultsMap.set(prediction.topic, prediction);
                    }
                } else {
                    resultsMap.set(prediction.topic, prediction);
                }
            });
        }));

        return resultsMap;
    } catch (error) {
        console.error('Error fetching batched cached predictions:', error);
        throw error;
    }
}
