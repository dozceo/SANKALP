// Static student data export for client-side use
// This file is generated from the markdown files in data/students/

import { StudentNode, DocNode, GraphData, GraphNode, GraphLink } from './docsData';

export const studentsData: StudentNode[] = [
    {
        id: 'alex-kumar',
        name: 'Alex Kumar',
        type: 'student',
        grade: 10,
        email: 'alex.kumar@school.edu',
        topics: ['Algebra', 'Geometry', 'Physics'],
        strengths: ['Problem Solving', 'Logical Thinking', 'Mathematical Proofs'],
        weaknesses: ['Trigonometric Identities', 'Complex Numbers', 'Time Management'],
        connections: ['priya-sharma', 'rahul-singh', 'arjun-reddy'],
        lastActive: '2026-01-25',
        masteryScores: {
            Algebra: 0.85,
            Geometry: 0.72,
            Physics: 0.68,
            Trigonometry: 0.45,
        },
        subjects: [
            {
                id: 'physics',
                name: 'Physics',
                color: '#3B82F6',
                chapters: [
                    {
                        id: 'laws-of-motion',
                        name: 'Chapter 3: Laws of Motion',
                        progress: 65,
                        topics: [
                            {
                                id: 'newtons-first-law',
                                name: "Newton's First Law",
                                mastery: 0.85,
                                isStrength: true,
                                isWeakness: false,
                            },
                            {
                                id: 'newtons-second-law',
                                name: "Newton's Second Law",
                                mastery: 0.75,
                                isStrength: false,
                                isWeakness: false,
                            },
                            {
                                id: 'friction',
                                name: 'Friction and Forces',
                                mastery: 0.45,
                                isStrength: false,
                                isWeakness: true,
                            },
                        ],
                    },
                ],
            },
            {
                id: 'chemistry',
                name: 'Chemistry',
                color: '#10B981',
                chapters: [
                    {
                        id: 'organic-compounds',
                        name: 'Chapter 5: Organic Compounds',
                        progress: 70,
                        topics: [
                            {
                                id: 'alkanes',
                                name: 'Alkanes',
                                mastery: 0.70,
                                isStrength: false,
                                isWeakness: false,
                            },
                            {
                                id: 'alkenes',
                                name: 'Alkenes',
                                mastery: 0.65,
                                isStrength: false,
                                isWeakness: false,
                            },
                        ],
                    },
                ],
            },
            {
                id: 'mathematics',
                name: 'Mathematics',
                color: '#8B5CF6',
                chapters: [
                    {
                        id: 'calculus-basics',
                        name: 'Chapter 2: Calculus Basics',
                        progress: 55,
                        topics: [
                            {
                                id: 'derivatives',
                                name: 'Derivatives',
                                mastery: 0.60,
                                isStrength: false,
                                isWeakness: false,
                            },
                            {
                                id: 'integrals',
                                name: 'Integrals',
                                mastery: 0.50,
                                isStrength: false,
                                isWeakness: true,
                            },
                        ],
                    },
                ],
            },
        ],
        studyMaterials: [
            {
                id: 'newtons-laws',
                subject: 'Physics',
                topic: "Newton's Laws of Motion",
                chapter: 'Chapter 3',
                detailedNotes: "Newton's Three Laws explain the relationship between forces and motion...",
                referenceLinks: ['https://example.com/physics'],
                nextReview: '2024-09-15',
                status: 'Due',
                priority: 'HIGH',
            },
            {
                id: 'organic-compounds',
                subject: 'Chemistry',
                topic: 'Organic Compounds',
                chapter: 'Chapter 5',
                detailedNotes: 'Study notes on alkanes, alkenes, and functional groups...',
                nextReview: '2024-09-18',
                status: 'Upcoming',
                priority: 'MEDIUM',
            },
            {
                id: 'calculus-review',
                subject: 'Mathematics',
                topic: 'Calculus II',
                chapter: 'Chapter 2',
                detailedNotes: 'Integration techniques and applications...',
                nextReview: '2024-09-12',
                status: 'Due',
                priority: 'HIGH',
            },
        ],
    },
    {
        id: 'priya-sharma',
        name: 'Priya Sharma',
        type: 'student',
        grade: 10,
        email: 'priya.sharma@school.edu',
        topics: ['Geometry', 'Algebra', 'Trigonometry', 'Calculus'],
        strengths: ['Visual-Spatial Reasoning', 'Geometric Proofs', 'Teaching Others', 'Pattern Recognition'],
        weaknesses: ['Numerical Computation Speed', 'Calculus Applications'],
        connections: ['alex-kumar', 'meera-patel', 'arjun-reddy'],
        lastActive: '2026-01-25',
        masteryScores: {
            Geometry: 0.92,
            Algebra: 0.88,
            Trigonometry: 0.85,
            Calculus: 0.65,
        },
    },
    {
        id: 'rahul-singh',
        name: 'Rahul Singh',
        type: 'student',
        grade: 10,
        email: 'rahul.singh@school.edu',
        topics: ['Trigonometry', 'Algebra', 'Geometry', 'Statistics'],
        strengths: ['Trigonometric Applications', 'Practical Problem Solving', 'Consistent Performance', 'Statistical Analysis'],
        weaknesses: ['Abstract Concepts', 'Theoretical Proofs'],
        connections: ['alex-kumar', 'arjun-reddy', 'meera-patel'],
        lastActive: '2026-01-24',
        masteryScores: {
            Trigonometry: 0.90,
            Algebra: 0.82,
            Geometry: 0.78,
            Statistics: 0.88,
        },
    },
    {
        id: 'meera-patel',
        name: 'Meera Patel',
        type: 'student',
        grade: 9,
        email: 'meera.patel@school.edu',
        topics: ['Algebra', 'Geometry', 'Basic Trigonometry'],
        strengths: ['Quick Learner', 'Enthusiastic Attitude', 'Strong Basics', 'Creative Thinking'],
        weaknesses: ['Needs More Practice', 'Building Confidence', 'Advanced Concepts'],
        connections: ['priya-sharma', 'rahul-singh'],
        lastActive: '2026-01-25',
        masteryScores: {
            Algebra: 0.70,
            Geometry: 0.65,
            Trigonometry: 0.55,
        },
    },
    {
        id: 'arjun-reddy',
        name: 'Arjun Reddy',
        type: 'student',
        grade: 11,
        email: 'arjun.reddy@school.edu',
        topics: ['Calculus', 'Linear Algebra', 'Advanced Geometry', 'Physics', 'Number Theory'],
        strengths: ['Abstract Thinking', 'Mathematical Proofs', 'Mentoring', 'Research Skills', 'Competition Mathematics'],
        weaknesses: ['Over-ambitious', 'Time Management'],
        connections: ['alex-kumar', 'priya-sharma', 'rahul-singh'],
        lastActive: '2026-01-25',
        masteryScores: {
            Calculus: 0.95,
            LinearAlgebra: 0.90,
            Geometry: 0.93,
            NumberTheory: 0.88,
            Physics: 0.92,
        },
    },
];

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
