import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppConfigs } from "../app.config";
import { MetricEntity } from "./entities/metric.entity";
import { UserEntity } from "./entities/user.entity";
import { MetricDbService } from "./providers/metric-db.service";
import { UsersDbService } from "./providers/user-db.service";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: AppConfigs.db.type,
        host: AppConfigs.db.host,
        port: AppConfigs.db.port,
        username: AppConfigs.db.username,
        password: encodeURIComponent(AppConfigs.db.password as string),
        database: AppConfigs.db.name,
        entities: [__dirname + "/../**/entities/*.entity.{ts,js}"],
        synchronize: !AppConfigs.isProd,
        extra: {
          poolSize: 10,
          connectionTimeoutMillis: 6000,
          query_timeout: 6000,
          statement_timeout: 6000,
          connectionLimit: 35,
          acquireTimeout: 60000,
          timeout: 60000,
          charset: "utf8mb4",
          timezone: "+00:00",
        },
        logging: !AppConfigs.isProd ? ["query", "error"] : ["error"],
        maxQueryExecutionTime: 1000,
      }),
    }),
    TypeOrmModule.forFeature([UserEntity, MetricEntity]),
  ],
  providers: [UsersDbService, MetricDbService],
  exports: [UsersDbService, MetricDbService],
})
export class DatabaseModule {}
