import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Course } from "./Course";
import { User } from "./User";

@Entity({ name: "enrollments" })
@Unique(["user", "course"])
export class Enrollment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.enrollments, { onDelete: "CASCADE" })
  user!: User;

  @ManyToOne(() => Course, (course) => course.enrollments, {
    onDelete: "CASCADE",
  })
  course!: Course;

  @Column({
    name: "progress_percent",
    type: "decimal",
    precision: 5,
    scale: 2,
    default: 0,
  })
  progressPercent!: number;

  @Column({ name: "completed_at", type: "datetime", nullable: true })
  completedAt?: Date;

  @CreateDateColumn({ name: "enrolled_at" })
  enrolledAt!: Date;
}
