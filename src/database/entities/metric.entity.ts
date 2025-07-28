import { Exclude, Expose } from "class-transformer";
import { METRIC_TYPES, MetricType } from "src/common/constants/metric-units";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserEntity } from "./user.entity";

@Entity("metrics")
export class MetricEntity {
  @Exclude()
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Expose()
  @Column("number")
  user_id: number;

  @Expose()
  @Column({
    type: "enum",
    enum: METRIC_TYPES,
    nullable: false,
  })
  metric_type: MetricType;

  @Expose()
  @Column("decimal", { precision: 10, scale: 4, nullable: false })
  value: number;

  @Expose()
  @Column("varchar", { length: 10, nullable: false })
  unit: string;

  @Expose()
  @Column("date", { nullable: false })
  date_recorded: Date;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;

  @DeleteDateColumn({ default: null })
  deleted_date: Date;

  @ManyToOne(() => UserEntity, (user) => user.metrics, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn({ name: "user_id" })
  user: UserEntity;
}
