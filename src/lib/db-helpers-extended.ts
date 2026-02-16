import { db } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { PlannerData, BrainMapNode } from './db-helpers';

// ============================================
// Planner Data Operations
// ============================================

/**
 * Add a planner item
 */
export async function addPlannerItem(item: Omit<PlannerData, 'id'>): Promise<string> {
    try {
        const docRef = await db.collection('plannerData').add({
            studentId: item.studentId,
            subject: item.subject,
            topic: item.topic,
            date: item.date,
            type: item.type,
            content: item.content,
            attachments: item.attachments || [],
            scheduledFor: item.scheduledFor || null,
            completed: false,
            completedAt: null,
            reviewDates: [],
            nextReviewDate: item.scheduledFor || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Default: 3 days from now
            reviewCount: 0,
            brainMapNodeId: item.brainMapNodeId || null,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        return docRef.id;
    } catch (error) {
        console.error('Error adding planner item:', error);
        throw error;
    }
}

/**
 * Get planner items with optional filters
 */
export async function getPlannerItems(
    studentId: string,
    filters?: {
        subject?: string;
        completed?: boolean;
        startDate?: Date;
        endDate?: Date;
    }
): Promise<PlannerData[]> {
    try {
        let query = db.collection('plannerData')
            .where('studentId', '==', studentId);

        if (filters?.subject) {
            query = query.where('subject', '==', filters.subject);
        }

        if (filters?.completed !== undefined) {
            query = query.where('completed', '==', filters.completed);
        }

        const snapshot = await query.orderBy('date', 'desc').limit(100).get();

        const items: PlannerData[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            items.push({
                id: doc.id,
                studentId: data.studentId,
                subject: data.subject,
                topic: data.topic,
                date: data.date?.toDate() || new Date(),
                type: data.type,
                content: data.content,
                attachments: data.attachments || [],
                scheduledFor: data.scheduledFor?.toDate(),
                completed: data.completed,
                completedAt: data.completedAt?.toDate(),
                reviewDates: (data.reviewDates || []).map((d: any) => d.toDate()),
                nextReviewDate: data.nextReviewDate?.toDate(),
                reviewCount: data.reviewCount || 0,
                brainMapNodeId: data.brainMapNodeId,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            });
        });

        return items;
    } catch (error) {
        console.error('Error getting planner items:', error);
        throw error;
    }
}

/**
 * Get spaced review items for a specific date
 */
export async function getSpacedReviewItems(
    studentId: string,
    date: Date
): Promise<PlannerData[]> {
    try {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const snapshot = await db.collection('plannerData')
            .where('studentId', '==', studentId)
            .where('nextReviewDate', '>=', startOfDay)
            .where('nextReviewDate', '<=', endOfDay)
            .get();

        const items: PlannerData[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            items.push({
                id: doc.id,
                studentId: data.studentId,
                subject: data.subject,
                topic: data.topic,
                date: data.date?.toDate() || new Date(),
                type: data.type,
                content: data.content,
                attachments: data.attachments || [],
                scheduledFor: data.scheduledFor?.toDate(),
                completed: data.completed,
                completedAt: data.completedAt?.toDate(),
                reviewDates: (data.reviewDates || []).map((d: any) => d.toDate()),
                nextReviewDate: data.nextReviewDate?.toDate(),
                reviewCount: data.reviewCount || 0,
                brainMapNodeId: data.brainMapNodeId,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            });
        });

        return items;
    } catch (error) {
        console.error('Error getting spaced review items:', error);
        throw error;
    }
}

/**
 * Mark planner item as complete and schedule next review
 */
export async function markPlannerItemComplete(itemId: string): Promise<void> {
    try {
        const itemDoc = await db.collection('plannerData').doc(itemId).get();

        if (!itemDoc.exists) {
            throw new Error('Planner item not found');
        }

        const data = itemDoc.data();
        const reviewCount = (data?.reviewCount || 0) + 1;

        // Spaced repetition intervals (in days): 1, 3, 7, 14, 30, 60
        const intervals = [1, 3, 7, 14, 30, 60];
        const intervalIndex = Math.min(reviewCount - 1, intervals.length - 1);
        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + intervals[intervalIndex]);

        await db.collection('plannerData').doc(itemId).update({
            completed: true,
            completedAt: FieldValue.serverTimestamp(),
            reviewCount,
            reviewDates: FieldValue.arrayUnion(new Date()),
            nextReviewDate,
            updatedAt: FieldValue.serverTimestamp(),
        });
    } catch (error) {
        console.error('Error marking planner item complete:', error);
        throw error;
    }
}

