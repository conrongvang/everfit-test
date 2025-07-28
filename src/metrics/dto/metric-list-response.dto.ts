import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { CreateMetricResponseDto } from "./create-metric.dto";

export class MetricListResponseDto {
  @ApiProperty({
    description: "List of metrics",
    type: [CreateMetricResponseDto],
  })
  @Expose()
  data: CreateMetricResponseDto[];

  @ApiProperty({
    description: "Total number of metrics",
    example: 50,
  })
  @Expose()
  total: number;

  @ApiProperty({
    description: "Current page",
    example: 1,
  })
  @Expose()
  page: number;

  @ApiProperty({
    description: "Items per page",
    example: 10,
  })
  @Expose()
  limit: number;

  @ApiProperty({
    description: "Total pages",
    example: 5,
  })
  @Expose()
  totalPages: number;
}
