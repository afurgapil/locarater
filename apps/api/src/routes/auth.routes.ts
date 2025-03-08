import { Router } from "express";
import {
  register,
  login,
  logout,
  verifyEmail,
  resendVerification,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerification);

export default router;
