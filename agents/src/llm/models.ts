/**
 * SANKALP-AEI Agent System — Model Tier Definitions
 * Maps model tiers to Gemini model IDs and key prefixes.
 */

export enum ModelTier {
  /** Heavy reasoning — architecture, complex code, review */
  PRO = 'pro',
  /** Mid-weight — scaffolding, tests, refactoring */
  NANO_PRO = 'nano_pro',
  /** Fast/light — scanning, validation, linting */
  FLASH = 'flash',
}

export interface ModelConfig {
  tier: ModelTier;
  modelId: string;
  displayName: string;
  keyPrefix: string;
  keyCount: number;
  maxOutputTokens: number;
  temperature: number;
  /** Approximate cost per 1M input tokens (USD) for budgeting */
  costPer1MInput: number;
}

export const MODEL_CONFIGS: Record<ModelTier, ModelConfig> = {
  [ModelTier.PRO]: {
    tier: ModelTier.PRO,
    modelId: 'gemini-3.1-pro-preview',
    displayName: 'Gemini 3.1 Pro Preview',
    keyPrefix: 'GEMINI_PRO_KEY_',
    keyCount: 20,
    maxOutputTokens: 65536,
    temperature: 0.3,
    costPer1MInput: 2.50,
  },
  [ModelTier.NANO_PRO]: {
    tier: ModelTier.NANO_PRO,
    modelId: 'nano-banana-pro-preview',
    displayName: 'Nano Banana Pro Preview',
    keyPrefix: 'GEMINI_NANO_PRO_KEY_',
    keyCount: 5,
    maxOutputTokens: 32768,
    temperature: 0.2,
    costPer1MInput: 0.50,
  },
  [ModelTier.FLASH]: {
    tier: ModelTier.FLASH,
    modelId: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    keyPrefix: 'GEMINI_FLASH_KEY_',
    keyCount: 5,
    maxOutputTokens: 16384,
    temperature: 0.1,
    costPer1MInput: 0.10,
  },
};

/** Maps agent roles to their preferred model tier */
export enum AgentRole {
  ORCHESTRATOR = 'orchestrator',
  PLANNER = 'planner',
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  INTEGRATION = 'integration',
  TESTING = 'testing',
  DEVOPS = 'devops',
  REVIEWER = 'reviewer',
  DEBUGGER = 'debugger',
  VISUAL_VALIDATOR = 'visual_validator',
  TOKEN_OPTIMIZER = 'token_optimizer',
}

export const AGENT_MODEL_MAPPING: Record<AgentRole, ModelTier> = {
  [AgentRole.ORCHESTRATOR]: ModelTier.PRO,
  [AgentRole.PLANNER]: ModelTier.PRO,
  [AgentRole.FRONTEND]: ModelTier.PRO,
  [AgentRole.BACKEND]: ModelTier.PRO,
  [AgentRole.INTEGRATION]: ModelTier.PRO,
  [AgentRole.TESTING]: ModelTier.NANO_PRO,
  [AgentRole.DEVOPS]: ModelTier.FLASH,
  [AgentRole.REVIEWER]: ModelTier.PRO,
  [AgentRole.DEBUGGER]: ModelTier.PRO,
  [AgentRole.VISUAL_VALIDATOR]: ModelTier.NANO_PRO,
  [AgentRole.TOKEN_OPTIMIZER]: ModelTier.FLASH,
};

export interface AgentMessage {
  id: string;
  from: AgentRole;
  to: AgentRole;
  taskId: string;
  timestamp: number;
  type: 'ASSIGN' | 'RESULT' | 'REVIEW' | 'FEEDBACK' | 'ERROR' | 'DEBUG' | 'VALIDATE';
  payload: {
    instruction?: string;
    files?: FileChange[];
    context?: string[];
    feedback?: string;
    error?: string;
    debugInfo?: DebugInfo;
    validationResult?: ValidationResult;
  };
}

export interface FileChange {
  path: string;
  action: 'create' | 'modify' | 'delete';
  content?: string;
  originalContent?: string;
  diff?: string;
}

export interface DebugInfo {
  errorType: string;
  errorMessage: string;
  file: string;
  line?: number;
  suggestedFix?: string;
  fixApplied?: boolean;
}

export interface ValidationResult {
  passed: boolean;
  typecheckPassed: boolean;
  testsPassed: boolean;
  lintPassed: boolean;
  issues: string[];
  improvements: string[];
}

export interface TaskNode {
  id: string;
  name: string;
  description: string;
  assignedAgent: AgentRole;
  status: TaskStatus;
  dependencies: string[];
  files: FileChange[];
  attempts: number;
  maxAttempts: number;
  result?: string;
  error?: string;
  startedAt?: number;
  completedAt?: number;
}

export enum TaskStatus {
  PENDING = 'pending',
  WAITING = 'waiting',       // waiting for dependencies
  ASSIGNED = 'assigned',
  RUNNING = 'running',
  REVIEWING = 'reviewing',
  DEBUGGING = 'debugging',
  VALIDATING = 'validating',
  IMPROVING = 'improving',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface TaskGraph {
  id: string;
  name: string;
  description: string;
  nodes: Map<string, TaskNode>;
  createdAt: number;
  completedAt?: number;
}

export interface AgentConfig {
  maxRetries: number;
  retryDelayMs: number;
  maxContextTokens: number;
  autoCommit: boolean;
  branchPrefix: string;
  logLevel: string;
  projectRoot: string;
}
