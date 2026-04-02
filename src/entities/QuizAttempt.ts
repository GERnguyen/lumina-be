import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Quiz } from "./Quiz";
import { User } from "./User";

@Entity({ name: "quiz_attempts" })
export class QuizAttempt {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user!: User;

  @ManyToOne(() => Quiz, { onDelete: "CASCADE" })
  quiz!: Quiz;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  score!: number;

  @Column({ type: "int" })
  totalQuestions!: number;

  @Column({ type: "int" })
  correctAnswers!: number;

  @CreateDateColumn({ name: "attempted_at" })
  attemptedAt!: Date;
}
