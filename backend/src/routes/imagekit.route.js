import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { getImageKitAuth } from "../controllers/imagekit.controller.js";

const router = Router();

router.use(verifyToken);

router.route("/auth").get(getImageKitAuth);

export default router;