import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CrawledWebPageDto {
  @ApiProperty({ example: 'https://example.com' })
  @IsString()
  uri: string;

  @ApiProperty({ example: 'Example Title' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Description', required: true })
  @IsString()
  description: string;

  @ApiProperty({ example: 'webpage' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'Some text', required: true })
  @IsString()
  text: string;

  @ApiProperty({ example: '<html>...</html>', required: false })
  @IsString()
  @IsOptional()
  wholePage?: string;
}
