import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { CartItem } from "./CartItem";
import { Category } from "./Category";
import { Enrollment } from "./Enrollment";
import { OrderDetail } from "./OrderDetail";
import { Review } from "./Review";
import { Section } from "./Section";
import { Tag } from "./Tag";
import { User } from "./User";

@Entity({ name: "courses" })
export class Course {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 160 })
  title!: string;

  @Column({ type: "varchar", length: 180, unique: true })
  slug!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({
    name: "thumbnail_url",
    type: "varchar",
    length: 500,
    nullable: true,
  })
  thumbnailUrl?: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  price!: number;

  @Column({ name: "enrollment_count", type: "int", default: 0 })
  enrollmentCount!: number;

  @Column({ name: "discount_percent", type: "int", default: 0 })
  discountPercent!: number;

  @Column({
    name: "average_rating",
    type: "decimal",
    precision: 3,
    scale: 2,
    default: 0,
  })
  averageRating!: number;

  @Column({ name: "review_count", type: "int", default: 0 })
  reviewCount!: number;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @Column({ name: "published_at", type: "datetime", nullable: true })
  publishedAt?: Date;

  @ManyToOne(() => User, (user) => user.instructorCourses, {
    onDelete: "CASCADE",
  })
  instructor!: User;

  @ManyToOne(() => Category, (category) => category.courses, {
    nullable: true,
    onDelete: "SET NULL",
  })
  category?: Category;

  @OneToMany(() => Section, (section) => section.course, { cascade: true })
  sections!: Section[];

  @OneToMany(() => Review, (review) => review.course)
  reviews!: Review[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments!: Enrollment[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.course)
  cartItems!: CartItem[];

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.course)
  orderDetails!: OrderDetail[];

  @ManyToMany(() => Tag, (tag) => tag.courses, { cascade: false })
  @JoinTable({ name: "course_tags" })
  tags!: Tag[];

  @ManyToMany(() => User, (user) => user.favoriteCourses)
  favoritedByUsers!: User[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
