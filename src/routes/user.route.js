import { Router } from "express";
import { getCurrentUser, loginUser, registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/current-user").get(getCurrentUser);

export default router;