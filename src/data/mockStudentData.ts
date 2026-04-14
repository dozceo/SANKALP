import type { StudentNode } from "@/brain-map/types/student-types";

/**
 * Rich demo StudentNode for the brain-map visualization.
 * Provides a zero-backend experience with realistic hierarchical data:
 * Student → Subjects → Chapters → Topics (with mastery scores)
 */
export const demoStudent: StudentNode = {
  id: "learner-arya-001",
  name: "Arya Stark",
  type: "student",
  grade: 11,
  email: "arya@sankalp.ai",
  streak: 14,

  // ── Flat topic & skill references ──
  topics: [
    "Derivatives",
    "Integrals",
    "Kinematics",
    "Thermodynamics",
    "Organic Reactions",
    "Electromagnetic Induction",
    "Data Structures",
    "Algorithms",
  ],

  strengths: ["Calculus", "Kinematics", "Graph Theory"],
  weaknesses: ["Thermodynamics", "Nucleophilic Substitution"],

  connections: ["peer-ravi-002", "peer-meera-003"],

  masteryScores: {
    Derivatives: 0.92,
    Integrals: 0.78,
    Kinematics: 0.88,
    Thermodynamics: 0.35,
    "Organic Reactions": 0.62,
    "Electromagnetic Induction": 0.51,
    "Data Structures": 0.85,
    Algorithms: 0.73,
  },

  lastActive: new Date().toISOString(),
  classId: "class-physics-b",
  className: "Physics - Section B",
  classSubject: "Physics",
  teacherName: "Dr. Sharma",

  // ── Hierarchical study data ──
  subjects: [
    {
      id: "math",
      name: "Mathematics",
      color: "#3b82f6",
      chapters: [
        {
          id: "calc",
          name: "Calculus",
          progress: 85,
          topics: [
            { id: "deriv", name: "Derivatives", mastery: 0.92, isWeakness: false, isStrength: true },
            { id: "integ", name: "Integrals", mastery: 0.78, isWeakness: false, isStrength: false },
            { id: "limits", name: "Limits", mastery: 0.88, isWeakness: false, isStrength: true },
            { id: "continuity", name: "Continuity", mastery: 0.65, isWeakness: false, isStrength: false },
          ],
        },
        {
          id: "linear",
          name: "Linear Algebra",
          progress: 60,
          topics: [
            { id: "matrices", name: "Matrices", mastery: 0.72, isWeakness: false, isStrength: false },
            { id: "determinants", name: "Determinants", mastery: 0.55, isWeakness: false, isStrength: false },
            { id: "eigenvalues", name: "Eigenvalues", mastery: 0.42, isWeakness: true, isStrength: false },
          ],
        },
      ],
    },
    {
      id: "physics",
      name: "Physics",
      color: "#8b5cf6",
      chapters: [
        {
          id: "mechanics",
          name: "Mechanics",
          progress: 78,
          topics: [
            { id: "kinem", name: "Kinematics", mastery: 0.88, isWeakness: false, isStrength: true },
            { id: "dynamics", name: "Dynamics", mastery: 0.72, isWeakness: false, isStrength: false },
            { id: "energy", name: "Work & Energy", mastery: 0.81, isWeakness: false, isStrength: false },
          ],
        },
        {
          id: "thermo",
          name: "Thermodynamics",
          progress: 35,
          topics: [
            { id: "entropy", name: "Entropy", mastery: 0.35, isWeakness: true, isStrength: false },
            { id: "heat-transfer", name: "Heat Transfer", mastery: 0.28, isWeakness: true, isStrength: false },
            { id: "laws-thermo", name: "Laws of Thermodynamics", mastery: 0.45, isWeakness: true, isStrength: false },
          ],
        },
        {
          id: "em",
          name: "Electromagnetism",
          progress: 55,
          topics: [
            { id: "em-induction", name: "EM Induction", mastery: 0.51, isWeakness: false, isStrength: false },
            { id: "coulombs", name: "Coulomb's Law", mastery: 0.68, isWeakness: false, isStrength: false },
            { id: "magnetic-fields", name: "Magnetic Fields", mastery: 0.44, isWeakness: true, isStrength: false },
          ],
        },
      ],
    },
    {
      id: "chemistry",
      name: "Chemistry",
      color: "#06b6d4",
      chapters: [
        {
          id: "organic",
          name: "Organic Chemistry",
          progress: 52,
          topics: [
            { id: "nucleophilic", name: "Nucleophilic Substitution", mastery: 0.38, isWeakness: true, isStrength: false },
            { id: "elimination", name: "Elimination Reactions", mastery: 0.62, isWeakness: false, isStrength: false },
            { id: "functional-groups", name: "Functional Groups", mastery: 0.75, isWeakness: false, isStrength: false },
          ],
        },
      ],
    },
    {
      id: "cs",
      name: "Computer Science",
      color: "#f59e0b",
      chapters: [
        {
          id: "dsa",
          name: "Data Structures & Algorithms",
          progress: 80,
          topics: [
            { id: "arrays", name: "Arrays & Linked Lists", mastery: 0.91, isWeakness: false, isStrength: true },
            { id: "trees", name: "Trees & Graphs", mastery: 0.85, isWeakness: false, isStrength: true },
            { id: "sorting", name: "Sorting Algorithms", mastery: 0.73, isWeakness: false, isStrength: false },
            { id: "dp", name: "Dynamic Programming", mastery: 0.58, isWeakness: false, isStrength: false },
          ],
        },
      ],
    },
  ],

  badges: [
    { id: "streak-7", title: "Week Warrior", description: "7-day study streak", icon: "🔥", earnedAt: "2026-04-03", color: "#f59e0b" },
    { id: "mastery-calc", title: "Calculus Master", description: "90%+ mastery in Calculus", icon: "🧮", earnedAt: "2026-04-08", color: "#22c55e" },
  ],
};

/**
 * Demo peer students for peer-connection graph visualization.
 */
export const demoPeers: StudentNode[] = [
  {
    id: "peer-ravi-002",
    name: "Ravi Kumar",
    type: "student",
    topics: ["Kinematics", "Thermodynamics", "Algorithms"],
    strengths: ["Kinematics"],
    weaknesses: ["Organic Reactions"],
    connections: ["learner-arya-001", "peer-meera-003"],
  },
  {
    id: "peer-meera-003",
    name: "Meera Iyer",
    type: "student",
    topics: ["Integrals", "Data Structures", "Electromagnetic Induction"],
    strengths: ["Data Structures"],
    weaknesses: ["Integrals", "Electromagnetic Induction"],
    connections: ["learner-arya-001", "peer-ravi-002"],
  },
];
