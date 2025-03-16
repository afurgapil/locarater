import { Router } from "express";
import {
  getDashboardStats,
  getUserStats,
  getPublicProfileStats,
} from "../controllers/statistics.controller";
import { authenticateToken } from "../middleware/auth.middleware";
const router = Router();

//Public routes
router.get("/public-profile-stats/:username", getPublicProfileStats);

// Protected routes
router.get("/dashboard", authenticateToken, getDashboardStats);
router.get("/user", authenticateToken, getUserStats);

export default router;
