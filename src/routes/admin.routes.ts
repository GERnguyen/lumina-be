import { Router } from "express";
import { courseController } from "../controllers/CourseController";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const adminRoutes = Router();

adminRoutes.use(authMiddleware);
adminRoutes.use(requireRole(["admin"]));

adminRoutes.get("/users", courseController.getUsersForAdmin);
adminRoutes.get("/courses/pending", courseController.getPendingCoursesForAdmin);
adminRoutes.delete("/courses/:courseId", courseController.deletePendingCourse);
adminRoutes.patch(
  "/courses/:courseId/approve",
  courseController.approveCourseForAdmin,
);

export default adminRoutes;
