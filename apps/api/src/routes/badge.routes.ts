import express from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import {
  getAllBadges,
  getUserBadges,
  checkAndUpdateBadges,
} from "../controllers/badge.controller";

const router = express.Router();

router.get("/", getAllBadges);

router.get("/user", authenticateToken, getUserBadges);
router.post("/check", authenticateToken, checkAndUpdateBadges);

export default router;
