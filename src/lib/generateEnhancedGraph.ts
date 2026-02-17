import { StudentNode, GraphData, GraphNode, GraphLink, NodeType } from '@/data/docsData';
import { lightenColor } from '@/lib/color-utils';

/**
 * Enhanced graph generation with hierarchical node support
 * Shows: Students → Subjects → Chapters → Topics → Weaknesses/Strengths
 */
export function generateEnhancedGraphData(students: StudentNode[]): GraphData {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    // Optimization: Use Sets for O(1) lookups instead of O(N) array searches
    const existingNodeIds = new Set<string>();
    const existingLinkKeys = new Set<string>();

    // Node colors by type
    const colors: Record<NodeType, string> = {
        student: GRAPH_COLORS_HEX.student,
        subject: GRAPH_COLORS_HEX.subject,
        chapter: GRAPH_COLORS_HEX.chapter,
        topic: GRAPH_COLORS_HEX.topic,
        weakness: GRAPH_COLORS_HEX.weakness,
        strength: GRAPH_COLORS_HEX.strength,
        skill: GRAPH_COLORS_HEX.skill,
        peer: GRAPH_COLORS_HEX.peer,
    };

    const addNode = (node: GraphNode) => {
        // Optimization: Prevent duplicate nodes
        if (!existingNodeIds.has(node.id)) {
            // Optimization: Pre-calculate light color to avoid runtime calculation during render
            if (node.color && !node.lightColor) {
                node.lightColor = lightenColor(node.color, 20);
            }
            nodes.push(node);
            existingNodeIds.add(node.id);
        }
    };

    const addLink = (link: GraphLink, checkExists = false) => {
        if (checkExists) {
            // Store link key as "minId-maxId" to handle undirected check
            const s = String(link.source);
            const t = String(link.target);
            const key = s < t ? `${s}-${t}` : `${t}-${s}`;

            if (existingLinkKeys.has(key)) return;
            existingLinkKeys.add(key);
        }
        links.push(link);
    };

    students.forEach(student => {
        // Create student node
        addNode({
            id: student.id,
            name: student.name,
            val: 20,                // Largest node
            type: 'student',
            color: colors.student,
        });

        // If student has hierarchical subjects data, use it
        if (student.subjects && student.subjects.length > 0) {
            student.subjects.forEach(subject => {
                const subjectId = `${student.id}-subject-${subject.id}`;

                // Create subject node
                addNode({
                    id: subjectId,
                    name: subject.name,
                    val: 15,
                    type: 'subject',
                    color: subject.color || colors.subject,
                    parent: student.id,
                });

                // Link student to subject
                addLink({
                    source: student.id,
                    target: subjectId,
                    type: 'subject',
                });

                // Process chapters
                subject.chapters.forEach(chapter => {
                    const chapterId = `${subjectId}-chapter-${chapter.id}`;

                    // Create chapter node
                    addNode({
                        id: chapterId,
                        name: chapter.name,
                        val: 12,
                        type: 'chapter',
                        color: colors.chapter,
                        parent: subjectId,
                    });

                    // Link subject to chapter
                    addLink({
                        source: subjectId,
                        target: chapterId,
                        type: 'chapter',
                    });

                    // Process topics
                    chapter.topics.forEach(topic => {
                        const topicId = `${chapterId}-topic-${topic.id}`;

                        // Create topic node
                        addNode({
                            id: topicId,
                            name: topic.name,
                            val: 10,
                            type: 'topic',
                            color: colors.topic,
                            mastery: topic.mastery,
                            parent: chapterId,
                        });

                        // Link chapter to topic
                        addLink({
                            source: chapterId,
                            target: topicId,
                            type: 'hierarchy',
                        });

                        // Create weakness node if applicable
                        if (topic.isWeakness) {
                            const weaknessId = `${topicId}-weakness`;
                            addNode({
                                id: weaknessId,
                                name: `⚠️ ${topic.name}`,
                                val: 8,
                                type: 'weakness',
                                color: colors.weakness,
                                parent: topicId,
                            });

                            addLink({
                                source: topicId,
                                target: weaknessId,
                                type: 'hierarchy',
                            });
                        }

                        // Create strength node if applicable
                        if (topic.isStrength) {
                            const strengthId = `${topicId}-strength`;
                            addNode({
                                id: strengthId,
                                name: `✓ ${topic.name}`,
                                val: 8,
                                type: 'strength',
                                color: colors.strength,
                                parent: topicId,
                            });

                            addLink({
                                source: topicId,
                                target: strengthId,
                                type: 'hierarchy',
                            });
                        }
                    });
                });
            });
        }

        // Legacy support: add basic topics and skills if no hierarchical data
        else {
            const topicSet = new Set<string>();
            const skillSet = new Set<string>();

            student.topics?.forEach(topic => topicSet.add(topic));
            student.strengths?.slice(0, 3).forEach(skill => skillSet.add(skill));

            // Create topic nodes
            topicSet.forEach(topic => {
                const topicId = `topic-${topic.toLowerCase().replace(/\s+/g, '-')}`;
                // Check handled by addNode
                addNode({
                    id: topicId,
                    name: topic,
                    val: 10,
                    type: 'topic',
                    color: colors.topic,
                });

                addLink({
                    source: student.id,
                    target: topicId,
                    type: 'topic',
                });
            });

            // Create skill nodes
            skillSet.forEach(skill => {
                const skillId = `skill-${skill.toLowerCase().replace(/\s+/g, '-')}`;
                // Check handled by addNode
                addNode({
                    id: skillId,
                    name: skill,
                    val: 7,
                    type: 'skill',
                    color: colors.skill,
                });

                addLink({
                    source: student.id,
                    target: skillId,
                    type: 'skill',
                });
            });
        }

        // Create peer connections
        student.connections?.forEach(connectionId => {
            // Optimization: Only generate key for peer connections where duplication is possible
            addLink({
                source: student.id,
                target: connectionId,
                type: 'peer',
            }, true); // Enable existence check
        });
    });

    return { nodes, links };
}
