import {Router} from "express";
import {verifyToken} from "../middlewares/auth.middleware.js";
import { toggleTweetLike } from "../controllers/like.controller.js";

const router = Router();

router.use(verifyToken)

router.route("/tweet/:tweetId").put(toggleTweetLike);

export default router;