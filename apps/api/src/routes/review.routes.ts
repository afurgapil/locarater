import { Router } from "express";
import {
  addReview,
  updateReview,
  deleteReview,
  getReviews,
  getReviewsByUser,
  reportReview,
} from "../controllers/review.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/locations/:locationId/reviews", getReviews);
router.get("/users/:userId/reviews", getReviewsByUser);

// Protected routes
router.post("/locations/:locationId/reviews", authenticateToken, addReview);
router.put(
  "/locations/:locationId/reviews/:reviewId",
  authenticateToken,
  updateReview
);
router.delete(
  "/locations/:locationId/reviews/:reviewId",
  authenticateToken,
  deleteReview
);
router.post(
  "/locations/:locationId/reviews/:reviewId/report",
  authenticateToken,
  reportReview
);

export default router;
