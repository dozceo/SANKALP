/**
 * SANKALP-AEI Agent System — Wiki Reader
 * Reads .gitnexus/wiki/ pages for architectural context injection.
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';

export interface WikiPage {
  name: string;
  path: string;
  content: string;
  category: string;
}

export class WikiReader {
  private wikiDir: string;
  private cache: Map<string, WikiPage> = new Map();

  constructor(projectRoot: string) {
    this.wikiDir = join(projectRoot, '.gitnexus', 'wiki');
  }

  /** List all available wiki pages */
  listPages(): string[] {
    if (!existsSync(this.wikiDir)) {
      logger.warn('[WikiReader] Wiki directory not found');
      return [];
    }

    return readdirSync(this.wikiDir)
      .filter(f => f.endsWith('.md') && f !== 'index.html')
      .map(f => f.replace('.md', ''));
  }

  /** Read a specific wiki page */
  readPage(pageName: string): WikiPage | null {
    if (this.cache.has(pageName)) return this.cache.get(pageName)!;

    const filename = pageName.endsWith('.md') ? pageName : `${pageName}.md`;
    const pagePath = join(this.wikiDir, filename);

    if (!existsSync(pagePath)) {
      logger.debug(`[WikiReader] Page not found: ${pageName}`);
      return null;
    }

    const content = readFileSync(pagePath, 'utf-8');
    const category = this.inferCategory(pageName);

    const page: WikiPage = {
      name: pageName.replace('.md', ''),
      path: pagePath,
      content,
      category,
    };

    this.cache.set(pageName, page);
    return page;
  }

  /** Read multiple wiki pages and combine them */
  readPages(pageNames: string[]): string {
    const parts: string[] = [];

    for (const name of pageNames) {
      const page = this.readPage(name);
      if (page) {
        parts.push(`## Wiki: ${page.name}\n\n${page.content}`);
      }
    }

    return parts.join('\n\n---\n\n');
  }

  /** Get all pages for a specific domain */
  getPagesByDomain(domain: 'frontend' | 'backend' | 'core' | 'ml' | 'infrastructure'): WikiPage[] {
    const prefixMap: Record<string, string[]> = {
      frontend: ['frontend-application'],
      backend: ['api-infrastructure', 'educational-services'],
      core: ['core-intelligence-engine'],
      ml: ['machine-learning-pipeline'],
      infrastructure: ['api-infrastructure'],
    };

    const prefixes = prefixMap[domain] ?? [];
    const pages = this.listPages();

    return pages
      .filter(p => prefixes.some(prefix => p.startsWith(prefix)))
      .map(p => this.readPage(p))
      .filter((p): p is WikiPage => p !== null);
  }

  /** Get the overview page */
  getOverview(): string | null {
    const page = this.readPage('overview');
    return page?.content ?? null;
  }

  /** Infer the category from the page name */
  private inferCategory(pageName: string): string {
    if (pageName.startsWith('frontend-')) return 'frontend';
    if (pageName.startsWith('api-')) return 'infrastructure';
    if (pageName.startsWith('core-')) return 'core';
    if (pageName.startsWith('machine-learning-')) return 'ml';
    if (pageName.startsWith('brain-map-')) return 'visualization';
    if (pageName.startsWith('educational-')) return 'services';
    if (pageName.startsWith('skill-')) return 'skills';
    return 'general';
  }
}
