import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Answer } from "./Answer";
import { Quiz } from "./Quiz";

@Entity({ name: "questions" })
export class Question {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "text" })
  content!: string;

  @Column({ name: "order_index", type: "int", default: 1 })
  orderIndex!: number;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions, { onDelete: "CASCADE" })
  quiz!: Quiz;

  @OneToMany(() => Answer, (answer) => answer.question, { cascade: true })
  answers!: Answer[];
}
