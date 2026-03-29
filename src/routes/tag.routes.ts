import { Router } from "express";
import { tagController } from "../controllers/TagController";

const tagRoutes = Router();

tagRoutes.get("/", tagController.getAll);

export default tagRoutes;
