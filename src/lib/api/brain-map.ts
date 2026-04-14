import { z } from "zod";

// ----------------------------------------------------------------------
// Zod Schemas for Runtime Validation (Strict NO `any` policy)
// ----------------------------------------------------------------------

/**
 * Brain Map Node Schema
 * Enforces the Bayesian Core Law: Never point estimates, always Beta(α, β) distributions.
 * Enforces the Uncertainty Law: CI bounds and width are mandatory.
 */
export const BrainMapNodeSchema = z.object({
  id: z.string(),
  type: z.enum(["subject", "chapter", "topic", "skill", "strength", "weakness"]),
  label: z.string(),
  parentId: z.string().optional(),

  // Bayesian Core - Strictly Required
  mastery: z.number().min(0).max(1),
  posteriorAlpha: z.number().positive(),
  posteriorBeta: z.number().positive(),

  // Uncertainty is Mandatory
  ciLower: z.number().min(0).max(1),
  ciUpper: z.number().min(0).max(1),
  uncertainty: z.number().min(0).max(1), // ciUpper - ciLower

  // Struggle Detection & Trajectory
  trajectorySlope: z.number().optional(),
  struggleFlags: z.array(z.string()).optional(),
  forgettingStrength: z.number().optional(),

  metadata: z.record(z.unknown()).optional().default({}),
});

/**
 * Brain Map Link Schema
 * Represents the edges in the 3D force-directed graph.
 */
export const BrainMapLinkSchema = z.object({
  source: z.string(),
  target: z.string(),
  type: z.enum(["hierarchy", "prerequisite", "progression", "relation", "peer", "similarity"]),
  weight: z.number().min(0).max(1).optional(),
  knnRank: z.number().positive().optional(),
  cosineSimilarity: z.number().min(0).max(1).optional(),
});

/**
 * Full Graph Data Schema
 */
export const BrainMapGraphSchema = z.object({
  nodes: z.array(BrainMapNodeSchema),
  links: z.array(BrainMapLinkSchema),
});

// ----------------------------------------------------------------------
// TypeScript Interfaces (Inferred from Zod for absolute sync)
// ----------------------------------------------------------------------

export type BrainMapNode = z.infer<typeof BrainMapNodeSchema>;
export type BrainMapLink = z.infer<typeof BrainMapLinkSchema>;
export type BrainMapGraph = z.infer<typeof BrainMapGraphSchema>;

// ----------------------------------------------------------------------
// API Utility Functions
// ----------------------------------------------------------------------

/**
 * Fetches the full Brain Map™ graph data for a given student.
 * Enforces runtime validation of Bayesian parameters to prevent UI crashes.
 *
 * @param studentId - The unique identifier of the student
 * @returns A validated BrainMapGraph object
 */
export async function fetchStudentBrainMap(studentId: string): Promise<BrainMapGraph> {
  const response = await fetch(`/api/v1/students/${studentId}/brain-map`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    // Cache configuration optimized for Next.js App Router
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Brain Map for student ${studentId}: ${response.statusText}`);
  }

  const rawData: any = await response.json();
  
  // Handle API response wrapper { data: ..., _meta: ... }
  const payload = rawData && rawData.data ? rawData.data : rawData;

  // Strict runtime validation - drops invalid data, prevents 'any' leaks
  const parsed = BrainMapGraphSchema.safeParse(payload);

  if (!parsed.success) {
    console.error("Brain Map API validation failed. Invalid Bayesian parameters detected:", parsed.error.format());
    throw new Error("Invalid Brain Map data received from API. Check Bayesian core compliance.");
  }

  return parsed.data;
}

/**
 * Fetches the full Brain Map™ graph data for a given teacher.
 *
 * @param teacherId - The unique identifier of the teacher
 * @returns A validated BrainMapGraph object
 */
export async function fetchTeacherBrainMap(teacherId: string): Promise<BrainMapGraph> {
  const response = await fetch(`/api/v1/teachers/${teacherId}/brain-map`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Brain Map for teacher ${teacherId}: ${response.statusText}`);
  }

  const rawData: any = await response.json();
  const payload = rawData && rawData.data ? rawData.data : rawData;

  const parsed = BrainMapGraphSchema.safeParse(payload);

  if (!parsed.success) {
    console.error("Teacher Brain Map API validation failed:", parsed.error.format());
    throw new Error("Invalid Brain Map data received from API.");
  }

  return parsed.data;
}

export const MasteryUpdatePayloadSchema = z.object({
  topicId: z.string(),
  successes: z.number().min(0),
  failures: z.number().min(0),
  responseTimeMs: z.number().positive().optional(),
});

export type MasteryUpdatePayload = z.infer<typeof MasteryUpdatePayloadSchema>;

/**
 * Continuous Updating Law: Triggers a mastery update for a specific node.
 * Never updates just the mean; requires successes/failures to update Beta(α, β).
 *
 * @param studentId - The unique identifier of the student
 * @param payload - The interaction data containing successes and failures
 * @returns The updated BrainMapNode with new posterior distribution
 */
export async function updateNodeMastery(
  studentId: string,
  payload: MasteryUpdatePayload
): Promise<BrainMapNode> {
  // Validate payload before sending to prevent malformed requests
  const validatedPayload = MasteryUpdatePayloadSchema.parse(payload);

  const response = await fetch(`/api/v1/students/${studentId}/brain-map/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(validatedPayload),
  });

  if (!response.ok) {
    throw new Error(`Failed to update mastery for topic ${payload.topicId}`);
  }

  const rawData: any = await response.json();
  const payloadData = rawData && rawData.data ? rawData.data : rawData;
  const parsed = BrainMapNodeSchema.safeParse(payloadData);

  if (!parsed.success) {
    console.error("Mastery update validation failed:", parsed.error.format());
    throw new Error("Invalid updated node data received from API.");
  }

  return parsed.data;
}