import { Router } from "express";
import {
  register,
  login,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  validateResetToken,
  resetPassword,
  refreshToken,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:token", validateResetToken);
router.post("/reset-password", resetPassword);

export default router;
