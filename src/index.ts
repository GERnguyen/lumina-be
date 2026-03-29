import dotenv from "dotenv";
import cors from "cors";
import express, { Request, Response } from "express";
import { initializeDatabase } from "./data-source";
import authRoutes from "./routes/auth.routes";
import cartRoutes from "./routes/cart.routes";
import categoryRoutes from "./routes/category.routes";
import courseRoutes from "./routes/course.routes";
import orderRoutes from "./routes/order.routes";
import tagRoutes from "./routes/tag.routes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 9090;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/tags", tagRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Cinx backend is running." });
});

const bootstrap = async (): Promise<void> => {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

void bootstrap();
