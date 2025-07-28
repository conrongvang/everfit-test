import { Injectable } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { METRICS_ERROR_CODES } from "../common/constants/error-codes";
import {
  DISTANCE_UNITS,
  METRIC_TYPES,
  TEMPERATURE_UNITS,
} from "../common/constants/metric-units";
import { BadRequestAppException } from "../common/exceptions/app-exception";
import { UnitConversionService } from "../common/utils/unit-conversion.service";
import { MetricDbService } from "../database/providers/metric-db.service";
import { ChartDataQueryDto } from "./dto/chart-data-query.dto";
import {
  ChartDataPointDto,
  ChartDataResponseDto,
} from "./dto/chart-data-response.dto";
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
  getChartData(queryDto: ChartDataQueryDto): Promise<ChartDataResponseDto>;
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
      throw new BadRequestAppException({
        errorCode: METRICS_ERROR_CODES.INVALID_UNIT,
        message: `Invalid unit '${unit}' for metric type '${metricType}'`,
        details: {
          providedUnit: unit,
          validUnits: validUnits,
          metricType: metricType,
        },
      });
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

  async getChartData(
    queryDto: ChartDataQueryDto
  ): Promise<ChartDataResponseDto> {
    const { metricType, timePeriod, targetUnit } = queryDto;

    if (targetUnit) {
      this.validateUnit(metricType, targetUnit);
    }

    const metrics = await this.metricDbService.getChartData(queryDto);

    const chartData: ChartDataPointDto[] = (metrics || []).map((metric) => {
      const dataPoint = plainToClass(ChartDataPointDto, metric, {
        excludeExtraneousValues: true,
      });

      if (targetUnit && targetUnit !== metric.unit) {
        dataPoint.originalValue = dataPoint.value;
        dataPoint.value = this.unitConversionService.convertValue(
          dataPoint.value,
          metric.unit,
          targetUnit,
          metricType
        );
        dataPoint.convertedUnit = targetUnit;
      }

      return dataPoint;
    });

    return {
      data: chartData,
      metricType,
      timePeriod,
      targetUnit,
      totalPoints: chartData.length,
    };
  }
}
