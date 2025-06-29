import { Test, TestingModule } from '@nestjs/testing';
import { WebPageController } from './webpage.controller';
import { WebPageService } from './webpage.service';
import { WebPage } from './entity/webpage.entity';
import { WebPageUrlQueryDto } from './dto/url.dto';
import { CrawledWebPageDto } from '../common/dto/crawled-webpage.dto';

const mockWebPage: WebPage = {
  id: 1,
  url: 'https://google.com',
  title: 'Google',
  description: 'Search engine',
  category: 'webpage',
  text: 'Google homepage',
  name: 'Google',
  wholePage: 'Full content of the Google homepage',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('WebPageController', () => {
  let controller: WebPageController;
  let service: WebPageService;

  const serviceMock = {
    saveOrUpdateWebPage: jest.fn().mockResolvedValue(mockWebPage),
    checkWebPageExists: jest.fn().mockResolvedValue(true),
    getWebPage: jest.fn().mockResolvedValue(mockWebPage),
    updateWebPage: jest.fn().mockResolvedValue(mockWebPage),
    createWebPage: jest.fn().mockResolvedValue(mockWebPage),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebPageController],
      providers: [{ provide: WebPageService, useValue: serviceMock }],
    }).compile();

    controller = module.get<WebPageController>(WebPageController);
    service = module.get<WebPageService>(WebPageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should update a webpage and return message', async () => {
    const crawledWebPageDto: CrawledWebPageDto = { ...mockWebPage, url: mockWebPage.url };
    const result = await controller.updateWebPage(mockWebPage.url, crawledWebPageDto);
    expect(result.message).toBe('Page updated');
    expect(result.page).toEqual(mockWebPage);
    expect(service.updateWebPage).toHaveBeenCalledWith(mockWebPage.url, crawledWebPageDto);
  });

  it('should check if webpage exists', async () => {
    const request = { url: 'https://google.com' } as WebPageUrlQueryDto;
    const result = await controller.checkWebPageExists(request);
    expect(result).toEqual({ exists: true });
    expect(service.checkWebPageExists).toHaveBeenCalledWith(
      'https://google.com',
    );
  });

  it('should check if webpage doesnt exist', async () => {
    serviceMock.checkWebPageExists.mockResolvedValueOnce(false);
    const request = { url: 'https://google.com' } as WebPageUrlQueryDto;
    const result = await controller.checkWebPageExists(request);
    expect(result).toEqual({ exists: false });
    expect(service.checkWebPageExists).toHaveBeenCalledWith(
      'https://google.com',
    );
  });

  it('should get a webpage by url', async () => {
    const request = { url: 'https://google.com' } as WebPageUrlQueryDto;
    const result = await controller.getWebPage(request);
    expect(result).toEqual(mockWebPage);
    expect(service.getWebPage).toHaveBeenCalledWith('https://google.com');
  });

  it('should save a new webpage and return message', async () => {
    serviceMock.checkWebPageExists.mockResolvedValueOnce(false);
    const crawledWebPageDto: CrawledWebPageDto = { ...mockWebPage, url: mockWebPage.url };
    const result = await controller.saveWebPage(crawledWebPageDto);
    expect(result.message).toBe('Page saved');
    expect(result.page).toEqual(mockWebPage);
    expect(service.createWebPage).toHaveBeenCalledWith(crawledWebPageDto);
  });
});
