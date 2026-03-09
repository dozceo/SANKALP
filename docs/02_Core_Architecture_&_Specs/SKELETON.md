# 🧬 SANKALP Architecture Skeleton

> Core working model of the SANKALP intelligence system

---

## Purpose

This document defines the core operational architecture of SANKALP.
It does not describe UI, styling, visual design, or prototype behavior.
It defines the model of how the system senses learning activity, computes learner state, decides academic actions, generates adaptive outputs, records outcomes, and remains extensible for future core upgrades.

This document aligns:
- the current repository structure,
- the long-term SANKALP system vision,
- the intelligence-first platform model,
- and the upcoming [[Core Block Upgrade]] direction.

---

## 📋 Quick Navigation

- [[ARCHITECTURE]]
- [[Architecture Map]]
- [[DATABASE]]
- [[ADK]]
- [[ML System]]
- [[Core Block Upgrade]]

---

## 🎯 System Identity

SANKALP is not a content-delivery application.
SANKALP is an academic intelligence system.

Its purpose is to convert educational interaction into:
- learner-state understanding,
- adaptive academic decisioning,
- personalized intervention,
- memory-aware reinforcement,
- and self-improving educational orchestration.

At the highest level, the system works as:

```text
Input → State Modeling → Decisioning → Generation → Feedback → Memory → Improvement
```

---

## 🧠 Canonical System Principle

### Core Rule

**Data observes the learner.**  
**ML estimates the learner.**  
**ADK decides the response.**  
**LLM expresses the response.**  
**The system records the outcome.**  
**The model improves over time.**

This means:
- the learner does not directly control the teaching policy,
- the LLM does not decide academic strategy,
- the ML layer does not generate pedagogy on its own,
- and the interface is only a delivery surface, not the intelligence core.

### Operational Separation

- **Interaction systems** capture evidence.
- **State systems** model the learner.
- **Decision systems** choose the next academic action.
- **Generation systems** express the action in usable form.
- **Memory systems** preserve longitudinal continuity.
- **Upgrade systems** extend the architecture without breaking the core.

---

## 🏗️ Core Architecture Blocks

## 1. Identity Block

This block defines who is acting inside the system.

### Responsibilities
- student identity
- teacher identity
- role resolution
- onboarding state
- academic affiliation
- access scope
- ownership of records

### Core Outputs
- `actor_id`
- `actor_role`
- `academic_context`
- `institutional_scope`
- `access_scope`

This block anchors all downstream computation.

---

## 2. Interaction Capture Block

This block captures raw educational behavior.

### Inputs
- quiz attempts
- revision actions
- chat activity
- voice interactions
- session frequency
- session duration
- inactivity windows
- completion patterns
- content access behavior
- teacher interventions

### Purpose
Convert user behavior into machine-readable evidence.

### Output Classes
- performance signals
- engagement signals
- retention signals
- progression signals
- intervention signals

This is the sensing layer of the architecture.

---

## 3. Academic Memory Block

This block preserves learning continuity across time.

### Stores
- student profile
- teacher profile context
- subject/chapter/topic structures
- mastery history
- revision history
- quiz history
- intervention history
- generated learning artifacts
- retrieval documents
- decision logs
- feature snapshots

### Purpose
Without memory, the system becomes session-based and loses true personalization.

### Core Rule
SANKALP must remember:
- what the learner studied,
- how the learner performed,
- how stable that understanding is,
- and what action the system already took.

---

## 4. Knowledge Structure Block

This block represents academic knowledge as structured learning state.

### Core Hierarchy
- learner
- subject
- chapter
- topic
- skill
- weakness
- strength
- peer relationship
- study material

### Purpose
Transform learning from flat content access into structured cognition.

### Functions
- map academic domains
- connect topics and dependencies
- identify weak nodes
- track strength growth
- support brain-map logic
- support future graph-native recommendations

This is the structural cognition layer of SANKALP.

---

## 5. Feature Engineering Block

This block converts raw activity into predictive inputs.

### Example Features
- average quiz score
- attempts per topic
- score variance
- days since last revision
- revision frequency
- time spent per question
- session frequency
- average session duration
- inactivity duration
- quiz completion rate
- performance trend
- topic difficulty
- initial mastery score

