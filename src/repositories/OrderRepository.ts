import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Order } from "../entities/Order";

export class OrderRepository {
  private readonly repository: Repository<Order>;

  constructor() {
    this.repository = AppDataSource.getRepository(Order);
  }

  async save(order: Order): Promise<Order> {
    return this.repository.save(order);
  }

  async findById(orderId: number): Promise<Order | null> {
    return this.repository.findOne({
      where: { id: orderId },
      relations: {
        details: true,
        user: true,
        coupon: true,
      },
    });
  }
}

export const orderRepository = new OrderRepository();
