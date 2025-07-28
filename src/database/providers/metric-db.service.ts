import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateMetricDto } from "@src/metrics/dto/create-metric.dto";
import { Repository } from "typeorm";
import { MetricEntity } from "../entities/metric.entity";

export interface IMetricRepository {
  createMetric(createMetricDto: CreateMetricDto): Promise<MetricEntity>;
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
}
