import { HttpModule } from "@nestjs/axios";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CorrelationIdMiddleware } from "./common/middlewares/correlation-id.middleware";
import { AppLoggerMiddleware } from "./common/middlewares/logging.middleware";
import { AppLoggerService } from "./common/utils/app-logger.service";
import { ContextService } from "./common/utils/context.service";
import { SeedModule } from "./database/seeders/seed.module";
import { HealthModule } from "./health/health.module";
import { MetricsModule } from "./metrics/metrics.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [HttpModule, HealthModule, UsersModule, MetricsModule, SeedModule],
  controllers: [AppController],
  providers: [AppService, ContextService, AppLoggerService],
  exports: [ContextService, AppLoggerService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware, AppLoggerMiddleware).forRoutes("*");
  }
}
