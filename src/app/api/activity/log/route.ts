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

            // Process each event in the batch
            const processedIds = [];
            for (const event of body.events) {
                if (!event.studentId) {
                    console.warn('⚠️ [Activity Log] Event missing studentId, skipping:', event);
                    continue;
                }

                const logRef = await db.collection('activityLogs').add({
                    studentId: event.studentId,
                    sessionId: event.sessionId || null,
                    timestamp: FieldValue.serverTimestamp(),
                    eventId: event.id,
                    action: event.action,
                    timing: event.timing,
                    data: event.data || {},
                    metadata: event.metadata || {},
                });

                processedIds.push(logRef.id);
            }

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
