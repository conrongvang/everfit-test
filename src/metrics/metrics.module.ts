import { Module } from "@nestjs/common";
import { UnitConversionService } from "../common/utils/unit-conversion.service";
import { DatabaseModule } from "../database/database.module";
import { MetricsController } from "./metrics.controller";
import { MetricsService } from "./metrics.service";

@Module({
  imports: [DatabaseModule],
  controllers: [MetricsController],
  providers: [MetricsService, UnitConversionService],
  exports: [MetricsService],
})
export class MetricsModule {}
