/**
 * Type declarations for the brain-map module.
 * These allow TypeScript to resolve imports without type-checking
 * the brain-map source files directly (which live outside the project root).
 */

declare module "@/brain-map/components/InteractiveGraph" {
  import { FC } from "react";
  import type { GraphData, GraphNode, GraphLink } from "@/brain-map/types/graph-types";

  interface InteractiveGraphProps {
    graphData: GraphData;
    onNodeClick?: (nodeId: string) => void;
    highlightedNode?: string;
    width?: number;
    height?: number;
  }

  export const InteractiveGraph: FC<InteractiveGraphProps>;
}

declare module "@/brain-map/components/PersonalKnowledgeGraph" {
  import { FC } from "react";

  interface PersonalKnowledgeGraphProps {
    studentId: string;
    width?: number;
    height?: number;
  }

  export const PersonalKnowledgeGraph: FC<PersonalKnowledgeGraphProps>;
}

declare module "@/brain-map/lib/generatePersonalGraph" {
  import type { GraphData } from "@/brain-map/types/graph-types";
  import type { StudentNode } from "@/brain-map/types/student-types";

  export function generatePersonalGraph(
    student: StudentNode,
    allStudents: StudentNode[]
  ): GraphData;
}

declare module "@/brain-map/lib/generateGraphData" {
  import type { GraphData } from "@/brain-map/types/graph-types";
  import type { StudentNode } from "@/brain-map/types/student-types";

  export function generateGraphData(students: StudentNode[]): GraphData;
}

declare module "@/brain-map/lib/generateBayesianGraph" {
  import type { GraphData } from "@/brain-map/types/graph-types";
  import type { StudentNode } from "@/brain-map/types/student-types";

  export function generateBayesianGraph(
    student: StudentNode,
    allStudents: StudentNode[]
  ): GraphData;
}

declare module "@/brain-map/lib/graph-tokens" {
  export const GRAPH_COLORS_HEX: Record<string, string>;
  export const GRAPH_COLORS_HSL: Record<string, string>;
}

declare module "@/brain-map/lib/color-utils" {
  export function masteryToColor(mastery: number): string;
  export function hexToRgba(hex: string, alpha: number): string;
}

declare module "@/brain-map/types/graph-types" {
  export type NodeType =
    | "student" | "subject" | "chapter" | "topic"
    | "weakness" | "strength" | "skill" | "peer"
    | "badge" | "root";

  export interface GraphNode {
    id: string | number;
    name: string;
    type: NodeType;
    mastery?: number;
    alpha?: number;
    beta?: number;
    ciLower?: number;
    ciUpper?: number;
    hasStruggleSignal?: boolean;
    trajectorySlope?: number;
    color?: string;
    x?: number;
    y?: number;
    [key: string]: unknown;
  }

  export interface GraphLink {
    source: string | number;
    target: string | number;
    type?: string;
    [key: string]: unknown;
  }

  export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
  }
}

declare module "@/brain-map/types/student-types" {
  export interface TopicDetail {
    id: string;
    name: string;
    mastery: number;
    isWeakness: boolean;
    isStrength: boolean;
  }

  export interface ChapterDetail {
    id: string;
    name: string;
    progress: number;
    topics: TopicDetail[];
  }

  export interface SubjectDetail {
    id: string;
    name: string;
    color: string;
    chapters: ChapterDetail[];
  }

  export interface BadgeDetail {
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedAt: string;
    color: string;
  }

  export interface StudentNode {
    id: string;
    name: string;
    type: string;
    grade?: number;
    email?: string;
    streak?: number;
    topics: string[];
    strengths: string[];
    weaknesses: string[];
    connections: string[];
    masteryScores?: Record<string, number>;
    lastActive?: string;
    classId?: string;
    className?: string;
    classSubject?: string;
    teacherName?: string;
    subjects?: SubjectDetail[];
    badges?: BadgeDetail[];
  }
}

declare module "@/brain-map/types/intelligence-types" {
  export interface IntelligenceProfile {
    studentId: string;
    overallMastery: number;
    topStrengths: string[];
    topWeaknesses: string[];
    learningVelocity: number;
    retentionScore: number;
  }
}
