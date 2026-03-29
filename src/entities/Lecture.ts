import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Section } from "./Section";

@Entity({ name: "lectures" })
export class Lecture {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 180 })
  title!: string;

  @Column({ name: "content_text", type: "text", nullable: true })
  contentText?: string;

  @Column({ name: "video_url", type: "varchar", length: 500, nullable: true })
  videoUrl?: string;

  @Column({ name: "order_index", type: "int", default: 1 })
  orderIndex!: number;

  @ManyToOne(() => Section, (section) => section.lectures, {
    onDelete: "CASCADE",
  })
  section!: Section;
}
