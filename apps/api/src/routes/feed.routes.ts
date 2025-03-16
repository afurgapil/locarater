import express from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import {
  getFeed,
  likeReview,
  dislikeReview,
  removeReaction,
  getReviewComments,
  addComment,
  deleteComment,
} from "../controllers/feed.controller";

const router = express.Router();

router.get("/", authenticateToken, getFeed);
router.post("/reviews/:reviewId/like", authenticateToken, likeReview);
router.post("/reviews/:reviewId/dislike", authenticateToken, dislikeReview);
router.delete("/reviews/:reviewId/reaction", authenticateToken, removeReaction);
router.get("/reviews/:reviewId/comments", authenticateToken, getReviewComments);
router.post("/reviews/:reviewId/comments", authenticateToken, addComment);
router.delete(
  "/reviews/:reviewId/comments/:commentId",
  authenticateToken,
  deleteComment
);

export default router;
