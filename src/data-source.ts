import "reflect-metadata";
import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { Answer } from "./entities/Answer";
import { Cart } from "./entities/Cart";
import { CartItem } from "./entities/CartItem";
import { Category } from "./entities/Category";
import { Coupon } from "./entities/Coupon";
import { Course } from "./entities/Course";
import { Enrollment } from "./entities/Enrollment";
import { Lecture } from "./entities/Lecture";
import { OtpRecord } from "./entities/OtpRecord";
import { Order } from "./entities/Order";
import { OrderDetail } from "./entities/OrderDetail";
import { Profile } from "./entities/Profile";
import { Question } from "./entities/Question";
import { Quiz } from "./entities/Quiz";
import { Review } from "./entities/Review";
import { Section } from "./entities/Section";
import { Tag } from "./entities/Tag";
import { User } from "./entities/User";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "cinx_db",
  entities: [
    User,
    OtpRecord,
    Profile,
    Category,
    Course,
    Section,
    Lecture,
    Quiz,
    Question,
    Answer,
    Cart,
    CartItem,
    Order,
    OrderDetail,
    Coupon,
    Enrollment,
    Review,
    Tag,
  ],
  synchronize: true,
  logging: false,
});

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Initialize database connection once and retry while MySQL container is still booting.
export const initializeDatabase = async (): Promise<void> => {
  if (AppDataSource.isInitialized) {
    return;
  }

  const maxAttempts = 10;
  const retryDelayMs = 3000;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await AppDataSource.initialize();
      console.log("Database connected successfully.");
      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }

      console.warn(
        `Database connection attempt ${attempt}/${maxAttempts} failed. Retrying in ${
          retryDelayMs / 1000
        }s...`,
      );
      await sleep(retryDelayMs);
    }
  }
};
