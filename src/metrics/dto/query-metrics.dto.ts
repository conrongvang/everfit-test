import { ApiProperty } from "@nestjs/swagger";
import { METRIC_TYPES, MetricType } from "@src/common/constants/metric-units";
import { Transform } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Min } from "class-validator";

export class QueryMetricsDto {
  @ApiProperty({
    description: "User ID",
    example: 1,
  })
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  userId: number;

  @ApiProperty({
    description: "Type of metric to filter by",
    enum: METRIC_TYPES,
    example: METRIC_TYPES.DISTANCE,
  })
  @IsEnum(METRIC_TYPES)
  metricType: MetricType;

  @ApiProperty({
    description: "Page number for pagination",
    example: 1,
    required: false,
    default: 1,
  })
  @Min(1)
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: "Number of items per page",
    example: 10,
    required: false,
    default: 10,
  })
  @Min(1)
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  limit?: number = 10;
}
