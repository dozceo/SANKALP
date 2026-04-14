# System Overview

The **SANKALP-AEI Multi-Agent Orchestration System** is an autonomous development pipeline housed in the `agents/` directory. It uses a pool of 30 Gemini API keys to autonomously execute development tasks, acting as a hyper-capable AI developer perfectly attuned to the specific architectural laws (Bayesian Brain Map™, Node.js/Next.js) of the SANKALP project.

## Architecture

The system mimics a software development team with **dynamic skill injection** and **design-system awareness** — each agent loads curated expertise from the 1,268-skill library at execution time, and the Frontend Agent additionally receives reference designs from the 22-screen design library:

1. **The Brain (Orchestrator)** acts as the Tech Lead, taking a high-level task and deciding how to accomplish it.
2. **The Planner** decomposes large tasks into actionable Graph nodes (a Directed Acyclic Graph of subtasks).
3. **The Dispatcher** parallelizes work and assigns nodes to specialized domain agents.
4. **Domain Agents** (Frontend, Backend, Integration, Testing, DevOps) load relevant skills and generate code.
5. **The Design Layer** (`DesignLoader`) maps task keywords to reference designs (DESIGN.md + code.html + screen.png) from `agents/design/`, automatically injecting visual references into Frontend Agent and Visual Validator context windows.
6. **The Quality Gate** (Reviewer Pipeline) enforces architecture review, TypeScript compilation checks, **design-system compliance** (static checklist + LLM audit), and self-improvement loops.
7. **The Branch Committer** automatically stages and commits changes onto feature branches.

```mermaid
graph TD
    User([User CLI]) -->|Task| Orch[Orchestrator]
    Orch --> Planner[Planner]
    Planner -->|DAG| Dispatcher[Dispatcher]

    subgraph Skill Layer
        SR[(Skill Registry<br/>1268 Skills)]
        SL[Skill Loader]
        SR -->|Lookup| SL
    end

    subgraph Design Layer
        DL[Design Loader<br/>22 Screens]
        DA[(agents/design/<br/>DESIGN.md + code.html)]
        DA -->|Read| DL
    end

    subgraph Domain Agents
        Dispatcher --> FA[Frontend Agent]
        Dispatcher --> BA[Backend Agent]
        Dispatcher --> IA[Integration Agent]
        Dispatcher --> TA[Testing Agent]
        Dispatcher --> DOA[DevOps Agent]
        Dispatcher --> TOA[Token Optimizer Agent]
    end

    SL -.->|Core + Keyword<br/>Activated Skills| FA
    SL -.->|Core + Keyword<br/>Activated Skills| BA
    SL -.->|Core + Keyword<br/>Activated Skills| IA
    SL -.->|Core + Keyword<br/>Activated Skills| TA
    SL -.->|Core + Keyword<br/>Activated Skills| DOA

    DL -.->|Reference HTML<br/>+ Design Spec| FA

    FA & BA & IA & TA & DOA & TOA --> OPT[Token Optimizer<br/>Middleware]
    OPT -->|Every callLLM| QG{Quality Gate}
    DL -.->|Design Checklist<br/>+ Spec| QG

    QG -->|Failed| Improve[Improve Loop]
    Improve --> QG
    QG -->|Passed| Committer[Branch Committer]

    style SR fill:#6C3483,stroke:#A569BD,color:#fff
    style SL fill:#1A5276,stroke:#2E86C1,color:#fff
    style Orch fill:#D35400,stroke:#E67E22,color:#fff
    style QG fill:#1E8449,stroke:#27AE60,color:#fff
    style OPT fill:#2E86C1,stroke:#5DADE2,color:#fff
    style TOA fill:#117A65,stroke:#1ABC9C,color:#fff
    style DL fill:#C0392B,stroke:#E74C3C,color:#fff
    style DA fill:#C0392B,stroke:#E74C3C,color:#fff
```

## Core Tenets
- **Skill-Aware Agents:** Each agent dynamically loads domain-specific expertise from the `skills/` library, grounding LLM outputs with proven patterns and best practices.
- **Design-Driven Frontend:** The Frontend Agent and Visual Validator receive pixel-accurate reference designs from `agents/design/` — 22 screens with DESIGN.md specs, Tailwind reference HTML, and screenshots.
- **Data Safety:** Uses `fs-tools.ts` to create localized backups in `agents/output/diffs/` before any file write.
- **API Resilience:** Uses exponential backoff and rate-limit tracking across 30 keys to guarantee robust API interactions.
- **SANKALP Specificity:** All agents are grounded in the `.gitnexus/wiki/` context and strict `Zod`/`Beta(α, β)` rules.

## The Execution Pipeline
When a user runs a task via the CLI (`npx tsx src/index.ts run "Build API"`):
1. **Plan:** The Context Engine reads the wiki and the codebase. The Planner decomposes the task into 5 to 10 subtasks.
2. **Skill Resolution:** For each assigned agent, the Skill Loader queries the Skill Registry and activates relevant `SKILL.md` files based on the agent role and task keywords.
3. **Design Resolution:** For frontend tasks, the Design Loader detects which screen(s) the task targets (via 40+ keyword mappings) and loads the reference `DESIGN.md` + `code.html` from `agents/design/`.
4. **Execute:** Domain Agents receive their loaded skill context + design references alongside wiki + codebase context and generate code.
5. **Design Validation:** The Visual Validator runs an 8-point static design checklist (fonts, colors, borders, shadows) at zero LLM cost, then passes results + DESIGN.md spec into an LLM audit.
6. **Review:** Output is evaluated. If it fails typing, architectural rules, or design compliance, an `<Improve>` loop runs.
7. **Commit:** Success leads to an automated git commit with a detailed statistics report including skills traceability.

