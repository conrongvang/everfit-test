import { BadRequestException, Injectable } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import {
  DISTANCE_UNITS,
  METRIC_TYPES,
  TEMPERATURE_UNITS,
} from "../common/constants/metric-units";
import { UnitConversionService } from "../common/utils/unit-conversion.service";
import { MetricDbService } from "../database/providers/metric-db.service";
import {
  CreateMetricDto,
  CreateMetricResponseDto,
} from "./dto/create-metric.dto";
import { MetricListResponseDto } from "./dto/metric-list-response.dto";
import { QueryMetricsDto } from "./dto/query-metrics.dto";

interface IMetricService {
  createMetric(
    createMetricDto: CreateMetricDto
  ): Promise<CreateMetricResponseDto>;
  getMetricsByType(queryDto: QueryMetricsDto): Promise<MetricListResponseDto>;
}

@Injectable()
export class MetricsService implements IMetricService {
  constructor(
    private readonly metricDbService: MetricDbService,
    private readonly unitConversionService: UnitConversionService
  ) {}

  private validateUnit(metricType: string, unit: string): void {
    const validUnits =
      metricType === METRIC_TYPES.DISTANCE
        ? Object.values(DISTANCE_UNITS)
        : Object.values(TEMPERATURE_UNITS);

    if (!validUnits.includes(unit as never)) {
      throw new BadRequestException(
        `Invalid unit '${unit}' for metric type '${metricType}'. Valid units: ${validUnits.join(
          ", "
        )}`
      );
    }
  }

  async createMetric(
    createMetricDto: CreateMetricDto
  ): Promise<CreateMetricResponseDto> {
    this.validateUnit(createMetricDto.metric_type, createMetricDto.unit);
    const metricEnt = await this.metricDbService.createMetric(createMetricDto);
    const data = plainToClass(CreateMetricResponseDto, metricEnt, {
      excludeExtraneousValues: true,
    });
    return data;
  }

  async getMetricsByType(
    queryDto: QueryMetricsDto
  ): Promise<MetricListResponseDto> {
    const { page = 1, limit = 10 } = queryDto;
    const [metrics, total] = await this.metricDbService.getMetricsByType(
      queryDto
    );
    const totalPages = Math.ceil(total / limit);
    const data = plainToClass(CreateMetricResponseDto, metrics, {
      excludeExtraneousValues: true,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
