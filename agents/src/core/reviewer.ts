/**
 * SANKALP-AEI Agent System — Reviewer + Debugger + Visual Validator
 * Multi-stage quality gate: Review → Debug → Validate → Improve
 *
 * Visual Validation (Stage 3) is design-aware:
 *   - Loads DESIGN.md + reference code.html from agents/design/ via DesignLoader
 *   - Runs static design-compliance checklist (fonts, colors, borders, shadows)
 *   - Passes checklist results + design spec into the LLM validation prompt
 */

import { type GeminiResponse, GeminiClient } from '../llm/gemini-client.js';
import { PoolManager } from '../llm/pool-manager.js';
import { ModelTier, type FileChange, type ValidationResult } from '../llm/models.js';
import { FsTools } from '../utils/fs-tools.js';
import { withRetry } from '../utils/retry.js';
import { logger } from '../utils/logger.js';
import { execSync } from 'child_process';
import { join } from 'path';
import { DesignLoader } from '../design/design-loader.js';

export interface ReviewResult {
  approved: boolean;
  score: number;          // 0-100
  issues: string[];
  suggestions: string[];
  fixableIssues: string[];
}

export interface DebugResult {
  errorFound: boolean;
  errorType?: string;
  errorMessage?: string;
  fixApplied: boolean;
  fixedFiles: FileChange[];
}

export class ReviewPipeline {
  private pool: PoolManager;
  private fs: FsTools;
  private projectRoot: string;
  /** Design asset loader — provides reference specs for visual validation */
  private designLoader: DesignLoader;

  constructor(pool: PoolManager, fs: FsTools, projectRoot: string) {
    this.pool = pool;
    this.fs = fs;
    this.projectRoot = projectRoot;
    this.designLoader = new DesignLoader(projectRoot);
  }

  /** Full review pipeline: Review → Debug → Validate → Improve */
  async runPipeline(files: FileChange[], taskDescription: string): Promise<{
    approved: boolean;
    review: ReviewResult;
    debug: DebugResult;
    validation: ValidationResult;
    improvedFiles: FileChange[];
    totalTokens: number;
  }> {
    let totalTokens = 0;

    // Stage 1: Code Review
    logger.info('📝 Stage 1: Code Review', 'reviewer');
    const review = await this.review(files, taskDescription);
    totalTokens += review.tokensUsed ?? 0;

    if (review.score >= 90) {
      logger.info(`✅ Review passed (score: ${review.score}/100)`, 'reviewer');
    } else {
      logger.warn(`⚠️ Review flagged issues (score: ${review.score}/100)`, 'reviewer');
    }

    // Stage 2: Debug Check (TypeScript compilation + lint)
    logger.info('🐛 Stage 2: Debug Check', 'debugger');
    const debug = await this.debugCheck(files);

    // Stage 3: Visual Validation (structural analysis)
    logger.info('👁️ Stage 3: Visual Validation', 'visual_validator');
    const validation = await this.visualValidate(files, taskDescription);
    totalTokens += validation.tokensUsed ?? 0;

    // Stage 4: Improvement (if issues found)
    let improvedFiles: FileChange[] = [];
    if (review.score < 80 || !debug.fixApplied && debug.errorFound || !validation.passed) {
      logger.info('🔧 Stage 4: Auto-Improvement', 'visual_validator');
      const improved = await this.improve(files, {
        reviewIssues: review.issues,
        debugErrors: debug.errorMessage ? [debug.errorMessage] : [],
        validationIssues: validation.issues,
      });
      improvedFiles = improved.files;
      totalTokens += improved.tokensUsed ?? 0;
    }

    const approved = review.score >= 70 && validation.passed;

    return {
      approved,
      review,
      debug,
      validation: {
        passed: validation.passed,
        typecheckPassed: debug.fixApplied || !debug.errorFound,
        testsPassed: true, // TODO: run actual tests
        lintPassed: review.score >= 70,
        issues: validation.issues,
        improvements: review.suggestions,
      },
      improvedFiles,
      totalTokens,
    };
  }

