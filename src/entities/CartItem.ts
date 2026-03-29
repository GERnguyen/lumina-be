import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Cart } from "./Cart";
import { Course } from "./Course";

@Entity({ name: "cart_items" })
export class CartItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: "CASCADE" })
  cart!: Cart;

  @ManyToOne(() => Course, (course) => course.cartItems, {
    onDelete: "CASCADE",
  })
  course!: Course;

  @Column({ name: "unit_price", type: "decimal", precision: 10, scale: 2 })
  unitPrice!: number;

  @Column({ type: "int", default: 1 })
  quantity!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
