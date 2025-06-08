import { Module } from '@nestjs/common';
import { CrawlerController } from './crawler/crawler.controller';
import { CrawlerService } from './crawler/crawler.service';
import { WebPageController } from './webpage/webpage.controller';
import { WebPageService } from './webpage/webpage.service';
import { TaskQueueService } from './crawler/crawler.task-queue.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebPage } from './webpage/entity/webpage.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '',
      database: 'crawler',
      entities: [WebPage],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([WebPage]),
  ],
  controllers: [CrawlerController, WebPageController],
  providers: [CrawlerService, TaskQueueService, WebPageService],
})
export class AppModule {}
