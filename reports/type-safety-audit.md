# TypeScript Strict Mode Compliance Audit

**Date:** 2026-02-17T19:34:25.581Z

## Summary
- **`any` usages:** 105
- **Non-null assertions (`!`):** 19
- **`@ts-ignore` / `@ts-expect-error`:** 0

## Detailed Violations

### `src/ai/detect_drift.ts`
- **Line 15** [any]: `const SCHEMA_MAP: Record<string, z.ZodType<any>> = {`
- **Line 26** [any]: `response: any;`
- **Line 71** [any]: `const printErrors = (errObj: any, prefix = '') => {`

### `src/ai/flows/custom-cognitive-chatbot.ts`
- **Line 57** [non-null]: `return output!;`

### `src/ai/flows/smart-revision-planner.ts`
- **Line 55** [any]: `async function makeRevisionDecisions(brainMapData: any, studentHistory: StudentHistory) {`

### `src/ai/flows/speech-to-speech.ts`
- **Line 44** [any]: `let bufs: any[] = [];`

### `src/ai/flows/text-to-speech.ts`
- **Line 40** [any]: `let bufs: any[] = [];`

### `src/ai/genkit.ts`
- **Line 36** [any]: `return async (...args: any[]) => {`
- **Line 43** [any]: `return (...args: any[]) => {`
- **Line 46** [any]: `const wrappedPrompt = async (...pArgs: any[]) => {`
- **Line 57** [any]: `return (...args: any[]) => {`
- **Line 60** [any]: `const wrappedFlow = async (...fArgs: any[]) => {`

### `src/app/(auth)/login/page.tsx`
- **Line 53** [any]: `} catch (error: any) {`
- **Line 68** [any]: `} catch (error: any) {`

### `src/app/(auth)/onboarding/page.tsx`
- **Line 148** [any]: `} catch (error: any) {`

### `src/app/(auth)/sign-up/page.tsx`
- **Line 70** [any]: `} catch (error: any) {`

### `src/app/(auth)/teacher-onboarding/page.tsx`
- **Line 120** [any]: `} catch (error: any) {`

### `src/app/(main)/brain-map/page.tsx`
- **Line 29** [any]: `const studentNode = data.nodes.find((n: any) => n.type === 'student');`

### `src/app/(main)/chat/page.tsx`
- **Line 137** [any]: `<ScrollArea className="h-full p-6" ref={scrollAreaRef as any}>`

### `src/app/(main)/classes/page.tsx`
- **Line 41** [any]: `} catch (error: any) {`
- **Line 60** [any]: `} catch (error: any) {`
- **Line 181** [any]: `Enrolled since {currentStudent.joinedClassAt ? new Date(currentStudent.joinedClassAt as any).toLocaleDateString() : 'recently'}.`

### `src/app/(main)/mentor/page.tsx`
- **Line 77** [any]: `<ScrollArea className="h-full p-6" ref={scrollAreaRef as any}>`

### `src/app/(main)/quiz/page.tsx`
- **Line 91** [non-null]: `if (currentQuestionIndex < quiz!.length - 1) {`
- **Line 101** [non-null]: `const finalScore = score / quiz!.length;`
- **Line 112** [non-null]: `questionsAttempted: quiz!.length,`

### `src/app/(main)/teacher/page.tsx`
- **Line 50** [any]: `const [graphData, setGraphData] = useState<any>({ nodes: [], links: [] });`
- **Line 59** [any]: `const newNodes = graphData.nodes.map((node: any) => {`

### `src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx`
- **Line 43** [any]: `recentQuizzes: any[];`

### `src/app/actions/ai-error.ts`
- **Line 13** [non-null]: `return errorCache.get(cacheKey)!;`

### `src/app/actions/student-configuration.ts`
- **Line 23** [any]: `} catch (error: any) {`

### `src/app/api/activity/log/route.ts`
- **Line 101** [any]: `const updates: any = {};`

### `src/app/api/intelligence/student/route.ts`
- **Line 155** [non-null]: `masteryProbability: mlPrediction.mastery_probability!,`
- **Line 156** [non-null]: `confidence: mlPrediction.confidence!,`

