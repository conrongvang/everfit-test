import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppConfigs } from "../app.config";
import { MetricEntity } from "./entities/metric.entity";
import { UserEntity } from "./entities/user.entity";
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
        logging: !AppConfigs.isProd ? ["query", "error"] : ["error"],
      }),
    }),
    TypeOrmModule.forFeature([UserEntity, MetricEntity]),
  ],
  providers: [UsersDbService],
  exports: [UsersDbService],
})
export class DatabaseModule {}
