import * as dotenv from "dotenv";
import * as path from "path";
import * as process from "process";
import type { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

dotenv.config();

if (process.env.NODE_ENV === "test") {
  const testEnvPath = path.resolve(process.cwd(), ".env.test");
  console.log("Loading test environment from:", testEnvPath);
  dotenv.config({ path: testEnvPath, override: true });
} else {
  dotenv.config();
}

export const AppConfigs = {
  title: "tracking-metrics",
  isProd: process.env.NODE_ENV === "production",
  // healthUrl: process.env.HEALTH_URL,
  port: parseInt(process.env.BE_HOST_PORT || "5001", 10) || 5001,
  db: {
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432", 10) || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  } as Partial<PostgresConnectionOptions>,
};
