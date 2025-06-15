import { Test, TestingModule } from '@nestjs/testing';
import { WebPageService } from './webpage.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WebPage } from './entity/webpage.entity';
import { Repository } from 'typeorm';
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

const crawledWebPageDto: CrawledWebPageDto = { ...mockWebPage, url: mockWebPage.url };

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

  it('should create a new webpage', async () => {
    repo.findOneBy.mockResolvedValueOnce(null);
    repo.create.mockReturnValueOnce(mockWebPage);
    const result = await service.createWebPage(crawledWebPageDto);
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ url: crawledWebPageDto.url }),
    );
    expect(repo.create).toHaveBeenCalledWith(mockWebPage);
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

  it('should update a webpage', async () => {
    repo.findOneBy.mockResolvedValueOnce(mockWebPage);
    repo.save.mockResolvedValueOnce(mockWebPage);
    const result = await service.updateWebPage(mockWebPage.url, crawledWebPageDto);
    expect(repo.findOneBy).toHaveBeenCalledWith({ url: mockWebPage.url });
    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ url: mockWebPage.url }));
    expect(result).toEqual(mockWebPage);
  });

  it('should throw if webpage not found for update', async () => {
    repo.findOneBy.mockResolvedValueOnce(null);
    await expect(service.updateWebPage(mockWebPage.url, crawledWebPageDto)).rejects.toThrow('Web page https://google.com not found');
  });
});
