import { HttpModule } from "@nestjs/axios";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SeedModule } from "./database/seeders/seed.module";
import { HealthModule } from "./health/health.module";
import { MetricsModule } from "./metrics/metrics.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [HttpModule, HealthModule, UsersModule, MetricsModule, SeedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes("*");
  }
}
