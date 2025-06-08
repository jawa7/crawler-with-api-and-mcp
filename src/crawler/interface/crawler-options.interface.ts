import type { CheerioAPI } from 'cheerio';

export interface CrawlerOptions {
  maxDepth?: number;
  parallelTasks?: number;
  handler: (url: string, $: CheerioAPI) => Promise<void>;
}
