import express from "express";
import {
  getDashboardStats,
  getUserStats,
} from "../controllers/statistics.controller";

const router = express.Router();

router.get("/dashboard", getDashboardStats);
router.get("/user", getUserStats);

export default router;
