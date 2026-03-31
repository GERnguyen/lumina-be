import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Coupon } from "./Coupon";
import { OrderDetail } from "./OrderDetail";
import { User } from "./User";

export enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  COMPLETED = "completed",
  FAILED = "failed",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
}

@Entity({ name: "orders" })
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: "CASCADE" })
  user!: User;

  @ManyToOne(() => Coupon, (coupon) => coupon.orders, {
    nullable: true,
    onDelete: "SET NULL",
  })
  coupon?: Coupon;

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column({ name: "total_amount", type: "decimal", precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({
    name: "discount_amount",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  discountAmount!: number;

  @Column({
    name: "payment_method",
    type: "varchar",
    length: 50,
    default: "mock",
  })
  paymentMethod!: string;

  @Column({ name: "paid_at", type: "datetime", nullable: true })
  paidAt?: Date;

  @OneToMany(() => OrderDetail, (detail) => detail.order, { cascade: true })
  details!: OrderDetail[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
