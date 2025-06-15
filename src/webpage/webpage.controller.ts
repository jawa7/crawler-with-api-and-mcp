import { Controller, Get, Post, Body, Query, Patch } from '@nestjs/common';
import { WebPage } from './entity/webpage.entity';
import { Logger } from '@nestjs/common';
import { WebPageService } from './webpage.service';
import { WebPageUrlQueryDto } from './dto/url.dto';
import { ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CrawledWebPageDto } from '../common/dto/crawled-webpage.dto';

export enum WebPageMessages {
  PAGE_UPDATED = 'Page updated',
  PAGE_SAVED = 'Page saved',
  PAGE_ALREADY_EXISTS = 'Page already exists',
  PAGE_NOT_FOUND = 'Page not found',
}

@Controller('api/v1/webpages')
export class WebPageController {
  private readonly logger = new Logger(WebPageController.name, {
    timestamp: true,
  });

  constructor(private readonly webpageService: WebPageService) {}

  @Post()
  @ApiBody({
    description: 'Crawled webpage data to save or update',
    type: CrawledWebPageDto,
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Webpage saved or updated.' })
  @ApiResponse({ status: 400, description: 'Invalid input or bad request.' })
  async saveWebPage(
    @Body() crawledWebPageDto: CrawledWebPageDto,
  ): Promise<{ message: string; page: WebPage | null }> {
    const url = crawledWebPageDto.url;
    if (!url) {
      this.logger.warn('No URL provided in crawledWebPageDto');
      return { message: WebPageMessages.PAGE_NOT_FOUND, page: null };
    }
    const existed = await this.webpageService.checkWebPageExists(url);
    if (existed) {
      this.logger.log(`WebPage already exists: ${url}`);
      const page = await this.webpageService.getWebPage(url);
      if (!page) {
        this.logger.warn(`WebPage not found for URL: ${url}`);
        return {
          message: WebPageMessages.PAGE_NOT_FOUND,
          page: null,
        };
      }
      return {
        message: WebPageMessages.PAGE_ALREADY_EXISTS,
        page,
      };
    } else {
      this.logger.log(`Saving new WebPage: ${url}`);
      const page = await this.webpageService.createWebPage(crawledWebPageDto);
      return {
        message: WebPageMessages.PAGE_SAVED,
        page,
      };
    }
  }

  @Patch(':url')
  @ApiBody({
    description: 'Crawled webpage data to update',
    type: CrawledWebPageDto,
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Webpage updated.' })
  @ApiResponse({ status: 400, description: 'Invalid input or bad request.' })
  async updateWebPage(
    @Query('url') url: string,
    @Body() crawledWebPageDto: CrawledWebPageDto,
  ): Promise<{ message: string; page: WebPage | null }> {
    const page = await this.webpageService.updateWebPage(url, crawledWebPageDto);
    if (!page) {
      this.logger.warn(`WebPage not found for update: ${crawledWebPageDto.url}`);
      return {
        message: WebPageMessages.PAGE_NOT_FOUND,
        page: null,
      };
    }
    this.logger.log(`WebPage updated: ${crawledWebPageDto.url}`);
    return {
      message: WebPageMessages.PAGE_UPDATED,
      page,
    };
  }

  @Get('exists')
  @ApiQuery({
    name: 'url',
    type: String,
    required: true,
    description: 'URL of the webpage to check',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns whether the webpage exists.',
  })
  @ApiResponse({ status: 400, description: 'Invalid URL or bad request.' })
  async checkWebPageExists(
    @Query() query: WebPageUrlQueryDto,
  ): Promise<{ exists: boolean }> {
    const isWebPageExists = await this.webpageService.checkWebPageExists(
      query.url,
    );
    return { exists: isWebPageExists };
  }

  @Get()
  @ApiQuery({
    name: 'url',
    type: String,
    required: true,
    description: 'URL of the webpage to retrieve',
  })
  @ApiResponse({ status: 200, description: 'Returns the webpage entity.' })
  @ApiResponse({ status: 400, description: 'Invalid URL or bad request.' })
  async getWebPage(
    @Query() query: WebPageUrlQueryDto,
  ): Promise<WebPage | null> {
    const page = await this.webpageService.getWebPage(query.url);
    if (!page) {
      this.logger.warn(`WebPage not found: ${query.url}`);
      return null;
    }
    return page;
  }
}
