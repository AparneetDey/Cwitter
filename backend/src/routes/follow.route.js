import {Router} from "express";
import { toggleFollow } from "../controllers/follow.controller.js";
import {verifyToken} from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyToken);

router.route("/:followingId").get(toggleFollow);

export default router;