// ============================================
// Brain Map Operations
// ============================================

/**
 * Create a brain map node
 */
export async function createBrainMapNode(node: Omit<BrainMapNode, 'id'>): Promise<string> {
    try {
        const docRef = await db.collection('brainMapNodes').add({
            studentId: node.studentId,
            title: node.title,
            subject: node.subject,
            topic: node.topic,
            description: node.description || '',
            masteryLevel: node.masteryLevel || 0,
            parentNodeId: node.parentNodeId || null,
            childNodeIds: [],
            relatedNodeIds: [],
            createdAt: FieldValue.serverTimestamp(),
            lastReviewedAt: null,
            reviewCount: 0,
            quizResultIds: [],
            plannerItemIds: node.plannerItemIds || [],
            position: node.position || null,
        });

        // If has parent, add this node as child to parent
        if (node.parentNodeId) {
            await db.collection('brainMapNodes').doc(node.parentNodeId).update({
                childNodeIds: FieldValue.arrayUnion(docRef.id),
            });
        }

        return docRef.id;
    } catch (error) {
        console.error('Error creating brain map node:', error);
        throw error;
    }
}

/**
 * Get all brain map nodes for a student
 */
export async function getBrainMapNodes(studentId: string): Promise<BrainMapNode[]> {
    try {
        const snapshot = await db.collection('brainMapNodes')
            .where('studentId', '==', studentId)
            .orderBy('createdAt', 'desc')
            .get();

        const nodes: BrainMapNode[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            nodes.push({
                id: doc.id,
                studentId: data.studentId,
                title: data.title,
                subject: data.subject,
                topic: data.topic,
                description: data.description,
                masteryLevel: data.masteryLevel || 0,
                parentNodeId: data.parentNodeId,
                childNodeIds: data.childNodeIds || [],
                relatedNodeIds: data.relatedNodeIds || [],
                createdAt: data.createdAt?.toDate() || new Date(),
                lastReviewedAt: data.lastReviewedAt?.toDate(),
                reviewCount: data.reviewCount || 0,
                quizResultIds: data.quizResultIds || [],
                plannerItemIds: data.plannerItemIds || [],
                position: data.position,
            });
        });

        return nodes;
    } catch (error) {
        console.error('Error getting brain map nodes:', error);
        throw error;
    }
}

/**
 * Get a brain map node with its children and related nodes
 */
export async function getBrainMapNodeWithChildren(nodeId: string): Promise<{
    node: BrainMapNode;
    children: BrainMapNode[];
    related: BrainMapNode[];
}> {
    try {
        const nodeDoc = await db.collection('brainMapNodes').doc(nodeId).get();

        if (!nodeDoc.exists) {
            throw new Error('Brain map node not found');
        }

        const data = nodeDoc.data();
        const node: BrainMapNode = {
            id: nodeDoc.id,
            studentId: data?.studentId || '',
            title: data?.title || '',
            subject: data?.subject || '',
            topic: data?.topic || '',
            description: data?.description,
            masteryLevel: data?.masteryLevel || 0,
            parentNodeId: data?.parentNodeId,
            childNodeIds: data?.childNodeIds || [],
            relatedNodeIds: data?.relatedNodeIds || [],
            createdAt: data?.createdAt?.toDate() || new Date(),
            lastReviewedAt: data?.lastReviewedAt?.toDate(),
            reviewCount: data?.reviewCount || 0,
            quizResultIds: data?.quizResultIds || [],
            plannerItemIds: data?.plannerItemIds || [],
            position: data?.position,
        };

        // Get children
        const children: BrainMapNode[] = [];
        if (node.childNodeIds.length > 0) {
            const childrenSnapshot = await db.collection('brainMapNodes')
                .where('__name__', 'in', node.childNodeIds)
                .get();

            childrenSnapshot.forEach(doc => {
                const childData = doc.data();
                children.push({
                    id: doc.id,
                    studentId: childData.studentId,
                    title: childData.title,
                    subject: childData.subject,
                    topic: childData.topic,
                    description: childData.description,
                    masteryLevel: childData.masteryLevel || 0,
                    parentNodeId: childData.parentNodeId,
                    childNodeIds: childData.childNodeIds || [],
                    relatedNodeIds: childData.relatedNodeIds || [],
                    createdAt: childData.createdAt?.toDate() || new Date(),
                    lastReviewedAt: childData.lastReviewedAt?.toDate(),
                    reviewCount: childData.reviewCount || 0,
                    quizResultIds: childData.quizResultIds || [],
                    plannerItemIds: childData.plannerItemIds || [],
                    position: childData.position,
                });
            });
        }

        // Get related nodes
        const related: BrainMapNode[] = [];
        if (node.relatedNodeIds.length > 0) {
            const relatedSnapshot = await db.collection('brainMapNodes')
                .where('__name__', 'in', node.relatedNodeIds)
                .get();

            relatedSnapshot.forEach(doc => {
                const relatedData = doc.data();
                related.push({
                    id: doc.id,
                    studentId: relatedData.studentId,
                    title: relatedData.title,
                    subject: relatedData.subject,
                    topic: relatedData.topic,
                    description: relatedData.description,
                    masteryLevel: relatedData.masteryLevel || 0,
                    parentNodeId: relatedData.parentNodeId,
                    childNodeIds: relatedData.childNodeIds || [],
                    relatedNodeIds: relatedData.relatedNodeIds || [],
                    createdAt: relatedData.createdAt?.toDate() || new Date(),
                    lastReviewedAt: relatedData.lastReviewedAt?.toDate(),
                    reviewCount: relatedData.reviewCount || 0,
                    quizResultIds: relatedData.quizResultIds || [],
                    plannerItemIds: relatedData.plannerItemIds || [],
                    position: relatedData.position,
                });
            });
        }

        return { node, children, related };
    } catch (error) {
        console.error('Error getting brain map node with children:', error);
        throw error;
    }
}

