import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Question } from "./Question";

@Entity({ name: "answers" })
export class Answer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "text" })
  content!: string;

  @Column({ name: "is_correct", type: "boolean", default: false })
  isCorrect!: boolean;

  @Column({ name: "order_index", type: "int", default: 1 })
  orderIndex!: number;

  @ManyToOne(() => Question, (question) => question.answers, {
    onDelete: "CASCADE",
  })
  question!: Question;
}
