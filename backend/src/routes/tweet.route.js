import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { addTweetToUserBookmark, createATweet, deleteATweet, editATweet, getATweet, getUserTweets } from "../controllers/tweet.controller.js";

const router = Router();

router.use(verifyToken);

router.route("/").post(createATweet)

router.route("/:tweetId").get(getATweet)
router.route("/delete/:tweetId").delete(deleteATweet);
router.route("/edit/:tweetId").patch(editATweet);
router.route("/bookmark/:tweetId").get(addTweetToUserBookmark);
router.route("/user/:userId").get(getUserTweets);

export default router;