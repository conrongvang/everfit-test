import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppConfigs } from "../app.config";

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
    TypeOrmModule.forFeature([]),
  ],
  providers: [],
  exports: [],
})
export class DatabaseModule {}
