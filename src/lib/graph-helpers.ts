import { db } from './firebase-admin';
import { GraphData, GraphNode, GraphLink, NodeType } from '@/data/docsData';
import { getQuizResults, getTeacherStudents, getBatchedQuizResults } from './db-helpers';

/**
 * Fetch and generate personal graph data for a student
 */
export async function fetchStudentGraphData(studentId: string): Promise<GraphData> {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const colors: Record<NodeType, string> = {
        student: '#9333EA', subject: '#3B82F6', chapter: '#06B6D4',
        topic: '#6B7280', weakness: '#EF4444', strength: '#10B981',
        skill: '#F59E0B', peer: '#8B5CF6'
    };

    try {
        // 1. Fetch Student Data
        const studentDoc = await db.collection('students').doc(studentId).get();
        if (!studentDoc.exists) return { nodes: [], links: [] };
        const student = studentDoc.data();

        // Central Node
        nodes.push({
            id: studentId,
            name: student?.name || 'Me',
            val: 20,
            type: 'student',
            color: colors.student
        });

        // 2. Fetch Quiz Results & Mastery
        const quizResults = await getQuizResults(studentId, 100);
        const topicStats = new Map<string, { total: number, count: number }>();

        quizResults.forEach(r => {
            const current = topicStats.get(r.topic) || { total: 0, count: 0 };
            topicStats.set(r.topic, {
                total: current.total + r.score,
                count: current.count + 1
            });
        });

        // Track IDs we've already added to avoid duplicates
        const addedNodeIds = new Set<string>([studentId]);

        // 3. Generate Nodes from Quiz Topics
        topicStats.forEach((stats, topic) => {
            const avgScore = stats.total / stats.count;
            const topicId = `topic-${topic.replace(/\s+/g, '-').toLowerCase()}`;

            if (addedNodeIds.has(topicId)) return;
            addedNodeIds.add(topicId);

            // Topic Node
            nodes.push({
                id: topicId,
                name: topic,
                val: 10 + (avgScore * 5),
                type: 'topic',
                color: avgScore > 0.8 ? colors.strength : (avgScore < 0.4 ? colors.weakness : colors.topic),
                mastery: avgScore
            });

            // Link to Student
            links.push({
                source: studentId,
                target: topicId,
                type: 'topic'
            });

            // If strength/weakness, add indicator node
            if (avgScore > 0.85) {
                const id = `${topicId}-strength`;
                nodes.push({ id, name: 'Strong', val: 5, type: 'strength', color: colors.strength });
                links.push({ source: topicId, target: id, type: 'hierarchy' });
            } else if (avgScore < 0.4) {
                const id = `${topicId}-weakness`;
                nodes.push({ id, name: 'Needs Focus', val: 5, type: 'weakness', color: colors.weakness });
                links.push({ source: topicId, target: id, type: 'hierarchy' });
            }
        });

        // 4. Fetch Brain Map Nodes (from study materials converted to brain map)
        try {
            const brainMapSnapshot = await db.collection('brainMapNodes')
                .where('studentId', '==', studentId)
                .get();

            const subjectNodes = new Map<string, string>(); // subject -> node ID

            brainMapSnapshot.docs.forEach((doc: any) => {
                const data = doc.data();
                const bmNodeId = `bm-${doc.id}`;

                if (addedNodeIds.has(bmNodeId)) return;
                addedNodeIds.add(bmNodeId);

                // Subject root nodes
                if (!data.parentNodeId && data.subject) {
                    const subjectId = `subject-${data.subject.replace(/\s+/g, '-').toLowerCase()}`;
                    if (!addedNodeIds.has(subjectId)) {
                        addedNodeIds.add(subjectId);
                        subjectNodes.set(data.subject, subjectId);
                        nodes.push({
                            id: subjectId,
                            name: data.subject,
                            val: 15,
                            type: 'subject',
                            color: colors.subject
                        });
                        links.push({
                            source: studentId,
                            target: subjectId,
                            type: 'hierarchy'
                        });
                    }
                }

                // Topic nodes from brain map
                if (data.topic && data.topic !== 'Root') {
                    nodes.push({
                        id: bmNodeId,
                        name: data.title || data.topic,
                        val: 8 + (data.masteryLevel || 0) * 4,
                        type: 'topic',
                        color: (data.masteryLevel || 0) > 0.8 ? colors.strength :
                            (data.masteryLevel || 0) < 0.4 ? colors.weakness : colors.chapter,
                        mastery: data.masteryLevel || 0
                    });

                    // Link to parent subject or student
                    const parentSubjectId = subjectNodes.get(data.subject);
                    links.push({
                        source: parentSubjectId || studentId,
                        target: bmNodeId,
                        type: 'topic'
                    });
                }
            });
        } catch (bmError) {
            console.warn('Could not fetch brain map nodes:', bmError);
            // Non-fatal: graph still shows quiz-based nodes
        }

        return { nodes, links };
    } catch (error) {
        console.error('Error generating student graph:', error);
        return { nodes: [], links: [] };
    }
}

/**
 * Fetch and generate network graph for a teacher's class
 */
export async function fetchTeacherGraphData(teacherId: string): Promise<GraphData> {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const colors: Record<NodeType, string> = {
        student: '#9333EA', subject: '#3B82F6', chapter: '#06B6D4',
        topic: '#6B7280', weakness: '#EF4444', strength: '#10B981',
        skill: '#F59E0B', peer: '#8B5CF6'
    };

    try {
        const students = await getTeacherStudents(teacherId, {
            select: ['userId', 'name']
        });
        const topicNodes = new Map<string, string>(); // Name -> ID

        // Batch fetch quiz results
        const studentIds = students.map(s => s.id);
        const quizResultsMap = await getBatchedQuizResults(studentIds, 20);
        const existingLinks = new Set<string>();

        // Create Student Nodes
        for (const student of students) {
            nodes.push({
                id: student.id,
                name: student.name,
                val: 15,
                type: 'student',
                color: colors.student
            });

            // Get their recent activity
            const results = quizResultsMap.get(student.id) || [];

            // Link to Topics
            results.forEach(r => {
                const topicId = `topic-${r.topic.replace(/\s+/g, '-').toLowerCase()}`;

                if (!topicNodes.has(r.topic)) {
                    topicNodes.set(r.topic, topicId);
                    nodes.push({
                        id: topicId,
                        name: r.topic,
                        val: 10,
                        type: 'topic',
                        color: colors.topic
                    });
                }

                // Avoid duplicate links
                // Use a sorted key to handle undirected edges efficiently
                const s = student.id;
                const t = topicId;
                const key = s < t ? `${s}-${t}` : `${t}-${s}`;

                if (!existingLinks.has(key)) {
                    existingLinks.add(key);
                    links.push({
                        source: student.id,
                        target: topicId,
                        type: 'topic'
                    });
                }
            });
        }

        return { nodes, links };
    } catch (error) {
        console.error('Error generating teacher graph:', error);
        return { nodes: [], links: [] };
    }
}