### Purpose
Compress noisy learner activity into stable model signals.

### Output
A normalized learner-state feature vector.

This block bridges raw evidence and [[ML System]] inference.

---

## 6. Predictive Intelligence Block

This block estimates learner state.

### Current Prediction Families

#### a. Topic Mastery Prediction
Estimates whether the learner has truly mastered a topic.

#### b. Forgetting / Retention Prediction
Estimates when the learner is likely to forget material without reinforcement.

#### c. Attention / Disengagement Prediction
Estimates whether the learner is at risk of losing focus, consistency, or momentum.

### Core Outputs
- mastery probability
- confidence score
- days until forget
- retention confidence
- attention risk class
- dropout probability
- performance trend

### Purpose
This layer predicts what is likely true.
It does not choose what should happen next.

---

## 7. [[ADK]] Decision Block

This block is the deterministic academic orchestration layer.

### Role
[[ADK]] receives:
- predictive signals,
- learner context,
- time urgency,
- exam context,
- policy constraints,
- intervention rules,
- and system conditions,

then decides:
- what action should occur,
- with what priority,
- using which strategy,
- and whether escalation is needed.

### Example Decision Classes
- urgent revision
- scheduled revision
- adaptive teaching
- challenge mode
- progress allowed
- motivational support
- teacher alert
- skip topic
- exam-cram mode

### Why This Block Exists
Without [[ADK]]:
- LLM behavior becomes inconsistent,
- policy becomes non-auditable,
- educational strategy becomes unstable,
- and cost/latency become harder to control.

### Core Rule
**Prediction is probabilistic. Decision is deterministic.**

---

## 8. Cognitive Generation Block

This block expresses the chosen academic response.

### Current / Expected Modes
- explanation generation
- adaptive quiz generation
- syllabus generation
- mentor dialogue
- multilingual assistance
- text-to-speech
- speech-to-speech
- supportive error translation
- future guided tutoring agents

### Constraint
This block does not define policy.
It is bounded by [[ADK]], learner context, retrieval grounding, and safety rules.

### Purpose
Translate decisions into human-usable educational output.

### Output Forms
- explanation
- quiz
- revision plan
- encouragement
- voice response
- personalized task
- scaffolded concept support
- teacher-facing summary

---

## 9. Retrieval / Grounding Block

This block grounds generation in actual learner context.

### Sources
- learner profile documents
- academic history
- teacher instructions
- study materials
- brain-map context
- internal knowledge artifacts
- future curriculum corpora
- future institutional repositories

### Purpose
Ensure the system answers from learner truth, not only general model fluency.

### Value
This block is essential for:
- personalization,
- contextual integrity,
- auditability,
- explainability,
- and future system scale.

---

## 10. Intervention Block

This block escalates beyond self-guided flow when risk thresholds are crossed.

### Modes
- student-only support
- teacher-facing alerting
- mentor-facing engagement
- future parent-facing awareness
- automated academic recovery pathways

### Trigger Classes
- low mastery with urgent forgetting
- severe disengagement risk
- repeated failure on key topics
- exam proximity with low readiness
- motivational decline
- abnormal academic behavior shifts

### Purpose
SANKALP should not only respond.
It should know when intervention is required.

---

## 11. Feedback and Outcome Block

This block records what happened after the system acted.

### Captured Outcomes
- whether the learner engaged
- whether quiz performance improved
- whether revision occurred on time
- whether generated content was completed
- whether intervention reduced risk
- whether mastery stabilized
- whether progression improved

### Purpose
Every system action must become future evidence.

This closes the loop between action and learning intelligence.

---

## 12. [[Core Block Upgrade]] Layer

This block defines how future system intelligence expands safely.

### Role
Allow future capability blocks to connect to the architecture without rewriting the core operating model.

### Upgrade-Compatible Areas
- deeper learner memory engines
- spaced-repetition intelligence
- graph-native planning
- institutional analytics
- parent intelligence systems
- autonomous learning planners
- multimodal cognition blocks
- offline-first predictive caching
- model routing and cost-aware orchestration
- explainability and audit engines
- digital academic twin systems
- long-horizon trajectory planning

