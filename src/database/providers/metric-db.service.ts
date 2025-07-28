import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChartDataQueryDto } from "@src/metrics/dto/chart-data-query.dto";
import { CreateMetricDto } from "@src/metrics/dto/create-metric.dto";
import { QueryMetricsDto } from "@src/metrics/dto/query-metrics.dto";
import { Repository } from "typeorm";
import { MetricEntity } from "../entities/metric.entity";

export interface IMetricRepository {
  createMetric(createMetricDto: CreateMetricDto): Promise<MetricEntity>;
  getMetricsByType(
    queryDto: QueryMetricsDto
  ): Promise<[MetricEntity[], number]>;
  getChartData(
    queryDto: ChartDataQueryDto
  ): Promise<{ created_date: Date; date: Date; unit: string; value: string }[]>;
}

@Injectable()
export class MetricDbService implements IMetricRepository {
  constructor(
    @InjectRepository(MetricEntity)
    private metricRepository: Repository<MetricEntity>
  ) {}

  async createMetric(createMetricDto: CreateMetricDto): Promise<MetricEntity> {
    const existingMetric = await this.metricRepository.findOne({
      where: {
        user_id: createMetricDto.user_id,
        metric_type: createMetricDto.metric_type,
        date_recorded: new Date(createMetricDto.date_recorded),
        deleted_date: null as any,
      },
    });

    if (existingMetric) {
      existingMetric.value = createMetricDto.value;
      existingMetric.unit = createMetricDto.unit;
      existingMetric.updated_date = new Date();

      return await this.metricRepository.save(existingMetric);
    }

    const metric = this.metricRepository.create({
      user_id: createMetricDto.user_id,
      metric_type: createMetricDto.metric_type,
      value: createMetricDto.value,
      unit: createMetricDto.unit,
      date_recorded: new Date(createMetricDto.date_recorded),
    });

    return await this.metricRepository.save(metric);
  }

  async getMetricsByType(queryDto: QueryMetricsDto) {
    const startTime = Date.now();
    const { userId, metricType, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    const result = await this.metricRepository.findAndCount({
      where: {
        user_id: userId,
        metric_type: metricType,
      },
      order: {
        date_recorded: "DESC",
        created_date: "DESC",
      },
      skip,
      take: limit,
    });

    const duration = Date.now() - startTime;
    if (duration > 100) {
      console.warn(`Slow query detected: getMetricsByType took ${duration}ms`);
    }

    return result;
  }

  async getChartData(
    queryDto: ChartDataQueryDto
  ): Promise<
    { created_date: Date; date: Date; unit: string; value: string }[]
  > {
    const startTime = Date.now();

    const { userId, metricType, timePeriod } = queryDto;
    const endDate = new Date();
    const startDate = new Date();

    startDate.setMonth(endDate.getMonth() - timePeriod);

    const result = await this.metricRepository
      .createQueryBuilder("metric")
      .select([
        "DATE(metric.date_recorded) as date",
        "metric.value as value",
        "metric.unit as unit",
        "metric.created_date as created_date",
      ])
      .where("metric.user_id = :userId", { userId })
      .andWhere("metric.metric_type = :metricType", { metricType })
      .andWhere("metric.date_recorded BETWEEN :startDate AND :endDate", {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      })
      .andWhere("metric.deleted_date IS NULL")
      .andWhere(
        `metric.created_date = (
        SELECT MAX(m2.created_date) 
        FROM metrics m2 
        WHERE m2.user_id = metric.user_id 
          AND m2.metric_type = metric.metric_type 
          AND DATE(m2.date_recorded) = DATE(metric.date_recorded)
          AND m2.deleted_date IS NULL
      )`
      )
      .orderBy("DATE(metric.date_recorded)", "ASC")
      .getRawMany();

    const duration = Date.now() - startTime;
    if (duration > 200) {
      console.warn(
        `Slow chart query detected: ${duration}ms for user ${userId}, type ${metricType}`
      );
    }

    return result;
  }
}
