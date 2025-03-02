import { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteAccount,
  forgotPassword,
  resetPassword,
} from "../controllers/user.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/profile", authenticateToken, getUserProfile);
router.get("/profile/:userId", authenticateToken, getUserProfile);
router.put("/profile", authenticateToken, updateUserProfile);
router.post("/change-password", authenticateToken, changePassword);
router.delete("/account", authenticateToken, deleteAccount);

export default router;
