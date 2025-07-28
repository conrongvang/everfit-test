import { ApiProperty } from "@nestjs/swagger";
import {
  DistanceUnit,
  METRIC_TYPES,
  MetricType,
  TemperatureUnit,
} from "@src/common/constants/metric-units";
import { Transform } from "class-transformer";
import { IsEnum, IsIn, IsNumber, IsOptional } from "class-validator";

export class ChartDataQueryDto {
  @ApiProperty({
    description: "User ID",
    example: 1,
  })
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  userId: number;

  @ApiProperty({
    description: "Type of metric",
    enum: METRIC_TYPES,
    example: METRIC_TYPES.DISTANCE,
  })
  @IsEnum(METRIC_TYPES)
  metricType: MetricType;

  @ApiProperty({
    description: "Time period in months",
    example: 1,
    enum: [1, 2],
  })
  @IsNumber()
  @IsIn([1, 2])
  @Transform(({ value }) => parseInt(value))
  timePeriod: 1 | 2;

  @ApiProperty({
    description: "Target unit for conversion (optional)",
    example: "meter",
    required: false,
  })
  @IsOptional()
  targetUnit?: DistanceUnit | TemperatureUnit;
}
