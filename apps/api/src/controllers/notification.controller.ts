import { Request, Response } from "express";
import { AuthRequest } from "../types/auth";
import { notificationService } from "../services/notification.service";

export const getUserNotifications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Lütfen giriş yapın" });
    }

    const { limit, offset, isRead } = req.query;

    const result = await notificationService.getUserNotifications(
      req.user._id,
      {
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
        isRead: isRead !== undefined ? isRead === "true" : undefined,
      }
    );

    return res.json(result);
  } catch (error) {
    console.error("Error getting user notifications:", error);
    return res
      .status(500)
      .json({ message: "Bildirimler yüklenirken bir hata oluştu" });
  }
};

export const markNotificationAsRead = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Lütfen giriş yapın" });
    }

    const { notificationId } = req.params;

    const updatedNotification =
      await notificationService.markAsRead(notificationId);

    if (!updatedNotification) {
      return res.status(404).json({ message: "Bildirim bulunamadı" });
    }

    if (updatedNotification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
    }

    return res.json(updatedNotification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({
      message: "Bildirim okundu olarak işaretlenirken bir hata oluştu",
    });
  }
};

export const markAllNotificationsAsRead = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Lütfen giriş yapın" });
    }

    const result = await notificationService.markAllAsRead(req.user._id);

    return res.json({
      message: "Tüm bildirimler okundu olarak işaretlendi",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return res.status(500).json({
      message: "Bildirimler okundu olarak işaretlenirken bir hata oluştu",
    });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Lütfen giriş yapın" });
    }

    const { notificationId } = req.params;

    const notification = await notificationService.markAsRead(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Bildirim bulunamadı" });
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
    }

    await notificationService.deleteNotification(notificationId);

    return res.json({ message: "Bildirim başarıyla silindi" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res
      .status(500)
      .json({ message: "Bildirim silinirken bir hata oluştu" });
  }
};

export const deleteAllNotifications = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Lütfen giriş yapın" });
    }

    const result = await notificationService.deleteAllNotifications(
      req.user._id
    );

    return res.json({
      message: "Tüm bildirimler başarıyla silindi",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    return res
      .status(500)
      .json({ message: "Bildirimler silinirken bir hata oluştu" });
  }
};
