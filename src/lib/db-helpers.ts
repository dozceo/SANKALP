/**
 * Database Helper Functions
 * 
 * Centralized database operations for SANKALP.
 * Uses Firebase Admin SDK for server-side operations.
 */

import { db } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

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

        return snapshot.docs.map((doc) => {
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
                .where('studentId', 'in', chunk);

            if (options?.select && options.select.length > 0) {
                query = query.select(...options.select);
            }

            // We fetch all and sort in memory to be safe and avoid composite index requirements
            // and to correctly apply per-student limits
            const snapshot = await query.get();

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const result: QuizResult = {
                    id: doc.id,
                    studentId: data.studentId,
                    topic: data.topic,
                    score: data.score,
                    timeSpent: data.timeSpent,
                    questionsAttempted: data.questionsAttempted,
                    timestamp: data.timestamp?.toDate() || new Date(),
                };

                const existing = resultsMap.get(result.studentId) || [];
                existing.push(result);
                resultsMap.set(result.studentId, existing);
            });
        }));

        // Sort and slice per student
        resultsMap.forEach((results, studentId) => {
            // Sort by timestamp desc
            results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

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

// ============================================
// ADK Decisions (Audit Trail)
// ============================================

/**
 * Save ADK decision
 */
export async function saveADKDecision(decision: Omit<ADKDecision, 'id'>): Promise<string> {
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
 * Get recent ADK decisions for a student
 */
export async function getADKDecisions(
    studentId: string,
    limit: number = 50
): Promise<ADKDecision[]> {
    try {
        const snapshot = await db
            .collection('adkDecisions')
            .where('studentId', '==', studentId)
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map((doc) => {
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
    try {
        const snapshot = await db
            .collection('teacherInterventions')
            .where('studentId', '==', studentId)
            .where('resolved', '==', false)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map((doc) => {
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
    try {
        const snapshot = await db
            .collection('classes')
            .where('teacherId', '==', teacherId)
            .where('isActive', '==', true)
            .get();

        return snapshot.docs.map((doc) => {
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
    try {
        const classDoc = await getClassByCode(classCode);

        if (!classDoc || !classDoc.id) {
            throw new Error('Class not found');
        }

        // Check if student is already in a class and remove them if so
        const student = await getStudent(studentId);
        if (student?.classId) {
            // Only remove if it's a different class
            if (student.classId !== classDoc.id) {
                await removeStudentFromClass(studentId, student.classId);
            } else {
                // Already in this class, nothing to do
                return;
            }
        }

        // Add student to new class
        await db.collection('classes').doc(classDoc.id).update({
            studentIds: FieldValue.arrayUnion(studentId),
        });

        // Update student document
        await db.collection('students').doc(studentId).update({
            classId: classDoc.id,
            className: classDoc.className,
            classSubject: classDoc.subject,
            teacherId: classDoc.teacherId,
            teacherName: classDoc.teacherName,
            grade: classDoc.grade,
            joinedClassAt: FieldValue.serverTimestamp(),
        });
    } catch (error) {
        console.error('Error adding student to class:', error);
        throw error;
    }
}

/**
 * Remove student from class
 */
export async function removeStudentFromClass(studentId: string, classId: string): Promise<void> {
    try {
        // Remove student from class document
        await db.collection('classes').doc(classId).update({
            studentIds: FieldValue.arrayRemove(studentId),
        });

        // Clear class info from student document
        await db.collection('students').doc(studentId).update({
            classId: FieldValue.delete(),
            className: FieldValue.delete(),
            classSubject: FieldValue.delete(),
            teacherId: FieldValue.delete(),
            teacherName: FieldValue.delete(),
            grade: FieldValue.delete(),
            joinedClassAt: FieldValue.delete(),
        });
    } catch (error) {
        console.error('Error removing student from class:', error);
        throw error;
    }
}

/**
 * Get students in a class
 */
export async function getStudentsInClass(classId: string): Promise<Student[]> {
    try {
        const snapshot = await db
            .collection('students')
            .where('classId', '==', classId)
            .get();

        return snapshot.docs.map((doc) => {
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
    try {
        let query = db
            .collection('students')
            .where('teacherId', '==', teacherId);

        if (options?.select && options.select.length > 0) {
            query = query.select(...options.select);
        }

        const snapshot = await query.get();

        return snapshot.docs.map((doc) => {
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
    try {
        const snapshot = await db
            .collection('syllabi')
            .where('studentId', '==', studentId)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map((doc) => {
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

