import { IsString, IsEnum, IsDateString, IsInt, Min, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ActivityCategory, ActivityVisibility } from '../../../../prisma/generated/prisma';

export class CreateActivityDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ActivityCategory })
  @IsEnum(ActivityCategory)
  category: ActivityCategory;

  @ApiProperty()
  @IsDateString()
  dateTime: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxParticipants?: number;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @ApiProperty({ enum: ActivityVisibility, required: false })
  @IsOptional()
  @IsEnum(ActivityVisibility)
  visibility?: ActivityVisibility;
}