import { In } from "typeorm";
import { AppDataSource } from "../data-source";
import { Cart } from "../entities/Cart";
import { Enrollment } from "../entities/Enrollment";
import { Order, OrderStatus } from "../entities/Order";
import { OrderDetail } from "../entities/OrderDetail";
import { User } from "../entities/User";
import { MockPaymentStrategy } from "../utils/payment/MockPaymentStrategy";
import { PaymentContext } from "../utils/payment/PaymentContext";

export class OrderService {
  private readonly paymentContext = new PaymentContext(
    new MockPaymentStrategy(),
  );

  async getMyOrders(userId: number): Promise<Order[]> {
    const userRepository = AppDataSource.getRepository(User);
    const orderRepository = AppDataSource.getRepository(Order);

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    return orderRepository.find({
      where: {
        user: { id: userId },
      },
      relations: {
        details: {
          course: {
            tags: true,
            category: true,
          },
        },
      },
      order: {
        createdAt: "DESC",
      },
    });
  }

  async getOrderById(userId: number, orderId: number): Promise<Order | null> {
    const orderRepository = AppDataSource.getRepository(Order);

    return orderRepository.findOne({
      where: {
        id: orderId,
        user: { id: userId },
      },
      relations: {
        user: true,
        details: {
          course: {
            tags: true,
            category: true,
          },
        },
      },
    });
  }

  async checkout(userId: number): Promise<Order> {
    const pendingOrder = await AppDataSource.manager.transaction(
      async (manager) => {
        const userRepository = manager.getRepository(User);
        const cartRepository = manager.getRepository(Cart);
        const orderRepository = manager.getRepository(Order);
        const orderDetailRepository = manager.getRepository(OrderDetail);

        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
          throw new Error("User not found");
        }

        const cart = await cartRepository.findOne({
          where: { user: { id: userId } },
          relations: {
            items: {
              course: true,
            },
          },
        });

        if (!cart || cart.items.length === 0) {
          throw new Error("Cart is empty");
        }

        const totalAmount = cart.items.reduce((total, item) => {
          return total + Number(item.unitPrice) * item.quantity;
        }, 0);

        const order = orderRepository.create({
          user,
          status: OrderStatus.PENDING,
          totalAmount,
          paymentMethod: "mock",
        });

        const savedOrder = await orderRepository.save(order);

        const orderDetails = cart.items.map((item) =>
          orderDetailRepository.create({
            order: savedOrder,
            course: item.course,
            unitPrice: Number(item.unitPrice),
            discountAmount: 0,
            finalPrice: Number(item.unitPrice) * item.quantity,
          }),
        );

        await orderDetailRepository.save(orderDetails);

        const hydratedOrder = await orderRepository.findOne({
          where: { id: savedOrder.id },
          relations: {
            user: true,
            details: {
              course: {
                tags: true,
                category: true,
              },
            },
          },
        });

        if (!hydratedOrder) {
          throw new Error("Failed to load order");
        }

        return hydratedOrder;
      },
    );

    return pendingOrder;
  }

  async confirmPayment(userId: number, orderId: number): Promise<Order> {
    const paidOrder = await AppDataSource.manager.transaction(
      async (manager) => {
        const userRepository = manager.getRepository(User);
        const cartRepository = manager.getRepository(Cart);
        const orderRepository = manager.getRepository(Order);
        const enrollmentRepository = manager.getRepository(Enrollment);

        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
          throw new Error("User not found");
        }

        const order = await orderRepository.findOne({
          where: {
            id: orderId,
            user: { id: userId },
          },
          relations: {
            details: {
              course: {
                tags: true,
                category: true,
              },
            },
            user: true,
          },
        });

        if (!order) {
          throw new Error("Order not found");
        }

        if (order.status === OrderStatus.COMPLETED) {
          return order;
        }

        if (order.status !== OrderStatus.PENDING) {
          throw new Error("Order is not in pending state");
        }

        const paymentSuccess = await this.paymentContext.pay(
          Number(order.totalAmount),
        );

        if (!paymentSuccess) {
          throw new Error("Payment failed");
        }

        const courseIds = order.details.map((detail) => detail.course.id);
        const existingEnrollments = await enrollmentRepository.find({
          where: {
            user: { id: userId },
            course: { id: In(courseIds) },
          },
          relations: {
            course: true,
          },
        });

        const existingCourseIdSet = new Set(
          existingEnrollments.map((enrollment) => enrollment.course.id),
        );

        const newEnrollments = order.details
          .filter((detail) => !existingCourseIdSet.has(detail.course.id))
          .map((detail) =>
            enrollmentRepository.create({
              user,
              course: detail.course,
              progressPercent: 0,
            }),
          );

        if (newEnrollments.length > 0) {
          await enrollmentRepository.save(newEnrollments);
        }

        const userCart = await cartRepository.findOne({
          where: { user: { id: userId } },
        });

        if (userCart && courseIds.length > 0) {
          await manager
            .createQueryBuilder()
            .delete()
            .from("cart_items")
            .where("cartId = :cartId", { cartId: userCart.id })
            .andWhere("courseId IN (:...courseIds)", { courseIds })
            .execute();
        }

        order.status = OrderStatus.COMPLETED;
        order.paidAt = new Date();
        await orderRepository.save(order);

        const hydratedOrder = await orderRepository.findOne({
          where: { id: order.id },
          relations: {
            user: true,
            details: {
              course: {
                tags: true,
                category: true,
              },
            },
          },
        });

        if (!hydratedOrder) {
          throw new Error("Failed to load order");
        }

        return hydratedOrder;
      },
    );

    return paidOrder;
  }
}

export const orderService = new OrderService();
