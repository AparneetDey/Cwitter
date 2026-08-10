import { Router } from "express";
import { getCurrentUser, logInUser, logOutUser, refreshAccessToken, registerUser, updateUserAvatar } from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(logInUser);
router.route("/logout").get(verifyToken, logOutUser);
router.route("/refresh-token").get(refreshAccessToken);
router.route("/current-user").get(verifyToken, getCurrentUser);
router.route("/update/avatar").patch(verifyToken, updateUserAvatar);

export default router;