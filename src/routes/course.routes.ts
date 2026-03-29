import { Router } from "express";
import { courseController } from "../controllers/CourseController";

const courseRoutes = Router();

// Public endpoints for home and course detail screens.
courseRoutes.get("/", courseController.getAll);
courseRoutes.get("/:id", courseController.getById);
courseRoutes.post("/", courseController.create);

export default courseRoutes;
