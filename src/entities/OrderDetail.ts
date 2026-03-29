import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Course } from "./Course";
import { Order } from "./Order";

@Entity({ name: "order_details" })
export class OrderDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Order, (order) => order.details, { onDelete: "CASCADE" })
  order!: Order;

  @ManyToOne(() => Course, (course) => course.orderDetails, {
    onDelete: "RESTRICT",
  })
  course!: Course;

  @Column({ name: "unit_price", type: "decimal", precision: 10, scale: 2 })
  unitPrice!: number;

  @Column({
    name: "discount_amount",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  discountAmount!: number;

  @Column({ name: "final_price", type: "decimal", precision: 10, scale: 2 })
  finalPrice!: number;
}
