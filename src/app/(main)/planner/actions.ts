"use server";

import { smartRevisionPlanner } from "@/ai/flows/smart-revision-planner";

export async function getRevisionPlan() {
  try {
    const mockBrainMap = JSON.stringify({
      topics: [
        { name: "Algebra", progress: 0.8, lastRevised: "2024-05-01" },
        { name: "Calculus", progress: 0.4, lastRevised: "2024-05-20" },
        { name: "Photosynthesis", progress: 0.9, lastRevised: "2024-04-15" },
        { name: "Newton's Laws", progress: 0.6, lastRevised: "2024-05-25" },
      ],
    });

    return await smartRevisionPlanner({
      brainMap: mockBrainMap,
      studentId: "user-123",
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}
