import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { Course } from "./Course";
import { User } from "./User";

@Entity({ name: "reviews" })
@Unique(["user", "course"])
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: "CASCADE" })
  user!: User;

  @ManyToOne(() => Course, (course) => course.reviews, { onDelete: "CASCADE" })
  course!: Course;

  @Column({ type: "int" })
  rating!: number;

  @Column({ type: "text", nullable: true })
  comment?: string;

  @Column({ name: "instructor_reply", type: "text", nullable: true })
  instructorReply?: string;

  @Column({
    name: "instructor_replied_at",
    type: "datetime",
    nullable: true,
  })
  instructorRepliedAt?: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
