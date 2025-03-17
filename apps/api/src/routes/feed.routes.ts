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
  likeBadgeNotification,
  dislikeBadgeNotification,
  removeBadgeNotificationReaction,
  getBadgeNotificationComments,
  addBadgeNotificationComment,
  deleteBadgeNotificationComment,
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

router.post(
  "/badges/:badgeNotificationId/like",
  authenticateToken,
  likeBadgeNotification
);
router.post(
  "/badges/:badgeNotificationId/dislike",
  authenticateToken,
  dislikeBadgeNotification
);
router.delete(
  "/badges/:badgeNotificationId/reaction",
  authenticateToken,
  removeBadgeNotificationReaction
);
router.get(
  "/badges/:badgeNotificationId/comments",
  authenticateToken,
  getBadgeNotificationComments
);
router.post(
  "/badges/:badgeNotificationId/comments",
  authenticateToken,
  addBadgeNotificationComment
);
router.delete(
  "/badges/:badgeNotificationId/comments/:commentId",
  authenticateToken,
  deleteBadgeNotificationComment
);

export default router;
