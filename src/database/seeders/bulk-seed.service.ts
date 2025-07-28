import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MetricEntity } from "../entities/metric.entity";
import { UserEntity } from "../entities/user.entity";
import {
  generateBulkMetricsForUsers,
  generatePerformanceUsers,
} from "./data/performance-users.seed";

@Injectable()
export class BulkSeedService {
  private readonly logger = new Logger(BulkSeedService.name);

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(MetricEntity)
    private metricRepository: Repository<MetricEntity>
  ) {}

  async seedForPerformanceTest(
    userCount = 1000,
    daysBack = 365
  ): Promise<void> {
    this.logger.log(
      `Starting performance seeding: ${userCount} users, ${daysBack} days of data...`
    );
    const startTime = Date.now();

    await this.clearDatabase();

    const users = await this.createUsersInBatches(userCount);

    this.logger.log(`Created ${users.length} users`);

    await this.createMetricsInBatches(users, daysBack);

    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;

    this.logger.log(
      `Performance seeding completed in ${totalTime.toFixed(2)} seconds!`
    );
    this.logger.log(
      `Total records: ${userCount} users, ~${userCount * daysBack * 2} metrics`
    );
  }

  async clearDatabase(): Promise<void> {
    this.logger.log("Clearing existing data...");

    await this.metricRepository.delete({});
    await this.userRepository.delete({});

    this.logger.log("Database cleared");
  }

  private async createUsersInBatches(userCount: number): Promise<UserEntity[]> {
    this.logger.log(`Creating ${userCount} users...`);

    const batchSize = 100;
    const userData = generatePerformanceUsers(userCount);
    const createdUsers: UserEntity[] = [];

    for (let i = 0; i < userData.length; i += batchSize) {
      const batch = userData.slice(i, i + batchSize);

      try {
        await this.userRepository
          .createQueryBuilder()
          .insert()
          .into(UserEntity)
          .values(batch)
          .execute();

        const insertedUsers = await this.userRepository
          .createQueryBuilder("user")
          .where("user.name IN (:...names)", {
            names: batch.map((u) => u.name),
          })
          .getMany();

        createdUsers.push(...insertedUsers);

        this.logger.log(
          `Created batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            userData.length / batchSize
          )} (${insertedUsers.length} users)`
        );
      } catch (error) {
        this.logger.error(`Failed to create user batch: ${error.message}`);
        throw error;
      }
    }

    return createdUsers;
  }

  private async createMetricsInBatches(
    users: UserEntity[],
    daysBack: number
  ): Promise<void> {
    this.logger.log(
      `Creating metrics for ${users.length} users, ${daysBack} days back...`
    );

    const batchSize = 1000;
    const userIds = users.map((user) => parseInt(user.id));
    const userChunkSize = 50;

    for (let i = 0; i < userIds.length; i += userChunkSize) {
      const userChunk = userIds.slice(i, i + userChunkSize);
      const metrics = generateBulkMetricsForUsers(userChunk, daysBack);

      this.logger.log(
        `Generated ${metrics.length} metrics for users ${i + 1}-${Math.min(
          i + userChunkSize,
          userIds.length
        )}`
      );

      for (let j = 0; j < metrics.length; j += batchSize) {
        const metricBatch = metrics.slice(j, j + batchSize);

        try {
          await this.metricRepository
            .createQueryBuilder()
            .insert()
            .into(MetricEntity)
            .values(metricBatch as MetricEntity[])
            .execute();

          if (j % (batchSize * 5) === 0) {
            this.logger.log(
              `Inserted ${j + metricBatch.length}/${
                metrics.length
              } metrics for current user chunk`
            );
          }
        } catch (error) {
          this.logger.error(`Failed to insert metric batch: ${error.message}`);
          throw error;
        }
      }

      this.logger.log(
        `Completed metrics for user chunk ${
          Math.floor(i / userChunkSize) + 1
        }/${Math.ceil(userIds.length / userChunkSize)}`
      );
    }

    const totalMetrics = userIds.length * daysBack * 2; // 2 metric types per day
    this.logger.log(`Successfully created ~${totalMetrics} total metrics`);
  }

  async seedUsersOnly(count = 1000): Promise<UserEntity[]> {
    this.logger.log(`Seeding ${count} users only...`);
    return await this.createUsersInBatches(count);
  }

  async seedMetricsOnly(daysBack = 365): Promise<void> {
    this.logger.log(`Seeding metrics only for existing users...`);
    const users = await this.userRepository.find();
    await this.createMetricsInBatches(users, daysBack);
  }
}
