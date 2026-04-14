/**
 * SANKALP-AEI Agent System — Skill Registry
 * Maps domain agent roles to categorized external skills from the /skills directory.
 * Each agent receives a curated set of skills injected into its context window
 * at execution time, grounding its LLM calls with domain-specific best practices.
 *
 * The mapping is derived from the skill_categorization/index.md categories
 * matched against each agent's operational domain.
 */

import { AgentRole } from '../llm/models.js';

export interface SkillMapping {
  /** Skill directory name under /skills/ */
  skillId: string;
  /** Why this skill is relevant to the agent */
  relevance: string;
  /** Priority: 'core' skills are always loaded; 'supplementary' loaded on demand */
  priority: 'core' | 'supplementary';
}

/**
 * AGENT → SKILL REGISTRY
 * Each domain agent has a curated skill manifest.
 * Core skills are loaded into every task prompt for that agent.
 * Supplementary skills are loaded when the task description matches keywords.
 */
export const AGENT_SKILL_REGISTRY: Record<AgentRole, SkillMapping[]> = {

  // ─── FRONTEND AGENT ──────────────────────────────────────────
  [AgentRole.FRONTEND]: [
    // Core skills — always injected
    { skillId: 'design-system-sankalp', relevance: 'SANKALP-AEI Cognitive Architect design system — colors, fonts, neumorphism, No-Line Rule', priority: 'core' },
    { skillId: 'react-best-practices', relevance: 'React performance and Next.js patterns', priority: 'core' },
    { skillId: 'nextjs-app-router-patterns', relevance: 'App Router, Server Components, streaming', priority: 'core' },
    { skillId: 'tailwind-patterns', relevance: 'Tailwind CSS v4 design tokens and patterns', priority: 'core' },
    { skillId: 'frontend-design', relevance: 'Premium aesthetics, glassmorphism, dark mode', priority: 'core' },
    { skillId: 'threejs-fundamentals', relevance: 'Brain Map 3D scene setup', priority: 'core' },
    // Supplementary skills — loaded by keyword match
    { skillId: 'react-state-management', relevance: 'Zustand, Jotai, React Query patterns', priority: 'supplementary' },
    { skillId: 'threejs-materials', relevance: 'PBR materials for Brain Map nodes', priority: 'supplementary' },
    { skillId: 'threejs-postprocessing', relevance: 'Bloom, SSAO for Brain Map visuals', priority: 'supplementary' },
    { skillId: 'animejs-animation', relevance: 'Complex micro-interactions', priority: 'supplementary' },
    { skillId: 'scroll-experience', relevance: 'Scroll-driven parallax storytelling', priority: 'supplementary' },
    { skillId: 'accessibility-compliance-accessibility-audit', relevance: 'WCAG compliance', priority: 'supplementary' },
    { skillId: 'i18n-localization', relevance: 'Multi-language support', priority: 'supplementary' },
    { skillId: 'web-performance-optimization', relevance: 'Core Web Vitals optimization', priority: 'supplementary' },
    { skillId: 'zustand-store-ts', relevance: 'TypeScript Zustand store patterns', priority: 'supplementary' },
    { skillId: 'shadcn', relevance: 'shadcn/ui component patterns', priority: 'supplementary' },
  ],

  // ─── BACKEND AGENT ───────────────────────────────────────────
  [AgentRole.BACKEND]: [
    // Core skills
    { skillId: 'typescript-expert', relevance: 'Advanced TypeScript patterns for strict mode', priority: 'core' },
    { skillId: 'nodejs-backend-patterns', relevance: 'Express middleware, error handling, routing', priority: 'core' },
    { skillId: 'api-design-principles', relevance: 'REST/GraphQL API architecture', priority: 'core' },
    { skillId: 'firebase', relevance: 'Firestore, Cloud Functions, Auth', priority: 'core' },
    { skillId: 'zod-validation-expert', relevance: 'Zod schema validation at API boundaries', priority: 'core' },
    // Supplementary
    { skillId: 'auth-implementation-patterns', relevance: 'JWT, RBAC, session management', priority: 'supplementary' },
    { skillId: 'error-handling-patterns', relevance: 'Error propagation, Result types', priority: 'supplementary' },
    { skillId: 'api-security-best-practices', relevance: 'Rate limiting, input validation', priority: 'supplementary' },
    { skillId: 'database-design', relevance: 'Firestore data modeling', priority: 'supplementary' },
    { skillId: 'gemini-api-dev', relevance: 'Gemini API integration for Genkit', priority: 'supplementary' },
    { skillId: 'bayesian-mastery-engine', relevance: 'Beta distribution mastery tracking', priority: 'supplementary' },
    { skillId: 'backend-dev-guidelines', relevance: 'Layered architecture standards', priority: 'supplementary' },
    { skillId: 'cqrs-implementation', relevance: 'Command/Query separation patterns', priority: 'supplementary' },
  ],

  // ─── INTEGRATION AGENT ───────────────────────────────────────
  [AgentRole.INTEGRATION]: [
    // Core skills
    { skillId: 'architecture-patterns', relevance: 'System integration patterns', priority: 'core' },
    { skillId: 'api-patterns', relevance: 'REST vs GraphQL vs tRPC selection', priority: 'core' },
    { skillId: 'typescript-expert', relevance: 'Cross-boundary type safety', priority: 'core' },
    { skillId: 'domain-driven-design', relevance: 'Bounded contexts for modular integration', priority: 'core' },
    // Supplementary
    { skillId: 'event-sourcing-architect', relevance: 'Event-driven pipeline wiring', priority: 'supplementary' },
    { skillId: 'microservices-patterns', relevance: 'Service communication patterns', priority: 'supplementary' },
    { skillId: 'workflow-orchestration-patterns', relevance: 'Durable workflow coordination', priority: 'supplementary' },
    { skillId: 'data-structure-protocol', relevance: 'Data flow protocol design', priority: 'supplementary' },
    { skillId: 'saga-orchestration', relevance: 'Distributed transaction coordination', priority: 'supplementary' },
  ],

  // ─── TESTING AGENT ───────────────────────────────────────────
  [AgentRole.TESTING]: [
    // Core skills
    { skillId: 'testing-patterns', relevance: 'Jest/Vitest patterns, mocking, TDD', priority: 'core' },
    { skillId: 'javascript-testing-patterns', relevance: 'Testing Library, integration tests', priority: 'core' },
    { skillId: 'e2e-testing-patterns', relevance: 'End-to-end test architecture', priority: 'core' },
    // Supplementary
    { skillId: 'python-testing-patterns', relevance: 'Pytest for ML pipeline tests', priority: 'supplementary' },
    { skillId: 'tdd-workflows-tdd-cycle', relevance: 'Test-first development cycle', priority: 'supplementary' },
    { skillId: 'playwright-skill', relevance: 'Browser automation for frontend tests', priority: 'supplementary' },
    { skillId: 'k6-load-testing', relevance: 'Load testing for API endpoints', priority: 'supplementary' },
    { skillId: 'test-driven-development', relevance: 'TDD methodology and patterns', priority: 'supplementary' },
  ],

  // ─── DEVOPS AGENT ────────────────────────────────────────────
  [AgentRole.DEVOPS]: [
    // Core skills
    { skillId: 'firebase', relevance: 'Firebase hosting, functions, Firestore rules', priority: 'core' },
    { skillId: 'github-actions-templates', relevance: 'CI/CD pipeline configuration', priority: 'core' },
    { skillId: 'deployment-procedures', relevance: 'Safe deployment and rollback strategies', priority: 'core' },
    // Supplementary
    { skillId: 'gcp-cloud-run', relevance: 'GCP Cloud Run for scaling', priority: 'supplementary' },
    { skillId: 'secrets-management', relevance: 'Secret management for CI/CD', priority: 'supplementary' },
    { skillId: 'observability-monitoring-monitor-setup', relevance: 'Monitoring dashboards', priority: 'supplementary' },
    { skillId: 'prometheus-configuration', relevance: 'Metric collection', priority: 'supplementary' },
    { skillId: 'cost-optimization', relevance: 'Cloud cost optimization', priority: 'supplementary' },
  ],

  // ─── ORCHESTRATOR / PLANNER / REVIEWER / DEBUGGER / VISUAL_VALIDATOR ─
  // These meta-agents focus on coordination, not domain code.
  [AgentRole.ORCHESTRATOR]: [
    { skillId: 'agent-orchestration-multi-agent-optimize', relevance: 'Multi-agent optimization patterns', priority: 'core' },
    { skillId: 'concise-planning', relevance: 'Actionable task decomposition', priority: 'core' },
    { skillId: 'parallel-agents', relevance: 'Parallel execution orchestration', priority: 'supplementary' },
  ],
  [AgentRole.PLANNER]: [
    { skillId: 'concise-planning', relevance: 'Task decomposition into atomic checklists', priority: 'core' },
    { skillId: 'plan-writing', relevance: 'Structured task breakdowns with dependencies', priority: 'core' },
    { skillId: 'architecture', relevance: 'System architecture for task routing', priority: 'supplementary' },
  ],
  [AgentRole.REVIEWER]: [
    { skillId: 'code-review-excellence', relevance: 'Effective code review practices', priority: 'core' },
    { skillId: 'clean-code', relevance: 'Clean code principles for review scoring', priority: 'core' },
    { skillId: 'security-audit', relevance: 'Security review patterns', priority: 'supplementary' },
  ],
  [AgentRole.DEBUGGER]: [
    { skillId: 'systematic-debugging', relevance: 'Systematic root-cause analysis', priority: 'core' },
    { skillId: 'debugging-strategies', relevance: 'Profiling and bug tracking', priority: 'core' },
    { skillId: 'error-handling-patterns', relevance: 'Error pattern recognition', priority: 'supplementary' },
  ],
  [AgentRole.VISUAL_VALIDATOR]: [
    { skillId: 'design-system-sankalp', relevance: 'SANKALP-AEI design system rules for visual compliance checking', priority: 'core' },
    { skillId: 'code-review-checklist', relevance: 'Structural validation checklist', priority: 'core' },
    { skillId: 'vibe-code-auditor', relevance: 'AI-generated code audit', priority: 'supplementary' },
  ],
  [AgentRole.TOKEN_OPTIMIZER]: [
    { skillId: 'cost-optimization', relevance: 'API cost minimization strategies', priority: 'core' },
    { skillId: 'web-performance-optimization', relevance: 'Context window budget management', priority: 'supplementary' },
  ],
};

