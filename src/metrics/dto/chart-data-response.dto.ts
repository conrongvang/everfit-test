import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class ChartDataPointDto {
  @ApiProperty({
    description: "Date of the metric",
    example: "2024-01-15",
  })
  @Expose()
  date: string;

  @ApiProperty({
    description: "Metric value (converted if target unit specified)",
    example: 100.5,
  })
  @Expose()
  value: number;

  @ApiProperty({
    description: "Original unit of the metric",
    example: "meter",
  })
  @Expose()
  originalUnit: string;

  @ApiProperty({
    description: "Converted unit (if conversion applied)",
    example: "centimeter",
    required: false,
  })
  @Expose()
  convertedUnit?: string;

  @ApiProperty({
    description: "Original value before conversion",
    example: 1.005,
    required: false,
  })
  @Expose()
  originalValue?: number;
}

export class ChartDataResponseDto {
  @ApiProperty({
    description: "Chart data points",
    type: [ChartDataPointDto],
  })
  data: ChartDataPointDto[];

  @ApiProperty({
    description: "Metric type",
    example: "distance",
  })
  metricType: string;

  @ApiProperty({
    description: "Time period in months",
    example: 1,
  })
  timePeriod: number;

  @ApiProperty({
    description: "Target unit used for conversion",
    example: "meter",
    required: false,
  })
  targetUnit?: string;

  @ApiProperty({
    description: "Total data points",
    example: 30,
  })
  totalPoints: number;
}
