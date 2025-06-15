import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CrawlerModule } from './crawler/crawler.module';
import { WebpageModule } from './webpage/webpage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CrawlerModule,
    WebpageModule,
  ],
})
export class AppModule {}
