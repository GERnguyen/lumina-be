import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Order } from "./Order";

export enum CouponDiscountType {
  PERCENT = "percent",
  FIXED = "fixed",
}

@Entity({ name: "coupons" })
export class Coupon {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 50, unique: true })
  code!: string;

  @Column({
    name: "discount_type",
    type: "enum",
    enum: CouponDiscountType,
    default: CouponDiscountType.PERCENT,
  })
  discountType!: CouponDiscountType;

  @Column({ name: "discount_value", type: "decimal", precision: 10, scale: 2 })
  discountValue!: number;

  @Column({
    name: "max_discount",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  maxDiscount?: number;

  @Column({
    name: "min_order_value",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  minOrderValue?: number;

  @Column({ name: "starts_at", type: "datetime", nullable: true })
  startsAt?: Date;

  @Column({ name: "ends_at", type: "datetime", nullable: true })
  endsAt?: Date;

  @Column({ name: "usage_limit", type: "int", nullable: true })
  usageLimit?: number;

  @Column({ name: "used_count", type: "int", default: 0 })
  usedCount!: number;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @OneToMany(() => Order, (order) => order.coupon)
  orders!: Order[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
