import { NestFactory } from "@nestjs/core";
import { AppModule } from "@src/app.module";
import { SeedModule } from "./seed.module";
import { SeedService } from "./seed.service";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const seedService = app.select(SeedModule).get(SeedService, { strict: true });

  try {
    const command = process.argv[2];

    switch (command) {
      case "all":
        await seedService.seedAll();
        break;
      case "users":
        await seedService.seedUsersOnly();
        break;
      case "metrics":
        await seedService.seedMetricsOnly();
        break;
      case "clear":
        await seedService.clearDatabase();
        break;
      default:
        console.log("Available commands:");
        console.log(
          "  npm run seed:perf full [userCount] [daysBack]   - Seed full performance data (default: 1000 users, 365 days)"
        );
        console.log("  npm run seed all     - Seed all data (users + metrics)");
        console.log("  npm run seed users   - Seed users only");
        console.log("  npm run seed metrics - Seed metrics only");
        console.log("  npm run seed clear   - Clear all data");
        break;
    }
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
