import { Exclude, Expose } from "class-transformer";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { MetricEntity } from "./metric.entity";

@Entity("users")
export class UserEntity {
  @Exclude()
  @PrimaryGeneratedColumn("increment")
  id: string;

  @Expose()
  @Column("varchar", { length: 60, unique: true, nullable: true })
  name: string;

  @OneToMany(() => MetricEntity, (metrics) => metrics.user, { cascade: true })
  metrics: MetricEntity[];

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;

  @DeleteDateColumn({ default: null })
  deleted_date: Date;
}
