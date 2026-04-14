/**
 * SANKALP-AEI Agent System — Design Loader
 *
 * Reads the reference design assets from `agents/design/{screen}/` and surfaces them
 * to agents at execution time.  Each design folder contains:
 *   - DESIGN.md   — The "Cognitive Architect" design system spec for the screen
 *   - code.html   — A Tailwind/HTML reference implementation (Stitch-generated)
 *   - screen.png  — Visual reference screenshot
 *
 * Usage flow:
 *   1. FrontendAgent detects which screen(s) a task targets (keyword match)
 *   2. DesignLoader reads the corresponding DESIGN.md + code.html
 *   3. That content is injected into the LLM's context window along with the task
 *   4. ReviewPipeline (visual_validator) uses DesignChecklist to audit generated files
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { logger } from '../utils/logger.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DesignAssets {
  /** Directory name under agents/design/ (e.g. "student dashboard") */
  screenId: string;
  /** Human-friendly screen name */
  screenName: string;
  /** Absolute path to the screen.png reference screenshot */
  screenshotPath: string | null;
  /** Contents of DESIGN.md */
  designSpec: string | null;
  /** Contents of code.html (reference HTML implementation) */
  referenceHtml: string | null;
}

export interface DesignChecklistItem {
  rule: string;
  pass: boolean;
  detail: string;
}

// ─── Screen name → directory alias map ───────────────────────────────────────

/**
 * Maps common task keywords / route names to design folder directory names.
 * Keys are lower-cased; values match the exact subdirectory name in agents/design/.
 */
export const SCREEN_KEYWORD_MAP: Record<string, string> = {
  // Route / page names
  'landing':            'landing page',
  'landing page':       'landing page',
  'home page':          'landing page',
  'login':              'registration',
  'sign up':            'registration',
  'register':           'registration',
  'registration':       'registration',
  'forgot password':    'forgot password',
  'forgot-password':    'forgot password',
  'reset password':     'forgot password',
  // Student views
  'student dashboard':  'student dashboard',
  'student home':       'student dashboard',
  'dashboard':          'student dashboard',
  'student profile':    'student profile',
  'student analytics':  'student analytics',
  'student drill':      'student drill down',
  'drill down':         'student drill down',
  'study session':      'study session',
  'metacognition':      'metacognition',
  'ai companion':       'aicompanion',
  'ai tutor':           'aicompanion',
  'companion':          'aicompanion',
  // Teacher views
  'teacher dashboard':  'teacher dashboard',
  'teacher home':       'teacher dashboard',
  'teacher profile':    'teacher profile',
  'teacher report':     'teacher report',
  'lesson planning':    'lesson planning',
  'lesson plan':        'lesson planning',
  'class overview':     'class overview',
  'class view':         'class overview',
  // Admin / system views
  'cockpit':            'cockpit',
  'admin':              'cockpit',
  'system health':      'systemhealth',
  'system monitor':     'systemhealth',
  'user management':    'user management',
  'user admin':         'user management',
  'config':             'config',
  'configuration':      'config',
  'settings':           'config',
  'help center':        'help center',
  'help':               'help center',
  'support':            'help center',
};

// ─── Main Class ───────────────────────────────────────────────────────────────

export class DesignLoader {
  private designRoot: string;

  /** In-memory cache to avoid redundant disk reads */
  private cache: Map<string, DesignAssets> = new Map();

