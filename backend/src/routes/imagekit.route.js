import { Router } from "express";
import {verifyToken} from "../middlewares/auth.middleware.js"
import { getImageKitAuth } from "../controllers/imageKit.controller.js";

const router = Router();

router.use(verifyToken);

router.route("/").get(getImageKitAuth);

export default router