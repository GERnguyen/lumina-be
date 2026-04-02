import { AppDataSource } from "../data-source";
import { Cart } from "../entities/Cart";
import { CartItem } from "../entities/CartItem";
import { Course } from "../entities/Course";
import { Enrollment } from "../entities/Enrollment";
import { User } from "../entities/User";

export interface AddToCartInput {
  courseId: number;
}

export class CartService {
  async getCart(userId: number): Promise<Cart> {
    const userRepository = AppDataSource.getRepository(User);
    const cartRepository = AppDataSource.getRepository(Cart);

    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error("User not found");
    }

    let cart = await cartRepository.findOne({
      where: { user: { id: userId } },
      relations: {
        items: {
          course: {
            category: true,
            instructor: {
              profile: true,
            },
            tags: true,
          },
        },
      },
      order: {
        items: {
          createdAt: "DESC",
        },
      },
    });

    if (!cart) {
      cart = cartRepository.create({ user });
      await cartRepository.save(cart);

      cart = await cartRepository.findOne({
        where: { id: cart.id },
        relations: {
          items: {
            course: {
              category: true,
              instructor: {
                profile: true,
              },
              tags: true,
            },
          },
        },
      });
    }

    if (!cart) {
      throw new Error("Failed to initialize cart");
    }

    return cart;
  }

  async addToCart(userId: number, input: AddToCartInput): Promise<Cart> {
    const enrollmentRepository = AppDataSource.getRepository(Enrollment);
    const courseRepository = AppDataSource.getRepository(Course);
    const cartRepository = AppDataSource.getRepository(Cart);
    const cartItemRepository = AppDataSource.getRepository(CartItem);

    const existingEnrollment = await enrollmentRepository.findOne({
      where: {
        user: { id: userId },
        course: { id: input.courseId },
      },
    });

    if (existingEnrollment) {
      throw new Error("You already purchased this course");
    }

    const course = await courseRepository.findOne({
      where: { id: input.courseId },
      relations: {
        tags: true,
      },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    if (!course.isActive) {
      throw new Error("Course is not available");
    }

    const cart = await this.getCart(userId);

    const existingCartItem = await cartItemRepository.findOne({
      where: {
        cart: { id: cart.id },
        course: { id: input.courseId },
      },
    });

    if (existingCartItem) {
      throw new Error("Course already exists in cart");
    }

    const cartItem = cartItemRepository.create({
      cart,
      course,
      unitPrice: Number(course.price),
      quantity: 1,
    });

    await cartItemRepository.save(cartItem);

    const refreshedCart = await cartRepository.findOne({
      where: { id: cart.id },
      relations: {
        items: {
          course: {
            category: true,
            instructor: {
              profile: true,
            },
            tags: true,
          },
        },
      },
      order: {
        items: {
          createdAt: "DESC",
        },
      },
    });

    if (!refreshedCart) {
      throw new Error("Failed to load cart");
    }

    return refreshedCart;
  }

  async removeFromCart(userId: number, courseId: number): Promise<void> {
    const userRepository = AppDataSource.getRepository(User);
    const cartRepository = AppDataSource.getRepository(Cart);
    const cartItemRepository = AppDataSource.getRepository(CartItem);

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    const cart = await cartRepository.findOne({
      where: { user: { id: userId } },
      select: {
        id: true,
      },
    });

    if (!cart) {
      return;
    }

    await cartItemRepository.delete({
      cart: { id: cart.id },
      course: { id: courseId },
    });
  }
}

export const cartService = new CartService();
