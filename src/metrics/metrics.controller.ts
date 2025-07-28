import { Body, Controller, HttpStatus, Post } from "@nestjs/common";
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
}
