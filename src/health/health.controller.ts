import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from "@nestjs/terminus";
import { Public } from "../common/decorators/public.decorator";

@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly dbHc: TypeOrmHealthIndicator
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  @ApiOkResponse()
  @ApiOperation({ summary: "Check all services are up or down" })
  async check() {
    return this.health.check([
      async () => await this.dbHc.pingCheck("Database"),
    ]);
  }
}
