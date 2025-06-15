import { Module } from '@nestjs/common';
import { WebPageService } from './webpage.service';
import { WebPageController } from './webpage.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebPage } from './entity/webpage.entity';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
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
  controllers: [WebPageController],
  providers: [WebPageService],
  exports: [WebPageService],
})
export class WebpageModule {}