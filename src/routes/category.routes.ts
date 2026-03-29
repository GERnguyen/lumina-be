import { Router } from "express";
import { categoryController } from "../controllers/CategoryController";

const categoryRoutes = Router();

categoryRoutes.get("/", categoryController.getAll);
categoryRoutes.post("/", categoryController.create);

export default categoryRoutes;
