import { Router } from "express";
import { changeUserPassword, getCurrentUser, getUserBookmarks, logInUser, logOutUser, refreshAccessToken, registerUser, updateUserAvatar, updateUserCoverImage, updateUserDetail } from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(logInUser);
router.route("/logout").get(verifyToken, logOutUser);
router.route("/refresh-token").get(refreshAccessToken);

router.route("/current-user").get(verifyToken, getCurrentUser);

router.route("/update/avatar").patch(verifyToken, updateUserAvatar);
router.route("/update/cover-image").patch(verifyToken, updateUserCoverImage);
router.route("/update/password").patch(verifyToken, changeUserPassword);
router.route("/update/details").patch(verifyToken, updateUserDetail);
router.route("/bookmarks").get(verifyToken, getUserBookmarks);

export default router;