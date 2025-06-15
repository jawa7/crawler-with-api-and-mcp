import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WebPage } from './entity/webpage.entity';
import { Repository } from 'typeorm';
import { CrawledWebPageDto } from '../common/dto/crawled-webpage.dto';

@Injectable()
export class WebPageService {
  private readonly logger = new Logger(WebPageService.name, {
    timestamp: true,
  });

  constructor(
    @InjectRepository(WebPage)
    private readonly webpageRepository: Repository<WebPage>,
  ) {}

  async createWebPage(crawledWebPageDto: CrawledWebPageDto): Promise<WebPage> {
    this.logger.log(`Creating web page: ${crawledWebPageDto.url}`);
    try {
      const webPage = new WebPage({
        ...crawledWebPageDto
      })
      return this.webpageRepository.create(webPage);
    } catch (error) {
      this.logger.error('Error creating webpage', error);
      throw error;
    }
  }

  async updateWebPage(
    url: string,
    crawledWebPageDto: CrawledWebPageDto,
  ): Promise<WebPage> {
    this.logger.log(`Updating web page: ${url}`);
    try {
      const page = await this.webpageRepository.findOneBy({ url });
      if (!page) {
        throw new Error(`Web page ${url} not found`);
      }
      Object.assign(page, crawledWebPageDto);
      return this.webpageRepository.save(page);
    } catch (error) {
      this.logger.error('Error updating webpage', error);
      throw error;
    }
  }

  async checkWebPageExists(url: string): Promise<boolean> {
    this.logger.log(`Checking if web page exists: ${url}`);
    try {
      const page = await this.webpageRepository.findOneBy({ url });
      return !!page;
    } catch (error) {
      this.logger.error('Error checking if webpage exists', error);
      throw error;
    }
  }

  async getWebPage(url: string): Promise<WebPage | null> {
    this.logger.log(`Getting web page: ${url}`);
    try {
      const page = await this.webpageRepository.findOneBy({ url });
      if (!page) {
        return null;
      }
      return page;
    } catch (error) {
      this.logger.error('Error getting webpage', error);
      throw error;
    }
  }
}
