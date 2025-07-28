import { HttpModule } from "@nestjs/axios";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [HttpModule, HealthModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes("*");
  }
}
