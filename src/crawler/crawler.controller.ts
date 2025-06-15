import { Controller, Get, Query } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerOptions } from './interface/crawler-options.interface';
import { Logger } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { UrlDto } from './dto/url.dto';
import { DepthDto } from './dto/depth.dto';
import type { CheerioAPI } from 'cheerio';
import { CrawledWebPageDto } from '../common/dto/crawled-webpage.dto';

@Controller('api/v1/crawl')
export class CrawlerController {
  private readonly logger = new Logger(CrawlerController.name, {
    timestamp: true,
  });

  constructor(private readonly crawlerService: CrawlerService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Crawled web page(s) returned.' })
  @ApiResponse({ status: 400, description: 'Invalid URL or bad request.' })
  async crawlOneWebPage(@Query() query: UrlDto): Promise<CrawledWebPageDto> {
    this.logger.log(`Crawling URL: ${query.url}`);
    let result = new CrawledWebPageDto();
    const options: CrawlerOptions = {
      maxDepth: 1,
      handler: async (pageUrl: string, $: CheerioAPI): Promise<void> => {
        result.url = pageUrl;
        result.title = $('title').text().trim();
        result.description =
          $("meta[name='description']").attr('content')?.trim() || '';
        result.category = 'webpage';
        result.text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 1000);
        result.wholePage = $('html').html() || '';
      },
    };
    await this.crawlerService.run([query.url], options);
    await this.crawlerService.onIdle();
    return result;
  }

  @Get('urls')
  @ApiResponse({ status: 200, description: 'Crawled URLs returned.' })
  @ApiResponse({ status: 400, description: 'Invalid base URL or depth.' })
  async depthCrawlWebPageUrls(@Query() query: DepthDto): Promise<string[]> {
    this.logger.log(`Crawling URL: ${query.baseUrl}`);
    const results: string[] = [];
    const options: CrawlerOptions = {
      maxDepth: query.depth,
      handler: async (pageUrl: string): Promise<void> => {
        results.push(pageUrl);
      },
    };
    await this.crawlerService.run([query.baseUrl], options);
    await this.crawlerService.onIdle();
    return results;
  }
}