/**
 * Keyword-to-supplementary-skill activation map.
 * When a task description contains these keywords, the corresponding
 * supplementary skills are force-loaded regardless of priority.
 */
export const SKILL_ACTIVATION_KEYWORDS: Record<string, string[]> = {
  'brain map':          ['threejs-fundamentals', 'threejs-materials', 'threejs-postprocessing'],
  '3d':                 ['threejs-fundamentals', 'threejs-materials'],
  'animation':          ['animejs-animation', 'threejs-postprocessing'],
  'scroll':             ['scroll-experience'],
  'accessibility':      ['accessibility-compliance-accessibility-audit'],
  'i18n':               ['i18n-localization'],
  'performance':        ['web-performance-optimization', 'k6-load-testing'],
  'auth':               ['auth-implementation-patterns', 'clerk-auth'],
  'security':           ['api-security-best-practices', 'security-audit'],
  'graphql':            ['graphql-architect'],
  'database':           ['database-design', 'postgresql'],
  'ml':                 ['bayesian-mastery-engine', 'scikit-learn'],
  'python':             ['python-testing-patterns', 'python-patterns'],
  'deploy':             ['deployment-procedures', 'firebase'],
  'ci/cd':              ['github-actions-templates', 'cicd-automation-workflow-automate'],
  'test':               ['testing-patterns', 'e2e-testing-patterns'],
  'state':              ['react-state-management', 'zustand-store-ts'],
  'genkit':             ['gemini-api-dev', 'gemini-api-integration'],
  'webhook':            ['api-patterns', 'n8n-workflow-patterns'],
  // Design screen triggers — activate design-system-sankalp when specific screens mentioned
  'student dashboard':  ['design-system-sankalp'],
  'teacher dashboard':  ['design-system-sankalp'],
  'landing page':       ['design-system-sankalp'],
  'registration':       ['design-system-sankalp'],
  'student profile':    ['design-system-sankalp'],
  'student analytics':  ['design-system-sankalp'],
  'study session':      ['design-system-sankalp'],
  'metacognition':      ['design-system-sankalp'],
  'ai companion':       ['design-system-sankalp'],
  'lesson plan':        ['design-system-sankalp'],
  'cockpit':            ['design-system-sankalp'],
  'class overview':     ['design-system-sankalp'],
  'teacher report':     ['design-system-sankalp'],
  'system health':      ['design-system-sankalp'],
  'user management':    ['design-system-sankalp'],
  'help center':        ['design-system-sankalp'],
  'ui':                 ['design-system-sankalp'],
  'design':             ['design-system-sankalp'],
  'page':               ['design-system-sankalp'],
  'screen':             ['design-system-sankalp'],
  'component':          ['design-system-sankalp'],
  'dashboard':          ['design-system-sankalp'],
};
