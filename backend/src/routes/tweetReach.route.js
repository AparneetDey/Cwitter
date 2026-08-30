import {Router} from "express";
import { recordTweetReach } from "../controllers/tweetReach.controller.js";
import {verifyToken} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyToken);

router.route("/:tweetId").put(recordTweetReach);

export default router;