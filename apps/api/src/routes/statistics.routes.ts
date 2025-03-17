import { Router } from "express";
import {
  getDashboardStats,
  getUserStats,
  getPublicProfileStats,
} from "../controllers/statistics.controller";
import { authenticateToken } from "../middleware/auth.middleware";
const router = Router();

router.get("/public-profile-stats/:username", getPublicProfileStats);

router.get("/dashboard", authenticateToken, getDashboardStats);
router.get("/user", authenticateToken, getUserStats);

export default router;
