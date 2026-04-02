import { In } from "typeorm";
import { AppDataSource } from "../data-source";
import { Cart } from "../entities/Cart";
import { Course } from "../entities/Course";
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
  private expirationWorkerStarted = false;

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

  async checkout(userId: number, useRewardPoints = false): Promise<Order> {
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

        const existingPendingOrder = await orderRepository.findOne({
          where: {
            user: { id: userId },
            status: OrderStatus.PENDING,
          },
        });

        if (existingPendingOrder) {
          throw new Error(
            "Ban dang co mot don hang cho thanh toan. Vui long hoan tat hoac huy don hang do truoc khi tao don moi.",
          );
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

        let discountAmount = 0;
        let finalAmount = totalAmount;

        if (useRewardPoints && (user.rewardPoints ?? 0) > 0) {
          const availablePoints = user.rewardPoints ?? 0;
          const maxUsablePoints = Math.floor(totalAmount / 1000);
          const usedPoints = Math.min(availablePoints, maxUsablePoints);

          discountAmount = usedPoints * 1000;
          finalAmount = Math.max(totalAmount - discountAmount, 0);
          user.rewardPoints = availablePoints - usedPoints;
          await userRepository.save(user);
        }

        const order = orderRepository.create({
          user,
          status: OrderStatus.PENDING,
          totalAmount: finalAmount,
          discountAmount,
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

  async confirmPayment(
    userId: number,
    orderId: number,
    useRewardPoints = false,
  ): Promise<Order> {
    try {
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

          if (useRewardPoints && Number(order.discountAmount ?? 0) <= 0) {
            const payableBeforeDiscount = Number(order.totalAmount);
            const availablePoints = user.rewardPoints ?? 0;
            const maxUsablePoints = Math.floor(payableBeforeDiscount / 1000);
            const usedPoints = Math.min(availablePoints, maxUsablePoints);

            const appliedDiscount = usedPoints * 1000;
            order.discountAmount = appliedDiscount;
            order.totalAmount = Math.max(
              payableBeforeDiscount - appliedDiscount,
              0,
            );

            if (usedPoints > 0) {
              user.rewardPoints = availablePoints - usedPoints;
              await userRepository.save(user);
            }
          }

          const finalPrice = Number(order.totalAmount);

          let paymentSuccess = false;
          try {
            paymentSuccess = await this.paymentContext.pay(finalPrice);
          } catch (_error) {
            throw new Error("Payment failed");
          }

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

            const newEnrollmentCourseIds = newEnrollments.map(
              (enrollment) => enrollment.course.id,
            );

            await manager
              .createQueryBuilder()
              .update(Course)
              .set({
                enrollmentCount: () => "enrollment_count + 1",
              })
              .where("id IN (:...courseIds)", {
                courseIds: newEnrollmentCourseIds,
              })
              .execute();
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
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Confirm payment failed";

      if (message === "Payment failed") {
        await this.markOrderFailed(userId, orderId);
      }

      throw error;
    }
  }

  async cancelOrder(userId: number, orderId: number): Promise<Order> {
    const orderRepository = AppDataSource.getRepository(Order);

    const order = await orderRepository.findOne({
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

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new Error("Only pending orders can be cancelled");
    }

    order.status = OrderStatus.CANCELLED;
    await orderRepository.save(order);

    return order;
  }

  startPendingOrderExpirationWorker(): void {
    if (this.expirationWorkerStarted) {
      return;
    }

    this.expirationWorkerStarted = true;

    const intervalMs = Number(process.env.ORDER_EXPIRATION_CHECK_MS) || 60_000;
    setInterval(() => {
      void this.expirePendingOrders().catch((error) => {
        console.error("Pending order expiration job failed:", error);
      });
    }, intervalMs);
  }

  async expirePendingOrders(): Promise<number> {
    const ttlMinutes = Number(process.env.ORDER_PENDING_TTL_MINUTES) || 30;
    const expiredBefore = new Date(Date.now() - ttlMinutes * 60 * 1000);

    const result = await AppDataSource.getRepository(Order)
      .createQueryBuilder()
      .update(Order)
      .set({ status: OrderStatus.EXPIRED })
      .where("status = :status", { status: OrderStatus.PENDING })
      .andWhere("created_at <= :expiredBefore", { expiredBefore })
      .execute();

    return result.affected ?? 0;
  }

  private async markOrderFailed(
    userId: number,
    orderId: number,
  ): Promise<void> {
    await AppDataSource.getRepository(Order)
      .createQueryBuilder()
      .update(Order)
      .set({ status: OrderStatus.FAILED })
      .where("id = :orderId", { orderId })
      .andWhere("userId = :userId", { userId })
      .andWhere("status = :pending", { pending: OrderStatus.PENDING })
      .execute();
  }
}

export const orderService = new OrderService();