/**
 * Update node mastery level
 */
export async function updateNodeMastery(nodeId: string, masteryLevel: number): Promise<void> {
    try {
        await db.collection('brainMapNodes').doc(nodeId).update({
            masteryLevel,
            lastReviewedAt: FieldValue.serverTimestamp(),
            reviewCount: FieldValue.increment(1),
        });
    } catch (error) {
        console.error('Error updating node mastery:', error);
        throw error;
    }
}

/**
 * Convert planner item to brain map node
 */
export async function convertPlannerToBrainMapNode(
    plannerItemId: string,
    parentNodeId?: string
): Promise<string> {
    try {
        // Get planner item
        const plannerDoc = await db.collection('plannerData').doc(plannerItemId).get();

        if (!plannerDoc.exists) {
            throw new Error('Planner item not found');
        }

        const plannerData = plannerDoc.data();

        // Check if already has a brain map node
        if (plannerData?.brainMapNodeId) {
            return plannerData.brainMapNodeId;
        }

        // Find parent node by subject if not provided
        let resolvedParentNodeId = parentNodeId;
        if (!resolvedParentNodeId && plannerData?.subject) {
            const parentSnapshot = await db.collection('brainMapNodes')
                .where('studentId', '==', plannerData.studentId)
                .where('subject', '==', plannerData.subject)
                .where('parentNodeId', '==', null)
                .limit(1)
                .get();

            if (!parentSnapshot.empty) {
                resolvedParentNodeId = parentSnapshot.docs[0].id;
            } else {
                // Create subject root node if doesn't exist
                const subjectNodeId = await createBrainMapNode({
                    studentId: plannerData.studentId,
                    title: plannerData.subject,
                    subject: plannerData.subject,
                    topic: 'Root',
                    description: `Main node for ${plannerData.subject}`,
                    masteryLevel: 0,
                    childNodeIds: [],
                    relatedNodeIds: [],
                    createdAt: new Date(),
                    reviewCount: 0,
                    quizResultIds: [],
                    plannerItemIds: [],
                });
                resolvedParentNodeId = subjectNodeId;
            }
        }

        // Create brain map node from planner item
        const nodeId = await createBrainMapNode({
            studentId: plannerData?.studentId || '',
            title: plannerData?.topic || '',
            subject: plannerData?.subject || '',
            topic: plannerData?.topic || '',
            description: plannerData?.content || '',
            masteryLevel: 0,
            parentNodeId: resolvedParentNodeId,
            childNodeIds: [],
            relatedNodeIds: [],
            createdAt: new Date(),
            reviewCount: 0,
            quizResultIds: [],
            plannerItemIds: [plannerItemId],
        });

        // Link planner item to brain map node
        await db.collection('plannerData').doc(plannerItemId).update({
            brainMapNodeId: nodeId,
            updatedAt: FieldValue.serverTimestamp(),
        });

        return nodeId;
    } catch (error) {
        console.error('Error converting planner to brain map node:', error);
        throw error;
    }
}
