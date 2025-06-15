import { Module } from '@nestjs/common';
import { CrawlerController } from './crawler/crawler.controller';
import { CrawlerService } from './crawler/crawler.service';
import { WebPageController } from './webpage/webpage.controller';
import { WebPageService } from './webpage/webpage.service';
import { TaskQueueService } from './crawler/crawler.task-queue.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebPage } from './webpage/entity/webpage.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_CRAWLER_HOST'),
        port: configService.getOrThrow<number>('DB_CRAWLER_PORT'),
        username: configService.getOrThrow<string>('DB_CRAWLER_USERNAME'),
        password: configService.getOrThrow<string>('DB_CRAWLER_PASSWORD'),
        database: configService.getOrThrow<string>('DB_CRAWLER_NAME'),
        entities: [WebPage],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([WebPage]),
  ],
  controllers: [CrawlerController, WebPageController],
  providers: [CrawlerService, TaskQueueService, WebPageService],
})
export class AppModule {}
