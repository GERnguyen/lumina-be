import dotenv from "dotenv";
import cors from "cors";
import express, { Request, Response } from "express";
import { initializeDatabase } from "./data-source";
import adminRoutes from "./routes/admin.routes";
import authRoutes from "./routes/auth.routes";
import cartRoutes from "./routes/cart.routes";
import categoryRoutes from "./routes/category.routes";
import courseRoutes from "./routes/course.routes";
import instructorRoutes from "./routes/instructor.routes";
import learningRoutes from "./routes/learning.routes";
import orderRoutes from "./routes/order.routes";
import quizRoutes from "./routes/quiz.routes";
import reviewRoutes from "./routes/review.routes";
import tagRoutes from "./routes/tag.routes";
import userRoutes from "./routes/user.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import { orderService } from "./services/OrderService";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 9090;

app.use(cors());
app.use(express.json());
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/learning", quizRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wishlist", wishlistRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Cinx backend is running." });
});

const bootstrap = async (): Promise<void> => {
  try {
    await initializeDatabase();
    orderService.startPendingOrderExpirationWorker();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

void bootstrap();
