import {Router} from "express";
import { getUserFollowers, getUserFollowings, toggleFollow } from "../controllers/follow.controller.js";
import {verifyToken} from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyToken);

router.route("/:followingId").put(toggleFollow);
router.route("/followers/:userId").get(getUserFollowers);
router.route("/followings/:userId").get(getUserFollowings);

export default router;