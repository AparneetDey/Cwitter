import {Router} from "express";
import {verifyToken} from "../middlewares/auth.middleware.js";
import { getUserLikedTweets, toggleTweetLike } from "../controllers/like.controller.js";

const router = Router();

router.use(verifyToken)

router.route("/tweet/:tweetId").put(toggleTweetLike);
router.route("/user/:userId").get(getUserLikedTweets);

export default router;