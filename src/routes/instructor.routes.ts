import { Router } from "express";
import { courseController } from "../controllers/CourseController";
import { lectureController } from "../controllers/LectureController";
import { questionController } from "../controllers/QuestionController";
import { quizController } from "../controllers/QuizController";
import { reviewController } from "../controllers/ReviewController";
import { sectionController } from "../controllers/SectionController";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const instructorRoutes = Router();

instructorRoutes.use(authMiddleware);
instructorRoutes.use(requireRole(["instructor", "admin"]));
instructorRoutes.get(
  "/courses/my-courses",
  courseController.getMyCoursesForInstructor,
);
instructorRoutes.put(
  "/courses/:courseId",
  courseController.updateForInstructor,
);
instructorRoutes.delete(
  "/courses/:courseId",
  courseController.deletePendingCourse,
);
instructorRoutes.get(
  "/courses/:courseId/students",
  courseController.getStudentsForInstructor,
);
instructorRoutes.get(
  "/courses/:courseId/detail",
  courseController.getDetailForInstructor,
);
instructorRoutes.post("/courses/:courseId/sections", sectionController.create);
instructorRoutes.get(
  "/courses/:courseId/sections",
  sectionController.getByCourse,
);
instructorRoutes.put("/sections/:sectionId", sectionController.update);
instructorRoutes.delete("/sections/:sectionId", sectionController.delete);
instructorRoutes.post(
  "/sections/:sectionId/lectures",
  lectureController.create,
);
instructorRoutes.get(
  "/sections/:sectionId/lectures",
  lectureController.getBySection,
);
instructorRoutes.post(
  "/sections/:sectionId/quizzes",
  quizController.createQuizForInstructor,
);
instructorRoutes.get(
  "/sections/:sectionId/quizzes",
  quizController.getQuizzesBySectionForInstructor,
);
instructorRoutes.put("/lectures/:lectureId", lectureController.update);
instructorRoutes.delete("/lectures/:lectureId", lectureController.delete);
instructorRoutes.put(
  "/quizzes/:quizId",
  quizController.updateQuizForInstructor,
);
instructorRoutes.delete(
  "/quizzes/:quizId",
  quizController.deleteQuizForInstructor,
);
instructorRoutes.post(
  "/quizzes/:quizId/questions",
  questionController.createQuestionForInstructor,
);
instructorRoutes.get(
  "/quizzes/:quizId/questions",
  questionController.getQuestionsByQuizForInstructor,
);
instructorRoutes.put(
  "/questions/:questionId",
  questionController.updateQuestionForInstructor,
);
instructorRoutes.delete(
  "/questions/:questionId",
  questionController.deleteQuestionForInstructor,
);
instructorRoutes.patch(
  "/reviews/:reviewId/reply",
  reviewController.replyToReview,
);

export default instructorRoutes;
