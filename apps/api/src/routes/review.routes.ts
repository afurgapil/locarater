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

router.get("/:locationId", getReviews);
router.post("/user", authenticateToken, getReviewsByUser);
router.post("/:locationId", authenticateToken, addReview);
router.put("/:locationId/:reviewId", authenticateToken, updateReview);
router.delete("/:locationId/:reviewId", authenticateToken, deleteReview);
router.post("/:locationId/:reviewId/report", authenticateToken, reportReview);

export default router;
