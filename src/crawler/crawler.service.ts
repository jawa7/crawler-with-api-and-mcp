import { Injectable, Logger } from '@nestjs/common';
import type { CheerioAPI } from 'cheerio';
import { normalizeUrl } from './crawler.util';
import * as cheerio from 'cheerio';
import { TaskQueueService } from './crawler.task-queue.service';
import * as fs from 'node:fs';
import type { CrawlerOptions } from './interface/crawler-options.interface';

@Injectable()
export class CrawlerService {
  /**
   * A simple asynchronous web crawler with concurrency and depth control.
   */
  private visitedUrls = new Set<string>();
  private maxDepth: number;
  private handler: (url: string, $: CheerioAPI) => Promise<void>;

  private readonly logger = new Logger(CrawlerService.name, {
    timestamp: true,
  });

  constructor(private readonly taskQueueService: TaskQueueService) {}

  async run(startUrls: string[], options: CrawlerOptions): Promise<void> {
    this.maxDepth = options.maxDepth ?? 1;
    this.logger.log(`Starting crawl with max depth: ${this.maxDepth}`);
    this.handler = options.handler;
    this.crawl(startUrls, 0);
    this.logger.log(
      `Crawling completed. Visited ${this.visitedUrls.size} URLs.`,
    );
  }

  async onIdle(): Promise<void> {
    await this.taskQueueService.onIdle();
  }

  /**
   * Recursively crawls URLs up to the max depth.
   * @param startUrls - URLs to crawl at the current depth.
   * @param currentDepth - The current recursion depth.
   */
  private crawl(startUrls: string[], currentDepth: number): void {
    if (this.maxDepth && currentDepth >= this.maxDepth) return;
    this.logger.log(
      `Crawling depth ${currentDepth} with ${startUrls.length} URLs`,
    );
    startUrls.map((url) => {
      this.logger.log(`Crawling URL: ${url}`);
      this.taskQueueService.enqueue(async () => {
        const baseUrl = normalizeUrl(url, null);
        this.logger.log(`Normalized URL: ${baseUrl}`);
        if (!baseUrl || this.visitedUrls.has(baseUrl)) {
          this.logger.log(
            `Skipping already visited or invalid URL: ${baseUrl}`,
          );
          return;
        }
        this.visitedUrls.add(baseUrl);
        const $ = await this.loadHtml(baseUrl);
        if (!$) {
          this.logger.error(`Failed to load HTML from ${baseUrl}`);
          return;
        }
        await this.handler(baseUrl, $);
        if (this.maxDepth && currentDepth + 1 >= this.maxDepth) return;
        const rawUrls = $.extract({
          urls: [{ selector: 'a', value: 'href' }],
        }).urls;
        this.logger.log(`Found ${rawUrls.length} URLs on ${baseUrl}`);
        const normalizedUrls = rawUrls
          .map((url) => normalizeUrl(url, baseUrl))
          .filter((url): url is string => url !== null && url !== baseUrl);
        this.logger.log(
          `Normalized ${normalizedUrls.length} URLs from ${rawUrls.length} raw URLs`,
        );
        const uniqueUrls: string[] = [...new Set(normalizedUrls)];
        this.logger.log(
          `Found ${uniqueUrls.length} unique URLs at depth ${currentDepth + 1}`,
        );
        this.crawl(uniqueUrls, currentDepth + 1);
      });
    });
  }
  /**
   * Loads HTML content from a URL and returns a Cheerio instance.
   * Logs errors to a file if loading fails.
   * @param url - The URL to load HTML from.
   * @returns A CheerioAPI instance or null if loading failed.
   */
  async loadHtml(url: string): Promise<CheerioAPI | null> {
    try {
      return await cheerio.fromURL(url);
    } catch (error) {
      fs.appendFileSync(
        'errors.log',
        `[${new Date().toISOString()}] Error loading ${url}: ${error}\n`,
      );
      return null;
    }
  }
}
