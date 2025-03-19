import express from "express";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notification.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = express.Router();

router.use(authenticateToken);
router.get("/", getUserNotifications);
router.put("/read-all", markAllNotificationsAsRead);
router.put("/:notificationId/read", markNotificationAsRead);
router.delete("/:notificationId", deleteNotification);
router.delete("/", deleteAllNotifications);

export default router;
