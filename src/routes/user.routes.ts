import { Router } from "express";
import { profileController } from "../controllers/ProfileController";
import { authMiddleware } from "../middlewares/auth.middleware";

const userRoutes = Router();

userRoutes.use(authMiddleware);
userRoutes.get("/me", profileController.me);
userRoutes.put("/profile", profileController.updateProfile);
userRoutes.post("/send-update-otp", profileController.sendUpdateOtp);
userRoutes.put("/update-sensitive", profileController.updateSensitive);

export default userRoutes;
