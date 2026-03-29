import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Cart } from "./Cart";
import { Course } from "./Course";
import { Enrollment } from "./Enrollment";
import { OtpRecord } from "./OtpRecord";
import { Order } from "./Order";
import { Profile } from "./Profile";
import { Review } from "./Review";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 120, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 20, unique: true, nullable: true })
  phone?: string;

  @Column({ type: "varchar", length: 255 })
  password!: string;

  @Column({ type: "varchar", length: 50, default: "student" })
  role!: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @Column({ name: "reward_points", type: "int", default: 0 })
  rewardPoints!: number;

  // Inverse side of one-to-one relation. Profile owns the foreign key.
  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile?: Profile;

  @OneToOne(() => Cart, (cart) => cart.user)
  cart?: Cart;

  @OneToMany(() => Course, (course) => course.instructor)
  instructorCourses!: Course[];

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.user)
  enrollments!: Enrollment[];

  @OneToMany(() => Review, (review) => review.user)
  reviews!: Review[];

  @OneToMany(() => OtpRecord, (otpRecord) => otpRecord.user)
  otpRecords!: OtpRecord[];

  @ManyToMany(() => Course, (course) => course.favoritedByUsers)
  @JoinTable({ name: "user_favorites" })
  favoriteCourses!: Course[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
