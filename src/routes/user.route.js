import { Router } from "express";
import { getCurrentUser, logInUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(logInUser);
router.route("/logout").get(verifyToken, logoutUser);
router.route("/current-user").get(getCurrentUser);

export default router;