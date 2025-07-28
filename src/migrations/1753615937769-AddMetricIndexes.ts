import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMetricIndexes1753615937769 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE INDEX "IDX_metrics_user_metric_date" 
        ON "metrics" ("user_id", "metric_type", "date_recorded")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_metrics_user_date" 
        ON "metrics" ("user_id", "date_recorded")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_metrics_date" 
        ON "metrics" ("date_recorded")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_metrics_user_metric" 
        ON "metrics" ("user_id", "metric_type")
    `);

    await queryRunner.query(`
        CREATE UNIQUE INDEX "IDX_metrics_user_metric_date_unit_unique" 
        ON "metrics" ("user_id", "metric_type", "date_recorded", "unit") 
        WHERE "deleted_date" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IDX_metrics_user_metric_date_unit_unique"`
    );
    await queryRunner.query(`DROP INDEX "IDX_metrics_user_metric"`);
    await queryRunner.query(`DROP INDEX "IDX_metrics_date"`);
    await queryRunner.query(`DROP INDEX "IDX_metrics_user_date"`);
    await queryRunner.query(`DROP INDEX "IDX_metrics_user_metric_date"`);
  }
}
