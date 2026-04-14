# Polyglot Type Consistency Report

> Generated automatically by `scripts/polyglot_analysis.ts`

## 1. Executive Summary
🔴 **CRITICAL ISSUES FOUND**: 1 issues detected that may cause data corruption or silent failures.

## 2. Visual Schema Map
### PythonTrainingData (python)
Source: `src/ml/training/generate_data.py`
| Field | Type | Notes |
|---|---|---|
| `avg_quiz_score` | `float` | Required |
| `attempts_per_topic` | `any` | Required |
| `days_since_last_revision` | `any` | Required |
| `quiz_score_variance` | `float` | Required |
| `time_spent_per_question` | `float` | Required |
| `mastered` | `int` | Required |

### MasteryPredictionInput (typescript)
Source: `src/ml/inference/types.ts`
| Field | Type | Notes |
|---|---|---|
| `avg_quiz_score` | `number` | Required |
| `attempts_per_topic` | `number` | Required |
| `days_since_last_revision` | `number` | Required |
| `quiz_score_variance` | `number` | Required |
| `time_spent_per_question` | `number` | Required |

### QuizResult (typescript)
Source: `src/lib/db-helpers.ts`
| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Optional |
| `studentId` | `string` | Required |
| `classId` | `string` | Optional |
| `teacherId` | `string` | Optional |
| `topic` | `string` | Required |
| `score` | `number` | Required |
| `timeSpent` | `number` | Required |
| `questionsAttempted` | `number` | Required |
| `questionsCount` | `number` | Optional |
| `timestamp` | `Date` | Required |

### Student (typescript)
Source: `src/lib/db-helpers.ts`
| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Required |
| `userId` | `string` | Required |
| `email` | `string` | Required |
| `name` | `string` | Required |
| `classId` | `string` | Optional |
| `className` | `string` | Optional |
| `classSubject` | `string` | Optional |
| `teacherId` | `string` | Optional |
| `teacherName` | `string` | Optional |
| `grade` | `string` | Optional |
| `joinedClassAt` | `Date` | Optional |
| `registrationDate` | `Date` | Required |
| `lastLoginDate` | `Date` | Required |
| `chatbotPersonality` | `string` | Optional |
| `chatbotInstructions` | `string` | Optional |
| `onboardingCompleted` | `boolean` | Optional |

### AdaptiveQuizInputSchema (zod)
Source: `src/ai/flows/adaptive-quiz-engine.ts`
| Field | Type | Notes |
|---|---|---|
| `topic` | `string` | Required |
| `numQuestions` | `number` | Required |
| `educationLevel` | `string` | Required |
| `difficulty` | `string` | Required |

### AdaptiveQuizOutputSchema (zod)
Source: `src/ai/flows/adaptive-quiz-engine.ts`
| Field | Type | Notes |
|---|---|---|
| `quiz` | `array` | Required |
| `question` | `string` | Required |
| `options` | `array` | Required |
| `correctAnswer` | `string` | Required |
| `isFallback` | `boolean` | Optional |

## 3. Cross-Language Type Diff Matrix
### Python ML vs TypeScript Features
| Field | Python Type | TypeScript Type | Status |
|---|---|---|---|
| `avg_quiz_score` | float | number | ✅ Match |
| `attempts_per_topic` | any | number | ✅ Match |
| `days_since_last_revision` | any | number | ✅ Match |
| `quiz_score_variance` | float | number | ✅ Match |
| `time_spent_per_question` | float | number | ✅ Match |
| `mastered` | int | MISSING | ❌ Missing in TS |

### Firestore QuizResult vs ML Features
| Field | Firestore Type | ML Feature Type | Status |
|---|---|---|---|
| `avg_quiz_score` | number | number | 🔄 Derived from score |
| `attempts_per_topic` | MISSING | number | ❌ Not in QuizResult (Needs derivation) |
| `days_since_last_revision` | MISSING | number | ❌ Not in QuizResult (Needs derivation) |
| `quiz_score_variance` | MISSING | number | ❌ Not in QuizResult (Needs derivation) |
| `time_spent_per_question` | number | number | 🔄 Derived from timeSpent |

## 4. Detected Failures & Recommendations

### 🔴 SEMANTIC_DRIFT: Potential semantic drift: TypeScript calculates standard deviation (Math.sqrt(variance)) but assigns it to a field named "quiz_score_variance". Python model likely expects variance (squared units) or was trained on a different distribution.
- **Source:** `src/ml/features/student_features.ts`
- **Target:** `Python ML Model`
- **Impact:** Silent model degradation or runtime errors.

## 5. Schema Evolution Impact Analysis
Simulating addition of new field `reading_level`:
- ⚠️ **PythonTrainingData**: Missing. Would need update in training data generation and model retraining.
- ⚠️ **MasteryPredictionInput**: Missing. Would need update in interface definition.
- ⚠️ **QuizResult**: Missing. Would need update in interface definition.
- ⚠️ **Student**: Missing. Would need update in interface definition.
- ⚠️ **AdaptiveQuizInputSchema**: Missing. Would need update in Zod schema definition.
- ⚠️ **AdaptiveQuizOutputSchema**: Missing. Would need update in Zod schema definition.

Simulating addition of new field `quiz_score_variance`:
- ✅ **PythonTrainingData**: Field already exists.
- ✅ **MasteryPredictionInput**: Field already exists.
- ⚠️ **QuizResult**: Missing. Would need update in interface definition.
- ⚠️ **Student**: Missing. Would need update in interface definition.
- ⚠️ **AdaptiveQuizInputSchema**: Missing. Would need update in Zod schema definition.
- ⚠️ **AdaptiveQuizOutputSchema**: Missing. Would need update in Zod schema definition.