### `src/app/api/planner/convert-to-node/route.ts`
- **Line 26** [any]: `} catch (error: any) {`

### `src/app/api/student/onboard/route.ts`
- **Line 17** [any]: `const studentData: any = {`

### `src/app/api/test/seed/route.ts`
- **Line 51** [any]: `} catch (error: any) {`

### `src/components/InteractiveGraph.tsx`
- **Line 90** [non-null]: `adjMap.get(sourceId)!.add(targetId);`
- **Line 91** [non-null]: `adjMap.get(targetId)!.add(sourceId);`
- **Line 96** [non-null]: `linkMap.get(sourceId)!.push(l as ExtendedLinkObject);`
- **Line 97** [non-null]: `linkMap.get(targetId)!.push(l as ExtendedLinkObject);`
- **Line 168** [any]: `return (n as any).risk?.toLowerCase() === 'high';`
- **Line 178** [any]: `(n.type === 'student' && (n as any).risk?.toLowerCase() === 'high') ||`
- **Line 187** [any]: `const s = typeof l.source === 'object' ? (l.source as any).id : l.source;`
- **Line 188** [any]: `const t = typeof l.target === 'object' ? (l.target as any).id : l.target;`
- **Line 420** [any]: `ref={graphRef as any}`
- **Line 426** [any]: `nodeCanvasObject={nodeCanvasObject as any}`
- **Line 427** [any]: `linkCanvasObject={linkCanvasObject as any}`
- **Line 429** [any]: `onNodeHover={handleNodeHover as any}`
- **Line 488** [any]: `ref={modalGraphRef as any}`
- **Line 494** [any]: `nodeCanvasObject={nodeCanvasObject as any}`
- **Line 495** [any]: `linkCanvasObject={linkCanvasObject as any}`
- **Line 497** [any]: `onNodeHover={handleNodeHover as any}`

### `src/components/LogoutButton.tsx`
- **Line 44** [any]: `} catch (error: any) {`

### `src/components/PersonalKnowledgeGraph.tsx`
- **Line 270** [any]: `ref={graphRef as any}`
- **Line 276** [any]: `nodeCanvasObject={nodeCanvasObject as any}`
- **Line 277** [any]: `linkCanvasObject={linkCanvasObject as any}`
- **Line 278** [any]: `onNodeHover={handleNodeHover as any}`

### `src/components/SankalpSwitch.tsx`
- **Line 88** [any]: `} catch (error: any) {`
- **Line 135** [any]: `} catch (error: any) {`

### `src/components/planner/AddStudyMaterial.tsx`
- **Line 86** [any]: `} catch (error: any) {`
- **Line 123** [any]: `} catch (error: any) {`

### `src/components/planner/FocusTimer.tsx`
- **Line 71** [any]: `const AudioContext = window.AudioContext || (window as any).webkitAudioContext;`

### `src/contexts/AuthContext.tsx`
- **Line 22** [any]: `signUp: (email: string, password: string, name: string, role: 'student' | 'teacher', additionalData?: any) => Promise<User>;`
- **Line 97** [any]: `additionalData?: any`

### `src/contexts/StudentContext.tsx`
- **Line 20** [any]: `joinClass: (classCode: string) => Promise<any>;`
- **Line 21** [any]: `leaveClass: () => Promise<any>;`
- **Line 124** [any]: `const materials: StudyMaterial[] = plannerData.items.map((item: any) => {`

### `src/lib/auth.ts`
- **Line 33** [any]: `} catch (error: any) {`
- **Line 57** [any]: `} catch (error: any) {`
- **Line 72** [any]: `} catch (error: any) {`
- **Line 85** [any]: `} catch (error: any) {`
- **Line 98** [any]: `} catch (error: any) {`
- **Line 111** [any]: `} catch (error: any) {`

### `src/lib/color-utils.ts`
- **Line 15** [non-null]: `return colorCache.get(key)!;`

