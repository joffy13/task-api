import { ApiProperty } from '@nestjs/swagger';

export abstract class ErrorResultType {
  @ApiProperty()
  statusCode: number;
  @ApiProperty()
  message: string;
  @ApiProperty()
  timestamp: string;
  @ApiProperty()
  path: string;
}
