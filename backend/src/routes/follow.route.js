import {Router} from "express";
import { getUserFollowers, toggleFollow } from "../controllers/follow.controller.js";
import {verifyToken} from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyToken);

router.route("/:followingId").get(toggleFollow);
router.route("/followers/:userId").get(getUserFollowers);

export default router;