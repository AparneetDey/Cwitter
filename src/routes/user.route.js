import { Router } from "express";
import { getCurrentUser, registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/current-user").get(getCurrentUser);

export default router;