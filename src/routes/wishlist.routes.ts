import { Router } from "express";
import { wishlistController } from "../controllers/WishlistController";
import { authMiddleware } from "../middlewares/auth.middleware";

const wishlistRoutes = Router();

wishlistRoutes.use(authMiddleware);
wishlistRoutes.post("/toggle", wishlistController.toggle);
wishlistRoutes.get("/", wishlistController.getWishlist);

export default wishlistRoutes;
