# Result: Mindful Mentor Counseling System Analysis

**Prompt executed:** `prompts/02-mindful-mentor.md`  
**Date:** 2026-02-19  
**Source file read:** `src/ai/flows/mindful-mentor.ts`

---

## Action 1: Review the flow implementation

**File read:** `src/ai/flows/mindful-mentor.ts`

### Input schema fields and types (lines 14–17)

```typescript
const MotivationalCounselingInputSchema = z.object({
  studentConcern: z.string(),   // The student's current emotional or academic concern
  studentHistory: z.string(),   // Brief background about recent challenges
});
```

### Output schema fields and types — after this execution

```typescript
export const MotivationalCounselingOutputSchema = z.object({
  advice: z.string(),                                            // Empathetic actionable advice
  severityLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']), // added by this execution
  escalationRequired: z.boolean(),                               // added by this execution
});
```

### Multi-step prompt template structure

The prompt implements a numbered counseling framework instructing the LLM to:
1. Assess severity and set escalationRequired
2. Analyze sentiment (emotions: stress, anxiety, burnout, frustration)
3. Acknowledge and validate the student's feelings
4. Offer compassionate perspective
5. Provide actionable nudging advice (Pomodoro, task breakdown, micro-rewards)
6. End with encouragement

---

## Action 2: Evaluate the prompt design

**Does the prompt adequately guide sentiment analysis?**  
After this execution's changes: yes. Step 1 now explicitly maps severity levels (CRITICAL/HIGH/MEDIUM/LOW) before sentiment analysis, giving the LLM a structured decision tree. Previously, sentiment was identified informally with no output capture.

**Are the five-step counseling instructions clear?**  
Yes. Each step is bolded with concrete sub-instructions (e.g., "If stress/burnout is high, suggest Pomodoro technique"). The constraint "not a clinical list" prevents robotic enumerated outputs.

**Is the tone guidance effective?**  
"Conversational, warm, and supportive" is clear. The example acknowledgement phrase gives the LLM a concrete template to follow.

---

## Action 3: Assess safety and ethical considerations

**Does the prompt handle crisis situations?**  
Before this execution: No. A student expressing suicidal ideation would receive a standard motivational response.

After this execution: A CRITICAL SAFETY RULE was prepended to the prompt:

```
CRITICAL SAFETY RULE: If the student expresses any thoughts of self-harm, suicide,
or severe crisis, set escalationRequired to true, severityLevel to "CRITICAL", and
respond with: "I'm really concerned about what you've shared. Please reach out to a
trusted adult, your school counselor, or a crisis helpline immediately. You are not
alone." Do NOT attempt general counseling advice in a crisis.
```

**Are there escalation paths?**  
Before: No. After: `escalationRequired: boolean` is now in the output schema, enabling the application layer to notify teachers/parents when `true`.

**Safeguards against harmful advice:**  
The prompt structure (validate -> advise -> encourage) reduces harmful advice risk. The added CRITICAL rule prevents counseling attempts during crisis.

---

## Action 4: Evaluate educational and psychological effectiveness

**Does the prompt cover key student stress scenarios?**

| Scenario | Covered |
|----------|---------|
| Exam anxiety / burnout | yes (Pomodoro, breaks) |
| Low motivation | yes (task breakdown, micro-rewards) |
| Feeling stuck | yes (gentle guiding questions) |
| Severe crisis / self-harm | yes after this execution (crisis redirect) |
| JEE/NEET pressure, parental expectations | not explicitly covered |

**Is Pomodoro technique and task-breaking appropriate?**  
Yes. These are evidence-based techniques from behavioral psychology and are appropriate for the student age group.

**Does the prompt balance empathy with actionable guidance?**  
Yes. Steps 3-4 cover empathy, step 5 covers action, step 6 covers encouragement — a balanced progression.

---

## Action 5: Recommend improvements — changes applied

### Change 1: Added `severityLevel` and `escalationRequired` to output schema

**Before:**
```typescript
export const MotivationalCounselingOutputSchema = z.object({
  advice: z.string().describe('Empathetic and actionable advice for the student.'),
});
```

**After:**
```typescript
export const MotivationalCounselingOutputSchema = z.object({
  advice: z.string().describe('Empathetic and actionable advice for the student.'),
  severityLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .describe('Assessed severity of the student\'s concern.'),
  escalationRequired: z.boolean()
    .describe('Whether the concern requires escalation to a teacher, parent, or crisis service.'),
});
```

### Change 2: Added crisis safety guardrail and severity assessment step to prompt

The prompt was updated to prepend a CRITICAL SAFETY RULE for crisis/self-harm scenarios and add a new Step 1 (Assess Severity) before the existing sentiment analysis step, renumbering subsequent steps accordingly.

**File modified:** `src/ai/flows/mindful-mentor.ts`
