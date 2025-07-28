import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MetricEntity } from "../entities/metric.entity";
import { UserEntity } from "../entities/user.entity";
import { generateMetricsForUser } from "./data/metrics.seed";
import { seedUsers } from "./data/users.seed";

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(MetricEntity)
    private metricRepository: Repository<MetricEntity>
  ) {}

  async seedAll(): Promise<void> {
    this.logger.log("Starting database seeding...");

    await this.clearDatabase();
    await this.seedUsers();
    await this.seedMetrics();

    this.logger.log("Database seeding completed successfully!");
  }

  async clearDatabase(): Promise<void> {
    this.logger.log("Clearing existing data...");

    // Clear metrics first due to foreign key constraints
    await this.metricRepository.delete({});
    await this.userRepository.delete({});

    this.logger.log("Database cleared");
  }

  async seedUsers(): Promise<UserEntity[]> {
    this.logger.log("Seeding users...");

    const users: UserEntity[] = [];

    for (const userData of seedUsers) {
      const user = this.userRepository.create(userData);
      const savedUser = await this.userRepository.save(user);
      users.push(savedUser as unknown as UserEntity);
      this.logger.log(`Created user: ${savedUser.name as string}`);
    }

    this.logger.log(`Seeded ${users.length} users`);
    return users;
  }

  async seedMetrics(): Promise<void> {
    this.logger.log("Seeding metrics...");

    const users = await this.userRepository.find();
    let totalMetrics = 0;

    for (const user of users) {
      const userMetrics = generateMetricsForUser(parseInt(user.id));

      for (const metricData of userMetrics) {
        await this.metricRepository.save(metricData as MetricEntity);
        totalMetrics++;
      }

      this.logger.log(
        `Created ${userMetrics.length} metrics for user: ${user.name}`
      );
    }

    this.logger.log(`Seeded ${totalMetrics} total metrics`);
  }

  async seedUsersOnly(): Promise<void> {
    this.logger.log("Seeding users only...");
    await this.seedUsers();
  }

  async seedMetricsOnly(): Promise<void> {
    this.logger.log("Seeding metrics only...");
    await this.seedMetrics();
  }
}
