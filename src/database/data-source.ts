import { DataSource, type DataSourceOptions } from "typeorm";
import { AppConfigs } from "../app.config";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: AppConfigs.db.host,
  port: AppConfigs.db.port,
  username: AppConfigs.db.username,
  password: AppConfigs.db.password,
  database: AppConfigs.db.name,
  entities: ["dist/entities/*.entity.{ts,js}"],
  migrations: [__dirname + "../migrations/*.{ts,js}"],
  synchronize: false,
  migrationsRun: AppConfigs.isProd, // Auto-run migrations in production
  logging: true,
} as DataSourceOptions);
