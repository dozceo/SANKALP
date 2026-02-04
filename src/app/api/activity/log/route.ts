import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
    try {
        // Parse request body with better error handling
        const body = await req.json().catch(() => null);

        if (!body) {
            console.error('❌ [Activity Log] No JSON body received');
            return NextResponse.json(
                { error: 'Invalid JSON' },
                { status: 400 }
            );
        }

        // Check if this is a batch request (from EventTracker)
        if (body.events && Array.isArray(body.events)) {
            console.log(`📦 [Activity Log] Batch request with ${body.events.length} events`);

            // Process each event in the batch (Optimized with Batched Writes)
            const events = body.events;
            const processedIds: string[] = [];
            const BATCH_SIZE = 500;

            const chunks = [];
            for (let i = 0; i < events.length; i += BATCH_SIZE) {
                chunks.push(events.slice(i, i + BATCH_SIZE));
            }

            const chunkResults = await Promise.all(chunks.map(async (chunk) => {
                const batch = db.batch();
                const chunkIds: string[] = [];

                for (const event of chunk) {
                    if (!event.studentId) {
                        console.warn('⚠️ [Activity Log] Event missing studentId, skipping:', event);
                        continue;
                    }

                    const logRef = db.collection('activityLogs').doc();
                    batch.set(logRef, {
                        studentId: event.studentId,
                        sessionId: event.sessionId || null,
                        timestamp: FieldValue.serverTimestamp(),
                        eventId: event.id,
                        action: event.action,
                        timing: event.timing,
                        data: event.data || {},
                        metadata: event.metadata || {},
                    });

                    chunkIds.push(logRef.id);
                }

                if (chunkIds.length > 0) {
                    await batch.commit();
                }
                return chunkIds;
            }));

            chunkResults.forEach(ids => processedIds.push(...ids));

            return NextResponse.json({
                success: true,
                processed: processedIds.length,
                logIds: processedIds,
            }, { status: 201 });
        }

        // Legacy single request format (for backwards compatibility)
        const { studentId, sessionId, activityType, details } = body;

        if (!studentId || !activityType) {
            console.error('❌ [Activity Log] Invalid payload:', JSON.stringify(body, null, 2));
            return NextResponse.json(
                { error: 'Missing required fields: studentId, activityType' },
                { status: 400 }
            );
        }

        // Log activity
        const logRef = await db.collection('activityLogs').add({
            studentId,
            sessionId: sessionId || null,
            timestamp: FieldValue.serverTimestamp(),
            activityType,
            details: details || {},
            metadata: {
                deviceType: req.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop',
                browser: req.headers.get('user-agent') || 'unknown',
            },
        });

        // If session exists, update session metrics
        if (sessionId) {
            const sessionDoc = await db.collection('sankalpSessions').doc(sessionId).get();

            if (sessionDoc.exists) {
                const updates: any = {};

                // Update activity completion flags
                if (activityType === 'planner_add_topic') {
                    updates['activitiesCompleted.addedClassData'] = true;
                    updates['dataEntryMetrics.topicsAdded'] = FieldValue.increment(1);
                } else if (activityType === 'brainmap_create_node') {
                    updates['activitiesCompleted.updatedBrainMap'] = true;
                    updates['dataEntryMetrics.nodesCreated'] = FieldValue.increment(1);
                } else if (activityType === 'chat_send_message') {
                    updates['activitiesCompleted.chatWithMentor'] = true;
                    updates['dataEntryMetrics.chatMessages'] = FieldValue.increment(1);
                }

                // Update time breakdown
                if (details?.timeSpent) {
                    if (activityType.startsWith('planner')) {
                        updates['timeBreakdown.plannerTime'] = FieldValue.increment(details.timeSpent);
                    } else if (activityType.startsWith('brainmap')) {
                        updates['timeBreakdown.brainMapTime'] = FieldValue.increment(details.timeSpent);
                    } else if (activityType.startsWith('chat')) {
                        updates['timeBreakdown.chatTime'] = FieldValue.increment(details.timeSpent);
                    } else if (activityType.startsWith('quiz')) {
                        updates['timeBreakdown.quizTime'] = FieldValue.increment(details.timeSpent);
                    }
                }

                if (Object.keys(updates).length > 0) {
                    await db.collection('sankalpSessions').doc(sessionId).update(updates);
                }
            }
        }

        return NextResponse.json({
            success: true,
            logId: logRef.id,
        }, { status: 201 });
    } catch (error) {
        console.error('❌ [Activity Log] Error logging activity:', error);
        return NextResponse.json(
            { error: 'Failed to log activity' },
            { status: 500 }
        );
    }
}
