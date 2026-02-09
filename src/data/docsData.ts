import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Hierarchical Study Structure Types
export interface Topic {
    id: string;
    name: string;
    mastery: number;        // 0-1
    notes?: string;
    isWeakness: boolean;
    isStrength: boolean;
}

export interface Chapter {
    id: string;
    name: string;
    topics: Topic[];
    progress: number;       // 0-100%
}

export interface Subject {
    id: string;
    name: string;
    chapters: Chapter[];
    color?: string;         // For visualization
}

export interface StudyMaterial {
    id: string;
    subject: string;
    topic: string;
    chapter?: string;
    detailedNotes: string;
    referenceLinks?: string[];
    fileUploads?: string[];
    nextReview: string;     // ISO date
    status: 'Due' | 'Upcoming' | 'Reviewed';
    lastReviewed?: string;  // ISO date
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Badge {
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedAt: string;
    color?: string;
}

// Type definitions
export interface StudentNode {
    id: string;
    name: string;
    type: 'student' | 'topic' | 'skill';
    grade?: number;
    email?: string;

    // Existing fields
    topics?: string[];
    strengths?: string[];
    weaknesses?: string[];
    connections?: string[];
    lastActive?: string;
    masteryScores?: Record<string, number>;
    badges?: Badge[];
    streak?: number;
    classId?: string;
    className?: string;
    classSubject?: string;
    teacherName?: string;

    // New hierarchical study data
    subjects?: Subject[];
    studyMaterials?: StudyMaterial[];
}

export interface DocNode extends StudentNode {
    children?: DocNode[];
}

// Enhanced Graph Node Types
export type NodeType =
    | 'student'
    | 'subject'
    | 'chapter'
    | 'topic'
    | 'weakness'
    | 'strength'
    | 'peer'
    | 'skill';        // Keep for backward compatibility

export interface GraphNode {
    id: string;
    name: string;
    val: number;            // Node size
    type: NodeType;
    connections?: string[];
    parent?: string;        // For hierarchical relationships
    mastery?: number;       // For topics
    color?: string;         // Override default color
    lightColor?: string;    // Pre-calculated light color for rendering
}

export interface GraphLink {
    source: string;
    target: string;
    type?: 'peer' | 'topic' | 'skill' | 'subject' | 'chapter' | 'hierarchy';
}

export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}

/**
 * Parse a single student markdown file
 */
export function parseStudentMarkdown(filePath: string): StudentNode | null {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data } = matter(fileContent);

        return {
            id: data.id,
            name: data.name,
            type: 'student',
            grade: data.grade,
            email: data.email,
            topics: data.topics || [],
            strengths: data.strengths || [],
            weaknesses: data.weaknesses || [],
            connections: data.connections || [],
            lastActive: data.lastActive,
            masteryScores: data.masteryScores || {},
        };
    } catch (error) {
        console.error(`Error parsing student file ${filePath}:`, error);
        return null;
    }
}

/**
 * Load all student markdown files from the students directory
 */
export function loadAllStudents(): StudentNode[] {
    const studentsDir = path.join(process.cwd(), 'data', 'students');

    try {
        const files = fs.readdirSync(studentsDir);
        const students: StudentNode[] = [];

        files.forEach(file => {
            if (file.endsWith('.md')) {
                const filePath = path.join(studentsDir, file);
                const student = parseStudentMarkdown(filePath);
                if (student) {
                    students.push(student);
                }
            }
        });

        return students;
    } catch (error) {
        console.error('Error loading students:', error);
        return [];
    }
}

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
        nodes.push({
            id: student.id,
            name: student.name,
            val: 12, // Base size for students
            type: 'student',
            connections: student.connections,
        });

        // Collect all topics and skills
        student.topics?.forEach(topic => topicSet.add(topic));
        student.strengths?.forEach(skill => skillSet.add(skill));
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
            val: 8,
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

        // Create links from students to their strengths (skills)
        student.strengths?.forEach(skill => {
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
 * Create a tree structure from students (for hierarchical views)
 */
export function createStudentTree(students: StudentNode[]): DocNode[] {
    // For now, return students as a flat tree
    // Can be enhanced to group by grade, topics, etc.
    return students.map(student => ({
        ...student,
        children: [],
    }));
}

// Export the main data
export const studentsData = loadAllStudents();
export const docsTree = createStudentTree(studentsData);
export const graphData = generateGraphData(studentsData);
