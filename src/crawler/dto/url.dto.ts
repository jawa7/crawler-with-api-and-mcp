import { IsUrl, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UrlDto {
  @ApiProperty({
    description: 'URL to crawl',
    example: 'https://example.com',
    required: true,
  })
  @IsUrl()
  @IsNotEmpty()
  url: string;
}
