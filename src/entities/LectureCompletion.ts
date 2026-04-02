import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Lecture } from "./Lecture";
import { User } from "./User";

@Entity({ name: "lecture_completions" })
@Unique(["user", "lecture"])
export class LectureCompletion {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user!: User;

  @ManyToOne(() => Lecture, { onDelete: "CASCADE" })
  lecture!: Lecture;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
