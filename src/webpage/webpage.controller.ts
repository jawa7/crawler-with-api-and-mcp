import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { WebPage } from './entity/webpage.entity';
import { Logger } from '@nestjs/common';
import { WebPageService } from './webpage.service';
import { WebPageUrlQueryDto } from './dto/url.dto';
import { ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CrawledWebPageDto } from './dto/crawled-webpage.dto';

export enum WebPageMessages {
  PAGE_UPDATED = 'Page updated',
  PAGE_SAVED = 'Page saved',
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
    @Body() crawled: CrawledWebPageDto,
  ): Promise<{ message: string; page: WebPage }> {
    const existed = await this.webpageService.checkWebPageExists(crawled.uri);
    const page = await this.webpageService.saveOrUpdateWebPage({
      ...crawled,
      description: crawled.description,
      text: crawled.text,
      wholePage: crawled.wholePage ?? '',
    });
    return {
      message: existed
        ? WebPageMessages.PAGE_UPDATED
        : WebPageMessages.PAGE_SAVED,
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
    }
    return page;
  }
}
