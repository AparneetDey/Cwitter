import { Router } from "express";
import { changeUserPassword, checkUserVerificationCode, forgotPassword, getCurrentUser, getUserBookmarks, getUserDashboard, logInUser, logOutUser, refreshAccessToken, registerUser, startUserVerfication, updateUserAvatar, updateUserCoverImage, updateUserDetail } from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(logInUser);
router.route("/refresh-token").get(refreshAccessToken);

router.route("/forgot-password").post(forgotPassword);

// Protected routes
router.use(verifyToken);
router.route("/logout").delete(logOutUser);
router.route("/current-user").get(getCurrentUser);
router.route("/dashboard/:userId").get(getUserDashboard);

router.route("/update/avatar").patch(updateUserAvatar);
router.route("/update/cover-image").patch(updateUserCoverImage);
router.route("/update/password").patch(changeUserPassword);
router.route("/update/details").patch(updateUserDetail);
router.route("/bookmarks").get(getUserBookmarks);

router.route("/verify-start").get(startUserVerfication);
router.route("/verify-check").post(checkUserVerificationCode);


export default router;