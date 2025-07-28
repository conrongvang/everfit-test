import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MetricEntity } from "../entities/metric.entity";
import { UserEntity } from "../entities/user.entity";
import { SeedService } from "./seed.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, MetricEntity])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