### `src/lib/db-helpers-extended.ts`
- **Line 81** [any]: `reviewDates: (data.reviewDates || []).map((d: any) => d.toDate()),`
- **Line 132** [any]: `reviewDates: (data.reviewDates || []).map((d: any) => d.toDate()),`

### `src/lib/db-helpers.ts`
- **Line 1209** [any]: `structure: any;`
- **Line 1275** [any]: `questions: any[];`

### `src/lib/eventTracker.ts`
- **Line 373** [any]: `private log(...args: any[]): void {`

### `src/lib/firebase-admin.ts`
- **Line 96** [any]: `const handler: ProxyHandler<any> = {`
- **Line 106** [any]: `return async (...args: any[]) => {`
- **Line 114** [any]: `return async (...args: any[]) => {`
- **Line 122** [any]: `return async (...args: any[]) => {`
- **Line 132** [any]: `return (...args: any[]) => {`

### `src/lib/firestore.ts`
- **Line 58** [any]: `} catch (error: any) {`
- **Line 84** [any]: `} catch (error: any) {`
- **Line 105** [any]: `} catch (error: any) {`
- **Line 127** [any]: `} catch (error: any) {`
- **Line 147** [any]: `} catch (error: any) {`
- **Line 161** [any]: `} catch (error: any) {`

### `src/lib/generatePersonalGraph.ts`
- **Line 13** [non-null]: `studentsData.forEach(s => studentMapCache!.set(s.id, s));`

### `src/lib/graph-helpers.ts`
- **Line 98** [any]: `brainMapSnapshot.docs.forEach((doc: any) => {`

### `src/lib/middleware/auth.ts`
- **Line 48** [any]: `} catch (error: any) {`

### `src/lib/mock-db.ts`
- **Line 18** [any]: `private convertDates(data: any): any {`
- **Line 32** [any]: `const newData: any = {};`
- **Line 41** [any]: `async set(data: any) {`
- **Line 46** [any]: `async update(data: any) {`
- **Line 59** [any]: `constructor(public docs: any[]) {}`
- **Line 64** [any]: `forEach(callback: (doc: any) => void) {`
- **Line 88** [any]: `async add(data: any) {`
- **Line 94** [any]: `where(field: string, op: string, value: any) {`
- **Line 104** [any]: `constructor(public path: string, private db: MockFirestore, public filters: any[]) {}`
- **Line 106** [any]: `where(field: string, op: string, value: any) {`
- **Line 152** [any]: `async runTransaction(updateFunction: (t: any) => Promise<any>) {`
- **Line 156** [any]: `get: (ref: any) => ref.get(),`
- **Line 157** [any]: `set: (ref: any, data: any) => ref.set(data),`
- **Line 158** [any]: `update: (ref: any, data: any) => ref.update(data),`
- **Line 159** [any]: `delete: (ref: any) => ref.delete(),`
- **Line 166** [any]: `set: (ref: any, data: any) => ref.set(data),`
- **Line 167** [any]: `update: (ref: any, data: any) => ref.update(data),`
- **Line 168** [any]: `delete: (ref: any) => ref.delete(),`

### `src/lib/storage.ts`
- **Line 33** [any]: `} catch (error: any) {`
- **Line 73** [any]: `} catch (error: any) {`
- **Line 93** [any]: `} catch (error: any) {`
- **Line 108** [any]: `} catch (error: any) {`
- **Line 137** [any]: `} catch (error: any) {`

### `src/lib/syllabus-fallback.ts`
- **Line 81** [non-null]: `title: baseSyllabus.title!,`
- **Line 82** [non-null]: `structure: baseSyllabus.structure!,`
- **Line 83** [non-null]: `strategy: baseSyllabus.strategy!,`
- **Line 84** [non-null]: `references: baseSyllabus.references!,`

### `src/ml/inference/ml-bridge.ts`
- **Line 28** [any]: `reject: (reason?: any) => void;`
- **Line 41** [non-null]: `return this.process!;`
- **Line 103** [non-null]: `const req = this.pendingRequests.get(id)!;`
