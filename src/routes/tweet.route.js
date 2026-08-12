import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { createATweet, deleteATweet, editATweet, getATweet } from "../controllers/tweet.controller.js";

const router = Router();

router.use(verifyToken);

router.route("/")
.post(createATweet)

router.route("/:tweetId").get(getATweet)
router.route("/delete/:tweetId").delete(deleteATweet);
router.route("/edit/:tweetId").patch(editATweet);

export default router;