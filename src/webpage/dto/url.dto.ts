import { IsUrl, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WebPageUrlQueryDto {
  @ApiProperty({
    description: 'URL of the webpage',
    example: 'https://example.com',
    required: true,
  })
  @IsUrl()
  @IsNotEmpty()
  url: string;
}
