import { Test, TestingModule } from '@nestjs/testing';
import { CrawlerController } from './crawler.controller';
import { CrawlerService } from './crawler.service';
import { TaskQueueService } from './crawler.task-queue.service';
import { UrlDto } from './dto/url.dto';
import { DepthDto } from './dto/depth.dto';
import { CrawledWebPageDto } from 'src/common/dto/crawled-webpage.dto';


const mockCrawled: CrawledWebPageDto = {
  url: 'https://example.com',
  title: 'Example',
  description: 'desc',
  category: 'webpage',
  text: 'text',
  wholePage: '<html></html>',
};

describe('CrawlerController', () => {
  let crawlerController: CrawlerController;
  let crawlerService: CrawlerService;

  const mockCrawlerService = {
    run: jest.fn(async (_urls, options) => {
      await options.handler(mockCrawled.url, () => ({
        text: () => 'stub',
        attr: () => 'stub',
        first: () => ({ text: () => 'stub' }),
        map: () => ({ get: () => ['stub'] }),
        get: () => ['stub'],
        html: () => '<html></html>',
      }));
    }),
    onIdle: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CrawlerController],
      providers: [
        { provide: CrawlerService, useValue: mockCrawlerService },
        TaskQueueService,
      ],
    }).compile();
    crawlerService = module.get(CrawlerService);
    crawlerController = module.get<CrawlerController>(CrawlerController);
  });

  it('should be defined', () => {
    expect(crawlerController).toBeDefined();
  });

  it('crawlOneWebPage returns CrawledWebPage', async () => {
    const request = { url: 'https://example.com' } as UrlDto;
    const result = await crawlerController.crawlOneWebPage(request);
    expect(result.url).toBe(mockCrawled.url);
    expect(crawlerService.run).toHaveBeenCalledWith(
      ['https://example.com'],
      expect.objectContaining({ maxDepth: 1 }),
    );
    expect(crawlerService.onIdle).toHaveBeenCalled();
  });

  it('depthCrawlWebPageUrls returns string[]', async () => {
    mockCrawlerService.run.mockResolvedValueOnce(undefined);
    const request = { baseUrl: 'https://example.com', depth: 2 } as DepthDto;
    const result = await crawlerController.depthCrawlWebPageUrls(request);
    expect(Array.isArray(result)).toBe(true);
    expect(crawlerService.run).toHaveBeenCalledWith(
      ['https://example.com'],
      expect.objectContaining({ maxDepth: 2 }),
    );
    expect(crawlerService.onIdle).toHaveBeenCalled();
  });
});
