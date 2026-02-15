# LLM Cost Projection Model

## Overview
This document provides a cost projection for LLM usage within the application, specifically focusing on the `src/ai/flows/` and related AI features. Estimates are based on current prompt structures, projected token usage, and standard pricing for **Gemini 2.0 Flash**.

## Pricing Assumptions
*   **Model**: Gemini 2.0 Flash
*   **Input Cost**: $0.10 per 1 million tokens
*   **Output Cost**: $0.40 per 1 million tokens
*   **Audio/Multimodal Cost**: Estimated at ~20x text cost for inputs and significantly higher for generated audio (TTS), though specific preview pricing may vary.

## Per-Feature Analysis

### 1. Adaptive Quiz Engine (`adaptive-quiz-engine.ts`)
Generates structured quizzes based on topic and difficulty.
*   **Input**: ~200 tokens (System prompt + User topic/settings)
*   **Output**: ~500 tokens (5 questions, options, answers in JSON)
*   **Cost per Call**: ~$0.00022
*   **Projected Daily Usage**: 2 quizzes/user
*   **Daily Cost/User**: $0.00044

### 2. Custom Cognitive Chatbot (`custom-cognitive-chatbot.ts`)
Explains concepts with specific personality/instruction.
*   **Input**: ~500 tokens (System + Large context/brain map)
*   **Output**: ~300 tokens (Explanation)
*   **Cost per Call**: ~$0.00017
*   **Projected Daily Usage**: 10 interactions/user
*   **Daily Cost/User**: $0.00170

### 3. Mindful Mentor (`mindful-mentor.ts`)
Provides emotional support and advice.
*   **Input**: ~400 tokens (System + Student history/concern)
*   **Output**: ~400 tokens (Empathetic advice)
*   **Cost per Call**: ~$0.00020
*   **Projected Daily Usage**: 1 interaction/user
*   **Daily Cost/User**: $0.00020

### 4. Multilingual Chatbot (`multilingual-cognitive-chatbot.ts`)
Explains concepts in target languages.
*   **Input**: ~200 tokens
*   **Output**: ~300 tokens
*   **Cost per Call**: ~$0.00014
*   **Projected Daily Usage**: 2 interactions/user
*   **Daily Cost/User**: $0.00028

### 5. Smart Revision Planner (`smart-revision-planner.ts`)
Explains revision reasons (ML decides *what*, LLM explains *why*).
*   **Input**: ~400 tokens (System + Topic list)
*   **Output**: ~250 tokens (Explanations)
*   **Cost per Call**: ~$0.00014
*   **Projected Daily Usage**: 1 session/user
*   **Daily Cost/User**: $0.00014

### 6. Syllabus Generator (`syllabus-generator.ts`)
Creates detailed study plans.
*   **Input**: ~200 tokens
*   **Output**: ~1,000 tokens (Extensive JSON structure)
*   **Cost per Call**: ~$0.00042
*   **Projected Daily Usage**: 0.1 (Once every 10 days)
*   **Daily Cost/User**: $0.00004

### 7. AI Error Handling (`src/app/actions/ai-error.ts`)
Generates user-friendly error messages.
*   **Input**: ~200 tokens
*   **Output**: ~50 tokens
*   **Cost per Call**: ~$0.00004
*   **Projected Daily Usage**: 0.5 (Occasional errors)
*   **Daily Cost/User**: $0.00002

### 8. Voice Interaction (Speech-to-Speech & Text-to-Speech)
*   **Speech-to-Speech**: High cost due to audio input (STT) and audio output (TTS).
    *   Est. Cost/Call: ~$0.005 - $0.01
*   **Text-to-Speech**: Audio generation cost.
    *   Est. Cost/Call: ~$0.001 - $0.005
*   **Projected Daily Usage**: 10 combined interactions
*   **Daily Cost/User**: ~$0.03 (Dominates the budget)

## Cost Projections

### Text-Only Usage (Core Learning Features)
| User Base | Daily Cost | Monthly Cost |
|-----------|------------|--------------|
| 1 User    | $0.003     | $0.09        |
| 100 Users | $0.30      | $9.00        |
| 1,000 Users | $3.00    | $90.00       |
| 10,000 Users | $30.00  | $900.00      |

### With Voice Features (High Engagement)
*Includes frequent use of Speech-to-Speech and TTS.*

| User Base | Daily Cost | Monthly Cost |
|-----------|------------|--------------|
| 1 User    | $0.033     | $1.00        |
| 100 Users | $3.30      | $100.00      |
| 1,000 Users | $33.00   | $1,000.00    |
| 10,000 Users | $330.00 | $10,000.00   |

## Recommendations for Cost Control

1.  **Cache Aggressively**:
    *   The `ai-error.ts` already implements caching. Extend this to `syllabus-generator.ts` (syllabi rarely change) and `adaptive-quiz-engine.ts` (cache quizzes for specific topics/levels).
2.  **Limit Voice Features**:
    *   Voice interaction is the primary cost driver (10x text). Consider making this a "Pro" feature or rate-limiting it for free users.
3.  **Optimize Prompts**:
    *   Reduce system prompt verbosity in `custom-cognitive-chatbot.ts` and `mindful-mentor.ts` where context windows are large.
4.  **Batch Processing**:
    *   The `smart-revision-planner.ts` effectively batches explanations. Ensure other features batch requests where possible.
5.  **Monitor Audio Usage**:
    *   Strictly monitor usage of `speech-to-speech` and `text-to-speech` endpoints as they can scale costs unexpectedly.
