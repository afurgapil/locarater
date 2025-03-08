import { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteAccount,
  updateUserRole,
  getUsers,
  forceDeleteUser,
  getUserByUsername,
} from "../controllers/user.controller";
import { authenticateToken, checkRole } from "../middleware/auth.middleware";

const router = Router();

// Protected routes
router.get("/profile/id/:userId", authenticateToken, getUserProfile);
router.put("/profile", authenticateToken, updateUserProfile);
router.get("/profile/username/:username", getUserByUsername);
router.post("/change-password", authenticateToken, changePassword);
router.delete("/account", authenticateToken, deleteAccount);

// Admin routes
router.post(
  "/update-role",
  authenticateToken,
  checkRole(["ADMIN"]),
  updateUserRole
);
router.get("/all", authenticateToken, checkRole(["ADMIN"]), getUsers);
router.delete(
  "/force-delete/:userId",
  authenticateToken,
  checkRole(["ADMIN"]),
  forceDeleteUser
);
export default router;
