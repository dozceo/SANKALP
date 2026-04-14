import { StudentNode, GraphData, GraphNode, GraphLink } from '@/data/docsData';
import { studentsData } from '@/data/studentsDataStatic';
import { lightenColor } from '@/lib/color-utils';

// Optimization: Cache student map for O(1) lookups
let studentMapCache: Map<string, StudentNode> | null = null;
let lastDataLength = 0;

function getStudentById(id: string): StudentNode | undefined {
    // Rebuild cache if data length changes (simple invalidation)
    if (!studentMapCache || studentsData.length !== lastDataLength) {
        studentMapCache = new Map();
        studentsData.forEach(s => studentMapCache!.set(s.id, s));
        lastDataLength = studentsData.length;
    }
    return studentMapCache.get(id);
}

// Node colors by type (Moved outside to avoid re-creation)
import { GRAPH_COLORS_HEX } from '@/lib/styles/graph-tokens';

const NODE_COLORS = {
    student: GRAPH_COLORS_HEX.student,
    subject: GRAPH_COLORS_HEX.subject,
    chapter: GRAPH_COLORS_HEX.chapter,
    topic: GRAPH_COLORS_HEX.topic,
    weakness: GRAPH_COLORS_HEX.weakness,
    strength: GRAPH_COLORS_HEX.strength,
    peer: GRAPH_COLORS_HEX.peer,
};

/**
 * Generate personal knowledge graph for a single student
 * Shows: Student → Study Materials (Subjects/Chapters/Topics) + Strengths + Weaknesses + Study Group
 */
export function generatePersonalGraph(student: StudentNode): GraphData {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const existingNodeIds = new Set<string>();

    const addNode = (node: GraphNode) => {
        if (!existingNodeIds.has(node.id)) {
            // Optimization: Pre-calculate light color
            if (node.color && !node.lightColor) {
                node.lightColor = lightenColor(node.color, 20);
            }
            nodes.push(node);
            existingNodeIds.add(node.id);
        }
    };

    // 1. Central student node
    addNode({
        id: student.id,
        name: student.name,
        val: 20,
        type: 'student',
        color: NODE_COLORS.student,
    });

    // 2. Study Materials from Planner (Hierarchical: Subjects → Chapters → Topics)
    if (student.subjects && student.subjects.length > 0) {
        student.subjects.forEach(subject => {
            const subjectId = `${student.id}-subject-${subject.id}`;

            // Create subject node
            addNode({
                id: subjectId,
                name: subject.name,
                val: 15,
                type: 'subject',
                color: subject.color || NODE_COLORS.subject,
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
                    addNode({
                        id: chapterId,
                        name: chapter.name,
                        val: 12,
                        type: 'chapter',
                        color: NODE_COLORS.chapter,
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
                            addNode({
                                id: topicId,
                                name: topic.name,
                                val: 10,
                                type: 'topic',
                                color: NODE_COLORS.topic,
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
            addNode({
                id: strengthId,
                name: `✓ ${strength}`,
                val: 10,
                type: 'strength',
                color: NODE_COLORS.strength,
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
            addNode({
                id: weaknessId,
                name: `⚠️ ${weakness}`,
                val: 10,
                type: 'weakness',
                color: NODE_COLORS.weakness,
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
            // Optimization: Use Map lookup instead of O(N) find
            const peer = getStudentById(peerId);
            if (peer) {
                // Add peer node (smaller than center student)
                // addNode checks for duplicates automatically
                addNode({
                    id: peer.id,
                    name: peer.name,
                    val: 12,
                    type: 'student',
                    color: NODE_COLORS.peer,
                });

                // Link to peer
                // We don't check for duplicate links here as peers are usually unique in the connections list
                // But duplicate check in addNode prevents duplicate nodes
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
