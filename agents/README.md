# 🧠 SANKALP-AEI Agent Orchestrator

A **multi-agent orchestration system** powered by **30 Gemini API keys** that autonomously develops the SANKALP-AEI platform.

## Architecture

```
YOU → "Build all missing API routes" → 🧠 Orchestrator
                                           │
                                    📋 Planner (decomposes)
                                           │
                                    🔀 Dispatcher (assigns)
                                       │ │ │ │ │
                                       │ │ │ │ └──🚀 DevOps
                                       │ │ │ └────🧪 Testing  
                                       │ │ └──────🔗 Integration
                                       │ └────────⚙️ Backend
                                       └──────────🎨 Frontend
                                                   │
                                           📝 Review → 🐛 Debug → 👁️ Validate → 🔧 Improve
                                                                                      │
                                                                              ✅ Auto-Commit
```

## Model Distribution

| Tier | Model | Keys | Used For |
|------|-------|------|----------|
| Heavy | `gemini-3.1-pro-preview` | 20 | Architecture, code gen, review |
| Mid | `nano-banana-pro-preview` | 5 | Tests, scaffolding, refactoring |
| Fast | `gemini-2.5-flash` | 5 | Scanning, validation, linting |

## Setup

```bash
cd agents
npm install

# Copy and fill in your 30 API keys
cp .env.agents.example .env.agents
# Edit .env.agents with your keys
```

## Usage

```bash
# Run a task (full autonomous pipeline)
npx tsx src/index.ts run "Build all 6 missing API route files"

# Dry run (plan only, no file writes)
npx tsx src/index.ts run --dry-run "Integrate Brain Map with pipeline"

# Check project status
npx tsx src/index.ts status

# Show API key pool statistics
npx tsx src/index.ts pool

# List available wiki pages
npx tsx src/index.ts wiki
```

## Pipeline

For every task, the system runs this pipeline:

1. **Plan** — Orchestrator reads wiki/types/status, LLM decomposes into subtask DAG
2. **Execute** — Dispatcher assigns subtasks to domain agents, respecting dependencies
3. **Review** — LLM code review scores output against SANKALP rules (Bayesian, RBAC, types)
4. **Debug** — TypeScript compilation check, error detection
5. **Validate** — Structural analysis: imports, exports, integration correctness
6. **Improve** — Auto-fix issues found in review/debug/validate stages
7. **Commit** — Create feature branch, stage files, commit with descriptive message

## Pre-built Task Templates

Ready-to-use task decompositions in `knowledge/task-templates/`:

- `build-api-routes.json` — Create all 6 missing REST API endpoints
- `integrate-brain-map.json` — Wire Brain Map into the canonical pipeline
- `build-frontend-pages.json` — Build Student/Teacher/Parent portal pages
- `add-test-coverage.json` — Generate 200+ comprehensive tests

## Safety

- Every file write creates a backup in `output/diffs/`
- All work happens on feature branches (`agent/` prefix)
- The reviewer must approve before commit
- Dry run mode available for plan-only execution
- Execution reports saved in `output/reports/`
