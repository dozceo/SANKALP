import { StudentNode, GraphData, GraphNode, GraphLink } from '@/data/docsData';
import { studentsData } from '@/data/studentsDataStatic';

/**
 * Generate personal knowledge graph for a single student
 * Shows: Student → Study Materials (Subjects/Chapters/Topics) + Strengths + Weaknesses + Study Group
 */
export function generatePersonalGraph(student: StudentNode): GraphData {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    // Node colors by type
    const colors = {
        student: '#9333EA',      // Purple
        subject: '#3B82F6',      // Blue
        chapter: '#06B6D4',      // Cyan
        topic: '#6B7280',        // Gray
        weakness: '#EF4444',     // Red
        strength: '#10B981',     // Green
        peer: '#8B5CF6',         // Light Purple
    };

    // 1. Central student node
    nodes.push({
        id: student.id,
        name: student.name,
        val: 20,
        type: 'student',
        color: colors.student,
    });

    // 2. Study Materials from Planner (Hierarchical: Subjects → Chapters → Topics)
    if (student.subjects && student.subjects.length > 0) {
        student.subjects.forEach(subject => {
            const subjectId = `${student.id}-subject-${subject.id}`;

            // Create subject node
            nodes.push({
                id: subjectId,
                name: subject.name,
                val: 15,
                type: 'subject',
                color: subject.color || colors.subject,
                parent: student.id,
            });

            // Link student to subject
            links.push({
                source: student.id,
                target: subjectId,
                type: 'subject',
            });

            // Process chapters
            if (subject.chapters) {
                subject.chapters.forEach(chapter => {
                    const chapterId = `${subjectId}-chapter-${chapter.id}`;

                    // Create chapter node
                    nodes.push({
                        id: chapterId,
                        name: chapter.name,
                        val: 12,
                        type: 'chapter',
                        color: colors.chapter,
                        parent: subjectId,
                    });

                    // Link subject to chapter
                    links.push({
                        source: subjectId,
                        target: chapterId,
                        type: 'chapter',
                    });

                    // Process topics
                    if (chapter.topics) {
                        chapter.topics.forEach(topic => {
                            const topicId = `${chapterId}-topic-${topic.id}`;

                            // Create topic node
                            nodes.push({
                                id: topicId,
                                name: topic.name,
                                val: 10,
                                type: 'topic',
                                color: colors.topic,
                                mastery: topic.mastery,
                                parent: chapterId,
                            });

                            // Link chapter to topic
                            links.push({
                                source: chapterId,
                                target: topicId,
                                type: 'hierarchy',
                            });
                        });
                    }
                });
            }
        });
    }

    // 3. Strengths (Green nodes)
    if (student.strengths && student.strengths.length > 0) {
        student.strengths.forEach((strength, index) => {
            const strengthId = `${student.id}-strength-${index}`;
            nodes.push({
                id: strengthId,
                name: `✓ ${strength}`,
                val: 10,
                type: 'strength',
                color: colors.strength,
            });
            links.push({
                source: student.id,
                target: strengthId,
                type: 'hierarchy',
            });
        });
    }

    // 4. Weaknesses (Red nodes)
    if (student.weaknesses && student.weaknesses.length > 0) {
        student.weaknesses.forEach((weakness, index) => {
            const weaknessId = `${student.id}-weakness-${index}`;
            nodes.push({
                id: weaknessId,
                name: `⚠️ ${weakness}`,
                val: 10,
                type: 'weakness',
                color: colors.weakness,
            });
            links.push({
                source: student.id,
                target: weaknessId,
                type: 'hierarchy',
            });
        });
    }

    // 5. Study Group (Peer Connections)
    if (student.connections && student.connections.length > 0) {
        student.connections.forEach(peerId => {
            const peer = studentsData.find(s => s.id === peerId);
            if (peer) {
                // Add peer node (smaller than center student)
                nodes.push({
                    id: peer.id,
                    name: peer.name,
                    val: 12,
                    type: 'student',
                    color: colors.peer,
                });

                // Link to peer
                links.push({
                    source: student.id,
                    target: peer.id,
                    type: 'peer',
                });
            }
        });
    }

    return { nodes, links };
}
