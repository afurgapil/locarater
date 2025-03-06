import { Router } from "express";
import {
  getDashboardStats,
  getUserStats,
} from "../controllers/statistics.controller";
import { authenticateToken } from "../middleware/auth.middleware";
const router = Router();

// Protected routes
router.get("/dashboard", authenticateToken, getDashboardStats);
router.get("/user", authenticateToken, getUserStats);

export default router;