  constructor(projectRoot: string) {
    this.designRoot = resolve(projectRoot, 'agents', 'design');
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /**
   * Detect which design screens are relevant to the given task description,
   * then load and return their assets.
   *
   * @param taskDescription - Natural language task text
   * @param maxScreens - Cap on screens loaded (avoids context overflow)
   */
  loadDesignForTask(taskDescription: string, maxScreens = 2): DesignAssets[] {
    const taskLower = taskDescription.toLowerCase();
    const hitDirs = new Set<string>();

    // Match keywords against the screen map
    for (const [keyword, dir] of Object.entries(SCREEN_KEYWORD_MAP)) {
      if (taskLower.includes(keyword)) {
        hitDirs.add(dir);
      }
    }

    // Fallback: if nothing matched, check if any design dir name appears in the task
    if (hitDirs.size === 0) {
      const allDirs = this.listScreenDirs();
      for (const dir of allDirs) {
        if (taskLower.includes(dir.toLowerCase())) {
          hitDirs.add(dir);
        }
      }
    }

    const results: DesignAssets[] = [];
    for (const dir of [...hitDirs].slice(0, maxScreens)) {
      const assets = this.loadScreen(dir);
      if (assets) results.push(assets);
    }

    if (results.length > 0) {
      logger.info(
        `[DesignLoader] Matched ${results.length} design screens: ${results.map(a => a.screenId).join(', ')}`,
        'frontend',
      );
    }

    return results;
  }

  /**
   * Load a specific screen by its directory name (exact match).
   * Returns null if the directory doesn't exist.
   */
  loadScreen(screenDir: string): DesignAssets | null {
    if (this.cache.has(screenDir)) return this.cache.get(screenDir)!;

    const screenPath = join(this.designRoot, screenDir);
    if (!existsSync(screenPath)) {
      logger.debug(`[DesignLoader] Screen not found: ${screenPath}`);
      return null;
    }

    const assets: DesignAssets = {
      screenId: screenDir,
      screenName: this.toScreenName(screenDir),
      screenshotPath: this.readScreenshot(screenPath),
      designSpec: this.readTextFile(join(screenPath, 'DESIGN.md')),
      referenceHtml: this.readTextFile(join(screenPath, 'code.html')),
    };

    this.cache.set(screenDir, assets);
    return assets;
  }

  /**
   * Format design assets as a prompt-ready context block for injection.
   * HTML is truncated to stay within token budget.
   *
   * @param assets - Array of loaded design assets
   * @param includeHtml - Whether to include the reference HTML (default: true)
   * @param maxHtmlChars - Maximum characters for reference HTML per screen
   */
  formatAsContext(
    assets: DesignAssets[],
    includeHtml = true,
    maxHtmlChars = 12_000,
  ): string {
    if (assets.length === 0) return '';

    const parts: string[] = [
      '# Reference Design Assets',
      '',
      'The following assets are EXACT reference designs produced by the design team.',
      'Your implementation MUST faithfully replicate the visual language, color tokens,',
      'component patterns, and layout structure shown in these references.',
      '',
    ];

    for (const a of assets) {
      parts.push(`## Screen: ${a.screenName}`);
      parts.push(`> Directory: agents/design/${a.screenId}/`);
      parts.push('');

      if (a.screenshotPath) {
        parts.push(`> 📸 Reference screenshot: ${a.screenshotPath}`);
        parts.push('');
      }

      if (a.designSpec) {
        parts.push('### Design Specification (DESIGN.md)');
        parts.push(a.designSpec);
        parts.push('');
      }

      if (includeHtml && a.referenceHtml) {
        const html = a.referenceHtml.length > maxHtmlChars
          ? a.referenceHtml.slice(0, maxHtmlChars) + '\n\n<!-- [... truncated] -->'
          : a.referenceHtml;

        parts.push('### Reference HTML Implementation (code.html)');
        parts.push('```html');
        parts.push(html);
        parts.push('```');
        parts.push('');
      }

      parts.push('---');
      parts.push('');
    }

    return parts.join('\n');
  }

  /**
   * Run a quick design compliance checklist on generated HTML/TSX code.
   * Returns a list of pass/fail items.
   */
  runDesignChecklist(generatedCode: string): DesignChecklistItem[] {
    const code = generatedCode;
    const checks: DesignChecklistItem[] = [];

    // Fonts
    checks.push({
      rule: 'Manrope font imported or referenced',
      pass: /Manrope/i.test(code),
      detail: 'Headlines must use Manrope (font-headline class or Google Fonts import)',
    });
    checks.push({
      rule: 'Inter font imported or referenced',
      pass: /Inter/i.test(code),
      detail: 'Body text must use Inter (font-body class or Google Fonts import)',
    });

    // Color token usage
    checks.push({
      rule: 'Primary color token (#702ae1) used',
      pass: /#702ae1|text-primary|bg-primary|from-primary/i.test(code),
      detail: 'Must use the primary token (#702ae1), not generic purple/violet',
    });
    checks.push({
      rule: 'No raw generic color values (blue, red, green)',
      pass: !/bg-blue-\d00|bg-red-\d00|bg-green-\d00|text-blue-|text-red-\d|text-green-/i.test(code),
      detail: 'Avoid generic Tailwind color classes — use design tokens only',
    });

    // No-Line Rule
    checks.push({
      rule: 'No hard 1px solid borders',
      pass: !/border\s*:\s*1px solid(?!\s*(rgba|transparent|white|var\(--)|.*\/)/i.test(code) &&
             !/border-\w+-\d00/i.test(code) &&  // no generic border-{color}-{shade}
             !/(className|class)="[^"]*\bborder\b(?!-opacity|-radius|-l-8)[^"]*"/.test(code.replace(/border-(primary|outline)-?\/?[0-9]*/g, '')),
      detail: 'No hard borders allowed — use neumorphic shadows or background shifts',
    });

    // Neumorphism
    checks.push({
      rule: 'Neumorphic shadows or classes present',
      pass: /neumorphic-flat|neumorphic-inset|box-shadow.*rgba\(163|box-shadow.*rgba\(255/i.test(code),
      detail: 'UI must use neumorphic shadow system, not standard drop-shadows',
    });

    // Border radius
    checks.push({
      rule: 'Elements are rounded (no sharp corners)',
      pass: /rounded-|border-radius/i.test(code),
      detail: 'All visible containers must have at least rounded-lg (2rem)',
    });

    // CTA gradient
    checks.push({
      rule: 'Primary CTA uses gradient (primary → primary-container)',
      pass: /from-primary|gradient.*primary|bg-primary/i.test(code),
      detail: 'Main action buttons must use gradient from #702ae1 to #b28cff',
    });

    return checks;
  }

  /**
   * Return a summary of checklist results as a prompt-ready string.
   */
  formatChecklistResults(items: DesignChecklistItem[]): string {
    const passed = items.filter(i => i.pass).length;
    const lines: string[] = [
      `## Design System Compliance: ${passed}/${items.length} checks passed`,
      '',
    ];
    for (const item of items) {
      const icon = item.pass ? '✅' : '❌';
      lines.push(`${icon} **${item.rule}**`);
      if (!item.pass) {
        lines.push(`   > Fix: ${item.detail}`);
      }
    }
    return lines.join('\n');
  }

  /**
   * List all available screen directory names under agents/design/.
   */
  listScreenDirs(): string[] {
    if (!existsSync(this.designRoot)) return [];
    try {
      return readdirSync(this.designRoot).filter(d => {
        const p = join(this.designRoot, d);
        return statSync(p).isDirectory();
      });
    } catch {
      return [];
    }
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  private readTextFile(filePath: string): string | null {
    if (!existsSync(filePath)) return null;
    try {
      return readFileSync(filePath, 'utf-8');
    } catch (error) {
      logger.warn(`[DesignLoader] Failed to read ${filePath}: ${(error as Error).message}`);
      return null;
    }
  }

  private readScreenshot(screenDir: string): string | null {
    const p = join(screenDir, 'screen.png');
    return existsSync(p) ? p : null;
  }

  private toScreenName(dir: string): string {
    return dir
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
}
