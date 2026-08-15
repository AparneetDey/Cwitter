import { Router } from "express";
import { changeUserPassword, checkUserVerificationCode, getCurrentUser, getUserBookmarks, logInUser, logOutUser, refreshAccessToken, registerUser, startUserVerfication, updateUserAvatar, updateUserCoverImage, updateUserDetail } from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(logInUser);
router.route("/refresh-token").get(refreshAccessToken);


// Protected routes
router.use(verifyToken);
router.route("/logout").delete(logOutUser);
router.route("/current-user").get(getCurrentUser);

router.route("/update/avatar").patch(updateUserAvatar);
router.route("/update/cover-image").patch(updateUserCoverImage);
router.route("/update/password").patch(changeUserPassword);
router.route("/update/details").patch(updateUserDetail);
router.route("/bookmarks").get(getUserBookmarks);

router.route("/verify-start").get(startUserVerfication);
router.route("/verify-check").post(checkUserVerificationCode);

export default router;