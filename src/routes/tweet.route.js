import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { createATweet } from "../controllers/tweet.controller.js";

const router = Router();

router.route("/")
    .post(verifyToken, createATweet)

export default router;