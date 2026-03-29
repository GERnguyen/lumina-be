import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Course } from "./Course";
import { Lecture } from "./Lecture";
import { Quiz } from "./Quiz";

@Entity({ name: "sections" })
export class Section {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 160 })
  title!: string;

  @Column({ name: "order_index", type: "int", default: 1 })
  orderIndex!: number;

  @ManyToOne(() => Course, (course) => course.sections, { onDelete: "CASCADE" })
  course!: Course;

  @OneToMany(() => Lecture, (lecture) => lecture.section, { cascade: true })
  lectures!: Lecture[];

  @OneToMany(() => Quiz, (quiz) => quiz.section, { cascade: true })
  quizzes!: Quiz[];
}