### Upgrade Rule
Every future block must integrate through one or more of:
- state contracts
- decision contracts
- memory contracts
- intervention contracts
- analytics contracts

This keeps upgrades additive instead of fragmenting the architecture.

---

## 🔄 Canonical End-to-End Flow

## Learning Intelligence Flow

1. learner performs an action  
2. the system captures the event  
3. the event is normalized and stored  
4. features are extracted  
5. predictive models estimate learner state  
6. [[ADK]] evaluates academic policy  
7. retrieval gathers grounding context  
8. generation produces the bounded response  
9. the learner receives the output  
10. learner reaction is recorded  
11. memory and analytics are updated  
12. future recommendations improve  

### Canonical Summary

**Observe → Model → Decide → Generate → Record → Improve**

---

## 📦 Primary System Objects

## Learner State Object
Contains the live academic condition of the learner.

### Includes
- identity
- role
- subject map
- topic mastery map
- revision urgency
- attention state
- performance trend
- intervention risk
- progression state
- activity state

---

## Knowledge Graph Object
Contains the structured representation of academic learning nodes.

### Includes
- subject nodes
- chapter nodes
- topic nodes
- weakness nodes
- strength nodes
- hierarchy edges
- dependency edges
- progression edges

---

## Prediction Object
Contains outputs from the [[ML System]].

### Includes
- mastery estimate
- forgetting estimate
- attention estimate
- confidence values
- derived risk signals

---

## Decision Object
Contains policy outputs from [[ADK]].

### Includes
- action
- priority
- strategy
- duration target
- tone
- difficulty mode
- example/visual flags
- escalation flags
- reasoning
- audit tags

---

## Intervention Object
Contains escalated support actions.

### Includes
- severity
- trigger source
- target actor
- prescribed response
- resolution status
- outcome history

---

## 📏 Core Architectural Laws

## Law 1: State Before Response
The system must infer learner state before generating pedagogy.

## Law 2: Policy Before Generation
The system must decide what to do before asking the LLM to express it.

## Law 3: Memory Before Personalization
Personalization without persistent memory is imitation, not intelligence.

## Law 4: Determinism at the Orchestration Layer
Core academic decisions must remain inspectable and reproducible.

## Law 5: Feedback Closes the Loop
Every educational action should become evidence for future improvement.

## Law 6: Upgrades Must Attach, Not Replace
Future core blocks should extend the core through contracts, not fragmented side logic.

## Law 7: Interface Is Not Architecture
Pages, components, and styling are delivery surfaces, not the system model.

---

## 🔗 Current Repository Alignment

This architecture aligns with the current repository direction:
- Next.js App Router for application runtime
- TypeScript-first orchestration
- Firebase Auth for identity
- Firestore / Storage for persistence
- Genkit + Gemini for controlled generation
- Python ML for predictive inference
- TypeScript feature engineering and decisioning
- retrieval-aware grounding
- ADK policy orchestration
- graph-oriented learner knowledge structures

This means the skeleton is not just aspirational.
It is grounded in the current SANKALP system base.

---

## 🚀 Future Compatibility

The architecture is intentionally designed so future upgrades can attach without redesigning the whole platform.

### Planned-Compatible Expansion Zones
- memory consolidation systems
- spaced repetition engines
- graph-based curriculum traversal
- teacher command intelligence
- parent awareness systems
- autonomous long-horizon planning
- multimodal sensing blocks
- offline inference layers
- district/institution learning analytics
- trust and explainability overlays
- what-if academic forecasting

### Requirement for New Blocks
Each future block must explicitly define:
- what it consumes,
- what it outputs,
- where it writes memory,
- how it affects [[ADK]],
- and how outcomes are evaluated.

---

## ✅ Final Model Summary

SANKALP is a modular educational intelligence architecture built around six permanent ideas:

1. learner activity is continuously sensed  
2. learner state is computationally modeled  
3. academic decisions are policy-driven  
4. generated outputs are constrained and contextual  
5. outcomes are remembered longitudinally  
6. future intelligence blocks can attach to the same core spine  

### Core Spine

**Identity → Interaction → Memory → Features → Prediction → Decision → Retrieval → Generation → Intervention → Feedback → Upgrade**

That is the architectural skeleton of SANKALP.