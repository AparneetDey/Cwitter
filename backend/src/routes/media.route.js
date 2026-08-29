import {Router} from "express";
import {verifyToken, verifyUser} from "../middlewares/auth.middleware.js"
import { addAMedia, deleteAMedia, getUserMedia } from "../controllers/media.controller.js";

const router = Router();

router.use(verifyToken);
router.use(verifyUser);

router.route("/add/:tweetId").post(addAMedia);
router.route("/delete/media/:mediaId").delete(deleteAMedia);
router.route("/user/:userId").get(getUserMedia)

export default router;