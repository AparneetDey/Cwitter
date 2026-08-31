import {Router} from "express";
import {verifyToken, verifyUser} from "../middlewares/auth.middleware.js"
import { addAMedia, deleteAMedia, getUserMedia } from "../controllers/media.controller.js";

const router = Router();

router.use(verifyToken);

router.route("/add/:tweetId").post(verifyUser, addAMedia);
router.route("/delete/media/:mediaId").delete(verifyUser, deleteAMedia);
router.route("/user/:userId").get(getUserMedia)

export default router;