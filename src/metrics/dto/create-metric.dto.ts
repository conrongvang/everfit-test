import { ApiProperty } from "@nestjs/swagger";
import { METRIC_TYPES, MetricType } from "@src/common/constants/metric-units";
import { Expose, Transform } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
} from "class-validator";

export class CreateMetricDto {
  @ApiProperty({
    description: "User ID",
    example: 1,
  })
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  user_id: number;

  @ApiProperty({
    description: "Type of metric",
    enum: METRIC_TYPES,
    example: METRIC_TYPES.DISTANCE,
  })
  @IsEnum(METRIC_TYPES)
  @IsNotEmpty()
  metric_type: MetricType;

  @ApiProperty({
    description: "Metric value",
    example: 100.5,
  })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  value: number;

  @ApiProperty({
    description: "Unit of measurement",
    example: "meter",
  })
  @IsNotEmpty()
  unit: string;

  @ApiProperty({
    description: "Date when metric was recorded",
    example: "2024-01-15",
  })
  @IsDateString()
  @IsNotEmpty()
  date_recorded: string;
}

export class CreateMetricResponseDto {
  @ApiProperty({
    description: "Metric ID",
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: "User ID",
    example: 1,
  })
  @Expose()
  user_id: number;

  @ApiProperty({
    description: "Type of metric",
    enum: METRIC_TYPES,
    example: METRIC_TYPES.DISTANCE,
  })
  @Expose()
  metric_type: MetricType;

  @ApiProperty({
    description: "Metric value",
    example: 100.5,
  })
  @Expose()
  value: number;

  @ApiProperty({
    description: "Unit of measurement",
    example: "meter",
  })
  @Expose()
  unit: string;

  @ApiProperty({
    description: "Date when metric was recorded",
    example: "2024-01-15",
  })
  @Expose()
  date_recorded: string;

  @ApiProperty({
    description: "Date when metric was created",
    example: "2024-01-15",
  })
  @Expose()
  created_date: Date;

  @ApiProperty({
    description: "Date when metric was updated",
    example: "2024-01-15",
  })
  @Expose()
  updated_date: Date;
}
