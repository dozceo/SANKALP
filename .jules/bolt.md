## 2024-05-23 - Python Process Spawning Overhead
**Learning:** `batchPredictMastery` in `ml-bridge.ts` spawns a new Python process for every batch request. This incurs significant overhead (process startup, import time).
**Action:** Reuse the persistent `PythonBridge` instance or implement a persistent batch processing mechanism. For now, using `Promise.all` with the existing `predictMastery` (which uses the bridge) is a quick win.

## 2024-05-23 - Unused Code in API
**Learning:** `calculateStudentRisk` is imported but unused in `src/app/api/teacher/students/route.ts`. Dead code should be removed to keep the codebase clean, even if performance impact is negligible.
**Action:** Verify usage before removing.