```mermaid
sequenceDiagram
    participant User
    participant CLI
    participant Context as Context Engine
    participant Skills as Skill Loader
    participant Design as Design Loader
    participant Planner
    participant Agents as Domain Agents
    participant QA as Quality Gate
    participant Git

    User->>CLI: npx tsx src/index.ts run Task
    CLI->>Context: Scan wiki & codebase
    Context-->>Planner: Inject context guidelines
    Planner->>Planner: Decompose into DAG subtasks
    Planner->>Agents: Dispatch atomic subtasks

    par Skill Injection (per agent)
        Agents->>Skills: Request skills for role + task
        Skills-->>Skills: Load core + keyword-activated SKILL.md
        Skills-->>Agents: Inject skill context into prompt
    end

    par Design Injection (frontend tasks)
        Agents->>Design: Detect screen from task keywords
        Design-->>Design: Load DESIGN.md + code.html
        Design-->>Agents: Inject design reference into prompt
    end

    Agents->>QA: Submit generated code

    par Visual Validation
        QA->>Design: Load design spec for screen
        Design-->>QA: Static checklist + DESIGN.md
        QA->>QA: 8-point design compliance check
    end

    loop Improve Loop
        QA->>Agents: Return errors (compiler, structural, design)
        Agents->>QA: Resubmit fixes
    end
    QA->>Git: Approve code
    Git-->>User: Auto-commit feature branch + skills report
```

## Design System Integration

The `agents/design/` directory contains **22 reference screen designs**, each with:
- `DESIGN.md` — The "Cognitive Architect" design system specification (colors, typography, spacing, components)
- `code.html` — A pixel-accurate Tailwind/HTML reference implementation
- `screen.png` — Visual reference screenshot

```mermaid
flowchart TB
    subgraph "agents/design/ (22 Screens)"
        S1["student dashboard/"]
        S2["teacher dashboard/"]
        S3["landing page/"]
        S4["cockpit/"]
        SN["... 18 more screens"]
    end

    subgraph "Each Screen Contains"
        DM["DESIGN.md<br/>Color tokens, typography,<br/>No-Line Rule, neumorphism"]
        CH["code.html<br/>Reference Tailwind<br/>implementation"]
        SP["screen.png<br/>Visual reference"]
    end

    S1 & S2 & S3 & S4 --> DM & CH & SP

    subgraph "DesignLoader (src/design/design-loader.ts)"
        KW["Keyword Map<br/>40+ task → screen mappings"]
        LOAD["loadDesignForTask()"]
        FMT["formatAsContext()"]
        CHK["runDesignChecklist()<br/>8 static rules"]
        KW --> LOAD
        LOAD --> FMT
        LOAD --> CHK
    end

    DM & CH --> LOAD

    FMT -->|Context Block| FE[Frontend Agent]
    CHK -->|Pass/Fail| VV[Visual Validator]

    style DM fill:#C0392B,stroke:#E74C3C,color:#fff
    style CH fill:#C0392B,stroke:#E74C3C,color:#fff
    style CHK fill:#8E44AD,stroke:#9B59B6,color:#fff
    style FE fill:#1E8449,stroke:#27AE60,color:#fff
    style VV fill:#1A5276,stroke:#2E86C1,color:#fff
```

## Skill-Enhanced Agent Architecture

The dynamic skill injection system connects the 1,268-skill library (organized across 66 categories) to each agent's context window:

```mermaid
flowchart TB
    subgraph "skills/ Directory (1268 SKILL.md files)"
        S1[react-best-practices]
        S2[typescript-expert]
        S3[firebase]
        S4[testing-patterns]
        S5[github-actions-templates]
        S6[architecture-patterns]
        SN[... 1262 more]
    end

    subgraph "agents/knowledge/skills/"
        DS[design-system-sankalp<br/>Cognitive Architect spec]
    end

    subgraph "skill_categorization/"
        IDX[(skills_index.json<br/>66 Categories)]
    end

    subgraph "agents/src/skills/"
        REG[skill-registry.ts<br/>Agent to Skill Mapping]
        LDR[skill-loader.ts<br/>Dual-Path Read + Cache + Budget]
    end

    IDX -.->|Category Reference| REG
    REG -->|Core Skills| LDR
    REG -->|Supplementary Pool| LDR
    LDR -->|Read SKILL.md| S1 & S2 & S3 & S4 & S5 & S6
    LDR -->|Fallback Path| DS

    subgraph "BaseAgent.buildPrompt()"
        CTX[Merged Context Window]
        LDR -->|Formatted Skills Block| CTX
        WIKI[Wiki Context] --> CTX
        CODE[Codebase Context] --> CTX
        TYPES[Type Definitions] --> CTX
        DCTX[Design References] --> CTX
    end

    CTX -->|System + User Prompt| LLM[Gemini LLM Call]

    style IDX fill:#6C3483,stroke:#A569BD,color:#fff
    style REG fill:#1A5276,stroke:#2E86C1,color:#fff
    style LDR fill:#1A5276,stroke:#2E86C1,color:#fff
    style CTX fill:#D35400,stroke:#E67E22,color:#fff
    style LLM fill:#1E8449,stroke:#27AE60,color:#fff
    style DS fill:#C0392B,stroke:#E74C3C,color:#fff
    style DCTX fill:#C0392B,stroke:#E74C3C,color:#fff
```
