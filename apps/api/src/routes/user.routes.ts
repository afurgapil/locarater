import { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteAccount,
  forgotPassword,
  updateUserRole,
} from "../controllers/user.controller";
import { authenticateToken, checkRole } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.post("/forgot-password", forgotPassword);

// Protected routes
router.get("/profile", authenticateToken, getUserProfile);
router.get("/profile/:userId", authenticateToken, getUserProfile);
router.put("/profile", authenticateToken, updateUserProfile);
router.post("/change-password", authenticateToken, changePassword);
router.delete("/account", authenticateToken, deleteAccount);

// Admin routes
router.post(
  "/update-role",
  authenticateToken,
  checkRole(["ADMIN"]),
  updateUserRole
);

export default router;
