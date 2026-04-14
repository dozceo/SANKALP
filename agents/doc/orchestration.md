# Orchestration Engine

The Orchestration layer is the "central nervous system" of the SANKALP-AEI Agents infrastructure. It integrates **dynamic skill loading** and **design-system validation** at every stage to ensure each component operates with domain-expert knowledge and visual fidelity.

```mermaid
graph TD
    subgraph Orchestration Layer
        Orch[Orchestrator]
        Plan[Planner]
        Disp[Dispatcher]
        Rev[Reviewer Pipeline]
    end

    subgraph Skill Infrastructure
        SReg[Skill Registry]
        SLoad[Skill Loader]
        SReg --> SLoad
    end

    subgraph Design Infrastructure
        DLoad[Design Loader]
        DAssets[(agents/design/<br/>22 Screens)]
        DAssets --> DLoad
    end

    Orch -->|"1. Decomposes Task"| Plan
    Plan -->|"2. Task DAG"| Disp
    Disp -->|"3. Per-Agent Skill<br/>Resolution"| SLoad
    SLoad -->|"4. Injected Context"| Disp
    Disp -->|"5. Design Refs<br/>(frontend tasks)"| DLoad
    DLoad -->|"6. DESIGN.md +<br/>code.html"| Disp
    Disp -->|"7. Sends Code"| Rev
    DLoad -.->|"Design Spec +<br/>Static Checklist"| Rev

    style Orch fill:#D35400,stroke:#E67E22,color:#fff
    style SReg fill:#6C3483,stroke:#A569BD,color:#fff
    style SLoad fill:#1A5276,stroke:#2E86C1,color:#fff
    style Rev fill:#1E8449,stroke:#27AE60,color:#fff
    style DLoad fill:#C0392B,stroke:#E74C3C,color:#fff
    style DAssets fill:#C0392B,stroke:#E74C3C,color:#fff
```

## 1. Orchestrator (`src/core/orchestrator.ts`)
The `Orchestrator` is the top-level class invoked by the CLI. It handles:
- **Initialization**: Loading API keys, mounting the Git/FS tools, and spinning up the Context Engine.
- **Workflow Pipeline**: Calling the Planner, Dispatching the tasks, running the Quality Gate, and pushing to Git.
- **Skills Traceability**: The final report now includes a `## Skills Injected` section listing which `SKILL.md` files were loaded into each agent's context window.
- **Design Traceability**: Frontend tasks log which design screen references were loaded (e.g., `🎨 Design refs loaded: Student Dashboard`).
- **Reporting**: Generating Markdown reports showing exactly how long the execution took, which tokens were used, and what files failed the QA gate.

## 2. Planner (`src/core/planner.ts`)
When given a highly ambiguous natural language task (e.g., "Build the missing routes"), the Planner:
- Reads `tasks.md` to spot missing project components.
- Scans `src/` to see the current codebase.
- Commands the heavy-tier LLM (`gemini-3.1-pro-preview`) to break the goal into atomic `subtasks`.
- Wires the subtasks together in a DAG (Directed Acyclic Graph) via the `TaskGraphManager`. (E.g., "Tests" must depend on "Backend").

```mermaid
flowchart LR
    subgraph Planner Inputs
        T[tasks.md] --> P
        W[Wiki Context] --> P
        FS[File Scanner] --> P
    end

    P[Planner LLM Call<br/>gemini-3.1-pro] -->|JSON| DAG

    subgraph DAG["Task Graph (DAG)"]
        direction TB
        N1[Backend Routes] --> N3[Integration Wiring]
        N2[Frontend Pages] --> N3
        N3 --> N4[Testing]
        N3 --> N5[DevOps Config]
    end

    style P fill:#D35400,stroke:#E67E22,color:#fff
    style DAG fill:#1A5276,stroke:#2E86C1,color:#fff
```

## 3. Dispatcher (`src/core/dispatcher.ts`)
The `Dispatcher` queries the `TaskGraphManager` for actionable nodes. If a task has met all its dependencies, standard parallelization allows multiple agents to hit the codebase concurrently.
- Protects against concurrency collisions by running file modifications sequentially where API rate limits demand.
- **Skill Resolution**: Before dispatching to an agent, the system resolves which skills that agent will receive based on the task keywords.
- **Design Resolution**: For Frontend tasks, the `DesignLoader` automatically detects matching screens and prepares design context.

```mermaid
flowchart TB
    DAG[Task Graph<br/>Manager] -->|Ready Tasks| D[Dispatcher]

    D --> Check{Dependencies<br/>Met?}
    Check -->|No| Wait[Wait for deps]
    Wait --> DAG
    Check -->|Yes| Resolve[Resolve Skills<br/>for Agent Role]
    Resolve --> Design{Frontend<br/>Task?}
    Design -->|Yes| DLoad[Load Design Refs<br/>DESIGN.md + code.html]
    Design -->|No| Exec
    DLoad --> Exec[Execute Agent<br/>with Skills + Design Context]
    Exec --> Result{Success?}
    Result -->|Yes| Mark[Mark Completed]
    Result -->|No| Fail[Mark Failed]
    Mark --> DAG
    Fail --> DAG

    style D fill:#D35400,stroke:#E67E22,color:#fff
    style Resolve fill:#6C3483,stroke:#A569BD,color:#fff
    style Exec fill:#1E8449,stroke:#27AE60,color:#fff
    style DLoad fill:#C0392B,stroke:#E74C3C,color:#fff
```

## 4. Reviewer Pipeline (`src/core/reviewer.ts`)
Before any code goes to a git commit, it passes through a **four-stage pipeline** — now enhanced with design-system compliance checking:

