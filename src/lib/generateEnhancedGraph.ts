import { StudentNode, GraphData, GraphNode, GraphLink, NodeType } from './docsData';

/**
 * Enhanced graph generation with hierarchical node support
 * Shows: Students → Subjects → Chapters → Topics → Weaknesses/Strengths
 */
export function generateEnhancedGraphData(students: StudentNode[]): GraphData {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    // Node colors by type
    const colors: Record<NodeType, string> = {
        student: '#9333EA',      // Purple
        subject: '#3B82F6',      // Blue
        chapter: '#06B6D4',      // Cyan
        topic: '#6B7280',        // Gray
        weakness: '#EF4444',     // Red
        strength: '#10B981',     // Green
        skill: '#F59E0B',        // Amber
    };

    students.forEach(student => {
        // Create student node
        const avgMastery = student.masteryScores
            ? Object.values(student.masteryScores).reduce((a, b) => a + b, 0) / Object.values(student.masteryScores).length
            : 0.5;

        nodes.push({
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

                        // Create weakness node if applicable
                        if (topic.isWeakness) {
                            const weaknessId = `${topicId}-weakness`;
                            nodes.push({
                                id: weaknessId,
                                name: `⚠️ ${topic.name}`,
                                val: 8,
                                type: 'weakness',
                                color: colors.weakness,
                                parent: topicId,
                            });

                            links.push({
                                source: topicId,
                                target: weaknessId,
                                type: 'hierarchy',
                            });
                        }

                        // Create strength node if applicable
                        if (topic.isStrength) {
                            const strengthId = `${topicId}-strength`;
                            nodes.push({
                                id: strengthId,
                                name: `✓ ${topic.name}`,
                                val: 8,
                                type: 'strength',
                                color: colors.strength,
                                parent: topicId,
                            });

                            links.push({
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
                if (!nodes.find(n => n.id === topicId)) {
                    nodes.push({
                        id: topicId,
                        name: topic,
                        val: 10,
                        type: 'topic',
                        color: colors.topic,
                    });
                }

                links.push({
                    source: student.id,
                    target: topicId,
                    type: 'topic',
                });
            });

            // Create skill nodes
            skillSet.forEach(skill => {
                const skillId = `skill-${skill.toLowerCase().replace(/\s+/g, '-')}`;
                if (!nodes.find(n => n.id === skillId)) {
                    nodes.push({
                        id: skillId,
                        name: skill,
                        val: 7,
                        type: 'skill',
                        color: colors.skill,
                    });
                }

                links.push({
                    source: student.id,
                    target: skillId,
                    type: 'skill',
                });
            });
        }

        // Create peer connections
        student.connections?.forEach(connectionId => {
            const existingLink = links.find(
                l =>
                    (l.source === student.id && l.target === connectionId) ||
                    (l.source === connectionId && l.target === student.id)
            );

            if (!existingLink) {
                links.push({
                    source: student.id,
                    target: connectionId,
                    type: 'peer',
                });
            }
        });
    });

    return { nodes, links };
}
