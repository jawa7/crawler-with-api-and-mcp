import { Test, TestingModule } from '@nestjs/testing';
import { WebPageService } from './webpage.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WebPage } from './entity/webpage.entity';
import { Repository } from 'typeorm';
import { CrawledWebPage } from '../crawler/interface/crawled-webpage.interface';

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

const crawled: CrawledWebPage = { ...mockWebPage, uri: mockWebPage.url };

describe('WebPageService', () => {
  let service: WebPageService;
  let repo: jest.Mocked<Repository<WebPage>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebPageService,
        {
          provide: getRepositoryToken(WebPage),
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<WebPageService>(WebPageService);
    repo = module.get(getRepositoryToken(WebPage));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update an existing webpage', async () => {
    repo.findOneBy.mockResolvedValueOnce(mockWebPage);
    repo.save.mockResolvedValueOnce(mockWebPage);
    const result = await service.saveOrUpdateWebPage(crawled);
    expect(repo.findOneBy).toHaveBeenCalledWith({ url: crawled.uri });
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ url: crawled.uri }),
    );
    expect(result).toEqual(mockWebPage);
  });

  it('should create a new webpage', async () => {
    repo.findOneBy.mockResolvedValueOnce(null);
    repo.create.mockReturnValueOnce(mockWebPage);
    repo.save.mockResolvedValueOnce(mockWebPage);
    const result = await service.saveOrUpdateWebPage(crawled);
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ url: crawled.uri }),
    );
    expect(repo.save).toHaveBeenCalledWith(mockWebPage);
    expect(result).toEqual(mockWebPage);
  });

  it('should check if webpage exists', async () => {
    repo.findOneBy.mockResolvedValueOnce(mockWebPage);
    const exists = await service.checkWebPageExists('https://google.com');
    expect(exists).toBe(true);
    repo.findOneBy.mockResolvedValueOnce(null);
    const notExists = await service.checkWebPageExists('https://notfound.com');
    expect(notExists).toBe(false);
  });

  it('should get a webpage by url', async () => {
    repo.findOneBy.mockResolvedValueOnce(mockWebPage);
    const result = await service.getWebPage('https://google.com');
    expect(result).toEqual(mockWebPage);
    expect(repo.findOneBy).toHaveBeenCalledWith({ url: 'https://google.com' });
  });
});
