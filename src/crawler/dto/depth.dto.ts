import { IsUrl, IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepthDto {
  @ApiProperty({
    description: 'Base URL to crawl',
    example: 'https://example.com',
    required: true,
  })
  @IsUrl()
  @IsNotEmpty()
  baseUrl: string;
  @ApiProperty({
    description: 'Depth of the crawl',
    example: 2,
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  depth: number;
}