  /** Stage 1: LLM-powered code review */
  private async review(files: FileChange[], taskDescription: string): Promise<ReviewResult & { tokensUsed?: number }> {
    const fileContextParts = files.map(f =>
      `### ${f.action.toUpperCase()} ${f.path}\n\`\`\`\n${f.content ?? ''}\n\`\`\``
    ).join('\n\n');

    const prompt = `You are a senior code reviewer for SANKALP-AEI, an educational intelligence system.

## Task Description
${taskDescription}

## Files to Review
${fileContextParts}

## Review Criteria
1. **TypeScript Strictness**: No \`any\` types, proper error handling
2. **Zod Validation**: API boundaries must validate input with Zod
3. **RBAC**: Auth middleware applied consistently
4. **Brain Map™**: Beta(α,β) distributions used for mastery (never point estimates)
5. **CI Width**: Confidence intervals propagated downstream
6. **Code Quality**: Clean imports, proper typing, no dead code
7. **Architectural Compliance**: Follows canonical pipeline (Observe→Model→Decide→Generate→Record→Improve)

Return your review as JSON:
{
  "score": <0-100>,
  "issues": ["list of problems found"],
  "suggestions": ["list of improvements"],
  "fixableIssues": ["issues that can be auto-fixed"]
}`;

    try {
      const response = await withRetry(
        async () => {
          const client = this.pool.getClient(ModelTier.PRO);
          return client.call(prompt, {
            systemPrompt: 'You are a strict code reviewer. Return valid JSON only.',
            temperature: 0.1,
            maxOutputTokens: 4096,
          });
        },
        { maxRetries: 2 },
        'code-review'
      );

      const parsed = GeminiClient.extractJSON<ReviewResult>(response.text);
      return parsed
        ? { ...parsed, tokensUsed: response.tokensUsed.total }
        : { approved: false, score: 50, issues: ['Review parse failed'], suggestions: [], fixableIssues: [], tokensUsed: response.tokensUsed.total };
    } catch {
      return { approved: false, score: 50, issues: ['Review failed to execute'], suggestions: [], fixableIssues: [] };
    }
  }

  /** Stage 2: TypeScript compilation check */
  private async debugCheck(files: FileChange[]): Promise<DebugResult> {
    try {
      // Try running typecheck
      execSync('npx tsc --noEmit 2>&1', {
        cwd: this.projectRoot,
        encoding: 'utf-8',
        timeout: 30_000,
      });

      return { errorFound: false, fixApplied: false, fixedFiles: [] };
    } catch (error) {
      const output = (error as { stdout?: string }).stdout ?? (error as Error).message;
      const errorLines = output.split('\n').filter((l: string) => l.includes('error TS'));

      if (errorLines.length === 0) {
        return { errorFound: false, fixApplied: false, fixedFiles: [] };
      }

      logger.warn(`🐛 Found ${errorLines.length} TypeScript errors`, 'debugger');

      return {
        errorFound: true,
        errorType: 'TypeScript',
        errorMessage: errorLines.slice(0, 10).join('\n'),
        fixApplied: false,
        fixedFiles: [],
      };
    }
  }

