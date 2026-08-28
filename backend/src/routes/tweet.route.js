import { Router } from "express";
import { verifyToken, verifyUser } from "../middlewares/auth.middleware.js";
import { addTweetToUserBookmark, createATweet, deleteATweet, editATweet, getATweet, getUserFeed, getUserTweets, toggleRetweet } from "../controllers/tweet.controller.js";

const router = Router();

router.use(verifyToken);

router.route("/").post(verifyUser, createATweet)

router.route("/:tweetId").get(getATweet)
router.route("/delete/:tweetId").delete(verifyUser, deleteATweet);
router.route("/edit/:tweetId").patch(verifyUser, editATweet);
router.route("/bookmark/:tweetId").get(addTweetToUserBookmark);
router.route("/retweet/:tweetId").get(verifyUser, toggleRetweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/feed/for-you").get(getUserFeed);

export default router;