- **Stage 1 (Review):** LLM flags generic architectural or type errors.
- **Stage 2 (Debug):** The system literally runs `npx tsc --noEmit` and captures compiler errors.
- **Stage 3 (Visual Validation):** **Two-pass design-aware audit:**
  - **3a. Static Design Checklist** (zero LLM cost): 8 rules checked against generated code:
    1. Manrope font imported
    2. Inter font imported
    3. Primary color token (#702ae1) used
    4. No generic color values (bg-blue-*, bg-red-*)
    5. No hard 1px solid borders (No-Line Rule)
    6. Neumorphic shadow classes present
    7. Elements are rounded (border-radius >= 1rem)
    8. Primary CTA uses gradient fill
  - **3b. LLM Design Audit:** Passes static checklist results + DESIGN.md spec into an LLM prompt for deeper structural and design validation.
- **Stage 4 (Improve):** Automatically fixes problems flagged in previous stages (including design violations).

```mermaid
stateDiagram-v2
    [*] --> Stage1_Review

    Stage1_Review --> Stage2_Debug : Score Assessed
    Stage2_Debug --> Stage3_Validation : TypeCheck Complete

    Stage3_Validation --> Approved : All Passed (Score >= 70)
    Approved --> [*]

    Stage1_Review --> Stage4_Improve : Score < 80
    Stage2_Debug --> Stage4_Improve : TS Errors Found
    Stage3_Validation --> Stage4_Improve : Design Violations

    Stage4_Improve --> Stage1_Review : Retry with Fixes

    state Stage1_Review {
        [*] --> LLM_Review
        LLM_Review --> Score_Assessment
        Score_Assessment --> [*]
    }

    state Stage2_Debug {
        [*] --> TSC_NoEmit
        TSC_NoEmit --> Parse_Errors
        Parse_Errors --> [*]
    }

    state Stage3_Validation {
        [*] --> Static_Checklist
        Static_Checklist --> Design_Spec_Load
        Design_Spec_Load --> LLM_Design_Audit
        LLM_Design_Audit --> Merge_Issues
        Merge_Issues --> [*]
    }

    state Stage4_Improve {
        [*] --> Collect_Issues
        Collect_Issues --> LLM_Fix
        LLM_Fix --> Apply_Fixes
        Apply_Fixes --> [*]
    }
```

### Visual Validation Deep Dive

```mermaid
flowchart TB
    FILES[Generated .tsx / .css files] --> FILTER{Frontend<br/>Files?}
    FILTER -->|No| SKIP[Skip Design Check]
    FILTER -->|Yes .tsx .jsx .css .html| STATIC[Static Design Checklist<br/>8 Rules - Zero LLM Cost]

    STATIC --> FONTS{Manrope +<br/>Inter?}
    STATIC --> COLORS{Design Token<br/>Colors?}
    STATIC --> BORDERS{No 1px<br/>solid?}
    STATIC --> SHADOWS{Neumorphic<br/>Shadows?}

    FONTS & COLORS & BORDERS & SHADOWS --> RESULT[Checklist Results<br/>Pass/Fail per Rule]

    RESULT --> DETECT[DesignLoader.loadDesignForTask]
    DETECT --> SPEC[Load DESIGN.md Spec<br/>for Matched Screen]
    RESULT & SPEC --> LLM[LLM Design Audit<br/>Structural + Design Compliance]
    LLM --> MERGE[Merge Static + LLM Issues]
    MERGE --> FINAL{All<br/>Passed?}
    FINAL -->|Yes| OK[Visual Validation Passed]
    FINAL -->|No| FAIL[Issues Sent to Improve Loop]

    style STATIC fill:#C0392B,stroke:#E74C3C,color:#fff
    style SPEC fill:#C0392B,stroke:#E74C3C,color:#fff
    style LLM fill:#8E44AD,stroke:#9B59B6,color:#fff
    style OK fill:#1E8449,stroke:#27AE60,color:#fff
    style FAIL fill:#E74C3C,stroke:#C0392B,color:#fff
```

## Complete Orchestration Data Flow

```mermaid
flowchart TB
    CLI[CLI Input] --> ORCH[Orchestrator.run]

    ORCH --> ENV[Load .env.agents<br/>30 API Keys]
    ORCH --> P1[Phase 1: Planning]
    P1 --> P2[Phase 2: Execution]
    P2 --> P3[Phase 3: QA Pipeline]
    P3 --> P4[Phase 4: Commit]

    subgraph "Phase 2 Detail"
        P2 --> D[Dispatcher]
        D --> |Per Task| SK[Skill Loader<br/>Core + Keyword Skills]
        D --> |Frontend| DL[Design Loader<br/>Screen Refs]
        SK & DL --> AG[Agent.execute]
        AG --> FC[File Changes]
    end

    subgraph "Phase 3 Detail"
        P3 --> R[Stage 1: Code Review]
        R --> DB[Stage 2: tsc --noEmit]
        DB --> V[Stage 3: Design Validation<br/>Static Checklist + LLM Audit]
        V --> |Issues| IMP[Stage 4: Auto-Improve]
        IMP --> R
    end

    P4 --> BR[Create Branch]
    BR --> ST[Stage Files]
    ST --> CM[Commit + Report]
    CM --> |Includes| SK_RPT[Skills + Design<br/>Traceability]

    style ORCH fill:#D35400,stroke:#E67E22,color:#fff
    style SK fill:#6C3483,stroke:#A569BD,color:#fff
    style AG fill:#1A5276,stroke:#2E86C1,color:#fff
    style SK_RPT fill:#6C3483,stroke:#A569BD,color:#fff
    style DL fill:#C0392B,stroke:#E74C3C,color:#fff
    style V fill:#C0392B,stroke:#E74C3C,color:#fff
```