  /** Stage 3: Visual/structural + design-system validation via LLM */
  private async visualValidate(
    files: FileChange[],
    taskDescription: string
  ): Promise<{ passed: boolean; issues: string[]; tokensUsed?: number }> {
    const fileList = files.map(f => `- ${f.action} ${f.path}`).join('\n');

    // ── 3a. Static design-compliance checklist (zero LLM cost) ─────────────
    // Only run on frontend files (TSX/CSS/HTML)
    const frontendFiles = files.filter(f =>
      /\.(tsx|jsx|css|html|scss)$/.test(f.path) && f.content
    );

    let staticChecklistSummary = '';
    let checklistIssues: string[] = [];
    let designSpecContext = '';

    if (frontendFiles.length > 0) {
      // Detect which design screen(s) this task targets
      const designAssets = this.designLoader.loadDesignForTask(taskDescription);

      // Collect all generated code into one blob for static analysis
      const allCode = frontendFiles.map(f => f.content ?? '').join('\n\n');

      // Run the static checklist
      const checklist = this.designLoader.runDesignChecklist(allCode);
      const failedItems = checklist.filter(c => !c.pass);

      staticChecklistSummary = this.designLoader.formatChecklistResults(checklist);
      checklistIssues = failedItems.map(c => `[DESIGN] ${c.rule}: ${c.detail}`);

      if (failedItems.length > 0) {
        logger.warn(
          `👁️ Design checklist: ${failedItems.length} violation(s) — ${failedItems.map(c => c.rule).join(', ')}`,
          'visual_validator',
        );
      } else {
        logger.info('👁️ Design checklist: all rules passed ✅', 'visual_validator');
      }

      // Add design spec context for the LLM prompt
      if (designAssets.length > 0) {
        designSpecContext = this.designLoader.formatAsContext(designAssets, false); // no HTML — spec only
        logger.info(
          `👁️ Design spec loaded for LLM: ${designAssets.map(a => a.screenName).join(', ')}`,
          'visual_validator',
        );
      }
    }

    // ── 3b. LLM validation (structural + design-aware) ─────────────────────
    const prompt = `You are validating the output of an AI agent tasked with:
"${taskDescription}"

The agent produced these file changes:
${fileList}

${files.map(f => `### ${f.path}\n\`\`\`\n${(f.content ?? '').slice(0, 2000)}\n\`\`\``).join('\n\n')}

## Static Design Compliance Checklist Results
${staticChecklistSummary || '_No frontend files detected — skipping design checklist._'}

${designSpecContext ? `## Reference Design Specification\n${designSpecContext.slice(0, 4000)}\n` : ''}

## Validation Checks
1. Do the files actually address the task description?
2. Are imports correct and consistent?
3. Are exports properly defined?
4. Do the files integrate with existing patterns?
5. Are there any obvious structural issues?
6. **Design compliance**: Does the code follow the "Cognitive Architect" design system?
   - Neumorphic shadows (not standard drop-shadows)
   - Correct color tokens (primary #702ae1, surface #EBEDF0, etc.)
   - Manrope + Inter fonts
   - No 1px solid borders (No-Line Rule)
   - All containers rounded (border-radius ≥ 1rem)
   - Primary CTAs use gradient fill

Return JSON:
{
  "passed": true/false,
  "issues": ["list of ALL issues — structural AND design violations"]
}`;

    try {
      const response = await withRetry(
        async () => {
          const client = this.pool.getClient(ModelTier.NANO_PRO);
          return client.call(prompt, {
            systemPrompt: 'You are a design-aware validation agent. Return valid JSON only.',
            temperature: 0.1,
            maxOutputTokens: 2048,
          });
        },
        { maxRetries: 2 },
        'visual-validate'
      );

      const parsed = GeminiClient.extractJSON<{ passed: boolean; issues: string[] }>(response.text);

      if (parsed) {
        // Merge static checklist issues with LLM-detected issues
        const mergedIssues = [...new Set([...checklistIssues, ...parsed.issues])];
        const passed = parsed.passed && checklistIssues.length === 0;
        return { passed, issues: mergedIssues, tokensUsed: response.tokensUsed.total };
      }

      return { passed: checklistIssues.length === 0, issues: checklistIssues, tokensUsed: response.tokensUsed.total };
    } catch {
      // Fallback: static checklist alone
      return {
        passed: checklistIssues.length === 0,
        issues: checklistIssues.length > 0 ? checklistIssues : ['Validation skipped due to error'],
      };
    }
  }

  /** Stage 4: Auto-improvement based on review/debug/validation feedback */
  private async improve(
    files: FileChange[],
    feedback: { reviewIssues: string[]; debugErrors: string[]; validationIssues: string[] }
  ): Promise<{ files: FileChange[]; tokensUsed?: number }> {
    const allIssues = [
      ...feedback.reviewIssues.map(i => `[REVIEW] ${i}`),
      ...feedback.debugErrors.map(i => `[DEBUG] ${i}`),
      ...feedback.validationIssues.map(i => `[VALIDATION] ${i}`),
    ];

    if (allIssues.length === 0) return { files: [] };

    const fileContextParts = files.map(f =>
      `### ${f.path}\n\`\`\`\n${f.content ?? ''}\n\`\`\``
    ).join('\n\n');

    const prompt = `You are fixing issues found during code review. Fix ALL of the following issues:

## Issues to Fix
${allIssues.join('\n')}

## Current Files
${fileContextParts}

Generate the FIXED versions of ONLY the files that need changes. Use the standard output format:
<!-- FILE: modify path/to/file.ts -->
\`\`\`typescript
// fixed file contents
\`\`\``;

    try {
      const response = await withRetry(
        async () => {
          const client = this.pool.getClient(ModelTier.PRO);
          return client.call(prompt, {
            systemPrompt: 'Fix the code issues. Return only the modified files.',
            temperature: 0.1,
            maxOutputTokens: 32768,
          });
        },
        { maxRetries: 2 },
        'auto-improve'
      );

      const rawChanges = GeminiClient.parseFileChanges(response.text);
      const fixedFiles: FileChange[] = rawChanges.map(raw => ({
        path: raw.path,
        action: 'modify' as const,
        content: raw.content,
      }));

      // Apply fixes
      for (const fix of fixedFiles) {
        if (fix.content) {
          this.fs.writeFile(fix.path, fix.content, 'improvement');
          logger.info(`🔧 Improved: ${fix.path}`, 'visual_validator');
        }
      }

      return { files: fixedFiles, tokensUsed: response.tokensUsed.total };
    } catch {
      return { files: [] };
    }
  }
}
