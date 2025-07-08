import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReportReason } from '../../../../prisma/generated/prisma';

export class CreateReportDto {
  @ApiProperty()
  @IsString()
  reportedId: string;

  @ApiProperty({ enum: ReportReason })
  @IsEnum(ReportReason)
  reason: ReportReason;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}