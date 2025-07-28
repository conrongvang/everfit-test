import { Body, Controller, Get, HttpStatus, Post, Query } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { MetricEntity } from "../database/entities/metric.entity";
import {
  CreateMetricDto,
  CreateMetricResponseDto,
} from "./dto/create-metric.dto";
import { MetricListResponseDto } from "./dto/metric-list-response.dto";
import { QueryMetricsDto } from "./dto/query-metrics.dto";
import { MetricsService } from "./metrics.service";

@ApiTags("Metrics")
@ApiBearerAuth()
@Controller("metrics")
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Post()
  @ApiOperation({
    summary: "Create new metric",
    description: "Add a new metric record with date, value, and unit",
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Metric created successfully",
    type: MetricEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input data",
    type: CreateMetricResponseDto,
  })
  async createMetric(
    @Body() createMetricDto: CreateMetricDto
  ): Promise<CreateMetricResponseDto> {
    return await this.metricsService.createMetric(createMetricDto);
  }

  @Get()
  @ApiOperation({
    summary: "Get metrics by type",
    description:
      "Retrieve a list of all metrics filtered by type (Distance/Temperature) for a specific user",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Metrics retrieved successfully",
    type: MetricListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid query parameters",
  })
  async getMetricsByType(
    @Query() queryDto: QueryMetricsDto
  ): Promise<MetricListResponseDto> {
    return await this.metricsService.getMetricsByType(queryDto);
  }
}
