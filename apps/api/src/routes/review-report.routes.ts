import { Router } from "express";
import {
  createReviewReport,
  getAllReports,
  updateReportStatus,
  getUserReports,
} from "../controllers/review-report.controller";
import { authenticateToken, checkRole } from "../middleware/auth.middleware";

const router = Router();
//public routes
router.post("/", authenticateToken, createReviewReport);
router.get("/user", authenticateToken, getUserReports);

//admin routes
router.get("/", authenticateToken, checkRole(["ADMIN"]), getAllReports);
router.put(
  "/:reportId/status",
  authenticateToken,
  checkRole(["ADMIN"]),
  updateReportStatus
);

export default router;
