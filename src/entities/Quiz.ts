import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Question } from "./Question";
import { Section } from "./Section";

@Entity({ name: "quizzes" })
export class Quiz {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 180 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ name: "order_index", type: "int", default: 1 })
  orderIndex!: number;

  @ManyToOne(() => Section, (section) => section.quizzes, {
    onDelete: "CASCADE",
  })
  section!: Section;

  @OneToMany(() => Question, (question) => question.quiz, { cascade: true })
  questions!: Question[];
}
