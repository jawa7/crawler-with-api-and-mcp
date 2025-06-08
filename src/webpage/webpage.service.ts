import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WebPage } from './entity/webpage.entity';
import { Repository } from 'typeorm';
import { CrawledWebPage } from '../crawler/interface/crawled-webpage.interface';

@Injectable()
export class WebPageService {
  private readonly logger = new Logger(WebPageService.name, {
    timestamp: true,
  });

  constructor(
    @InjectRepository(WebPage)
    private readonly webpageRepository: Repository<WebPage>,
  ) {}

  async saveOrUpdateWebPage(crawled: CrawledWebPage): Promise<WebPage> {
    this.logger.log(`Saving web page: ${crawled.uri}`);
    try {
      let page = await this.webpageRepository.findOneBy({ url: crawled.uri });
      if (page) {
        page.title = crawled.title;
        page.description = crawled.description;
        page.category = crawled.category;
        page.text = crawled.text;
        page.wholePage = crawled.wholePage || page.wholePage;
        this.logger.log(`Updating existing web page: ${crawled.uri}`);
        return this.webpageRepository.save(page);
      } else {
        page = this.webpageRepository.create({
          url: crawled.uri,
          title: crawled.title,
          description: crawled.description,
          category: crawled.category,
          text: crawled.text,
          wholePage: crawled.wholePage,
        });
        this.logger.log(`Creating new web page: ${crawled.uri}`);
        return this.webpageRepository.save(page);
      }
    } catch (error) {
      this.logger.error('Error saving or updating webpage', error);
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
      return this.webpageRepository.findOneBy({ url });
    } catch (error) {
      this.logger.error('Error getting webpage', error);
      throw error;
    }
  }
}
