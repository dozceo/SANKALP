// Static student data export for client-side use
// This file is generated from the markdown files in data/students/

import { StudentNode, DocNode, GraphData, GraphNode, GraphLink } from './docsData';

export const studentsData: StudentNode[] = [];

/**
 * Generate graph data from student nodes
 */
export function generateGraphData(students: StudentNode[]): GraphData {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const topicSet = new Set<string>();
    const skillSet = new Set<string>();

    // Create student nodes
    students.forEach(student => {
        // Calculate node size based on mastery scores
        const avgMastery = student.masteryScores
            ? Object.values(student.masteryScores).reduce((a, b) => a + b, 0) / Object.values(student.masteryScores).length
            : 0.5;

        nodes.push({
            id: student.id,
            name: student.name,
            val: 12 + avgMastery * 8, // 12-20 based on mastery
            type: 'student',
            connections: student.connections,
        });

        // Collect all topics and skills
        student.topics?.forEach(topic => topicSet.add(topic));
        student.strengths?.slice(0, 3).forEach(skill => skillSet.add(skill)); // Limit to top 3 skills
    });

    // Create topic nodes
    topicSet.forEach(topic => {
        nodes.push({
            id: `topic-${topic.toLowerCase().replace(/\s+/g, '-')}`,
            name: topic,
            val: 10,
            type: 'topic',
        });
    });

    // Create skill nodes
    skillSet.forEach(skill => {
        nodes.push({
            id: `skill-${skill.toLowerCase().replace(/\s+/g, '-')}`,
            name: skill,
            val: 7,
            type: 'skill',
        });
    });

    // Create links between students (peer connections)
    students.forEach(student => {
        student.connections?.forEach(connectionId => {
            // Avoid duplicate links
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

        // Create links from students to their topics
        student.topics?.forEach(topic => {
            const topicId = `topic-${topic.toLowerCase().replace(/\s+/g, '-')}`;
            links.push({
                source: student.id,
                target: topicId,
                type: 'topic',
            });
        });

        // Create links from students to their top strengths (skills)
        student.strengths?.slice(0, 3).forEach(skill => {
            const skillId = `skill-${skill.toLowerCase().replace(/\s+/g, '-')}`;
            links.push({
                source: student.id,
                target: skillId,
                type: 'skill',
            });
        });
    });

    return { nodes, links };
}

/**
 * Flatten the document tree for searching
 */
export function flattenDocs(tree: DocNode[]): StudentNode[] {
    const result: StudentNode[] = [];

    function traverse(nodes: DocNode[]) {
        nodes.forEach(node => {
            result.push(node);
            if (node.children) {
                traverse(node.children);
            }
        });
    }

    traverse(tree);
    return result;
}

/**
 * Create a tree structure from students
 */
export function createStudentTree(students: StudentNode[]): DocNode[] {
    return students.map(student => ({
        ...student,
        children: [],
    }));
}

// Export the main data
export const docsTree = createStudentTree(studentsData);
