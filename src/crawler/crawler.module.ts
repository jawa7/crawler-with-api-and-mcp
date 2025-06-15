import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerController } from './crawler.controller';
import { TaskQueueService } from './crawler.task-queue.service';

@Module({
  controllers: [CrawlerController],
  providers: [CrawlerService, TaskQueueService],
  exports: [CrawlerService],
})
export class CrawlerModule {}