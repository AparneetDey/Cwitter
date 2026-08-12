import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { createATweet, deleteATweet } from "../controllers/tweet.controller.js";

const router = Router();

router.route("/")
.post(verifyToken, createATweet)

router.route("/delete/:tweetId").delete(verifyToken, deleteATweet);

export default router;