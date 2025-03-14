import { Router } from "express";
import {
  addReview,
  updateReview,
  deleteReview,
  getReviews,
  getReviewsByUser,
  reportReview,
  getAllReviews,
} from "../controllers/review.controller";
import { authenticateToken, checkRole } from "../middleware/auth.middleware";
import imageUpload from "../utils/imageUpload";
const router = Router();
// Public routes
router.get("/:locationId", getReviews);

// Admin routes
router.get("/", authenticateToken, checkRole(["ADMIN"]), getAllReviews);

// Protected routes
router.post("/user", authenticateToken, getReviewsByUser);
router.post(
  "/:locationId",
  authenticateToken,
  imageUpload("reviews"),
  addReview
);
router.put(
  "/:locationId/:reviewId",
  authenticateToken,
  imageUpload("reviews"),
  updateReview
);
router.delete("/:locationId/:reviewId", authenticateToken, deleteReview);
router.post("/:locationId/:reviewId/report", authenticateToken, reportReview);

export default router;
