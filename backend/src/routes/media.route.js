import {Router} from "express";
import {verifyToken, verifyUser} from "../middlewares/auth.middleware.js"
import { addAMedia, deleteAMedia } from "../controllers/media.controller.js";
import { deleteATweet } from "../controllers/tweet.controller";
const router = Router();

router.use(verifyToken);
router.use(verifyUser);

router.route("/add/:tweetId").post(addAMedia);
router.route("/delete/media/:mediaId").delete(deleteAMedia);
router.route("/delete/tweet/:tweetId").delete(deleteATweet);