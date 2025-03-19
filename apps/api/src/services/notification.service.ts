import { Notification, NotificationType } from "../models/notification.model";
import { Types } from "mongoose";

class NotificationService {
  async createNotification({
    userId,
    type,
    title,
    message,
    relatedId,
    data,
  }: {
    userId: string | Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    relatedId?: string;
    data?: Record<string, any>;
  }) {
    return await Notification.create({
      userId,
      type,
      title,
      message,
      relatedId,
      data,
    });
  }

  async sendReportCreatedNotification({
    reviewUserId,
    reportId,
    locationName,
    reporterName,
    reportCategory,
  }: {
    reviewUserId: string | Types.ObjectId;
    reportId: string;
    locationName: string;
    reporterName: string;
    reportCategory: string;
  }) {
    const categoryMap: Record<string, string> = {
      SPAM: "spam içerik",
      INAPPROPRIATE_CONTENT: "uygunsuz içerik",
      FALSE_INFORMATION: "yanlış bilgi",
      HARASSMENT: "taciz/hakaret",
      OTHER: "diğer nedenlerle",
    };

    const categoryText = categoryMap[reportCategory] || "bir nedenden dolayı";

    return await this.createNotification({
      userId: reviewUserId,
      type: NotificationType.REPORT_CREATED,
      title: "Değerlendirmeniz Rapor Edildi",
      message: `"${locationName}" için yaptığınız değerlendirme ${reporterName} tarafından ${categoryText} rapor edildi.`,
      relatedId: reportId,
      data: {
        locationName,
        reporterName,
        reportCategory,
      },
    });
  }

  async sendReportResolvedNotification({
    reporterId,
    reportId,
    locationName,
    result,
    notes,
  }: {
    reporterId: string | Types.ObjectId;
    reportId: string;
    locationName: string;
    result?: string;
    notes?: string;
  }) {
    const resultMap: Record<string, string> = {
      REMOVED: "içerik kaldırıldı",
      WARNING_ISSUED: "kullanıcı uyarıldı",
      NO_ACTION: "işlem yapılmadı",
      FALSE_REPORT: "yanlış rapor",
    };

    const resultText = result ? ` (${resultMap[result] || result})` : "";

    return await this.createNotification({
      userId: reporterId,
      type: NotificationType.REPORT_RESOLVED,
      title: "Raporunuz Çözüldü",
      message: `"${locationName}" için gönderdiğiniz rapor çözüldü${resultText}.${
        notes ? ` Not: ${notes}` : ""
      }`,
      relatedId: reportId,
      data: {
        locationName,
        result,
        notes,
      },
    });
  }

  async sendReportRejectedNotification({
    reporterId,
    reportId,
    locationName,
    notes,
  }: {
    reporterId: string | Types.ObjectId;
    reportId: string;
    locationName: string;
    notes?: string;
  }) {
    return await this.createNotification({
      userId: reporterId,
      type: NotificationType.REPORT_REJECTED,
      title: "Raporunuz Reddedildi",
      message: `"${locationName}" için gönderdiğiniz rapor reddedildi.${
        notes ? ` Not: ${notes}` : ""
      }`,
      relatedId: reportId,
      data: {
        locationName,
        notes,
      },
    });
  }

  async getUserNotifications(
    userId: string | Types.ObjectId,
    options?: {
      limit?: number;
      offset?: number;
      isRead?: boolean;
    }
  ) {
    const { limit = 50, offset = 0, isRead } = options || {};

    const query: any = { userId };
    if (isRead !== undefined) {
      query.isRead = isRead;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    const count = await Notification.countDocuments(query);

    return {
      notifications,
      count,
      unreadCount: await Notification.countDocuments({ userId, isRead: false }),
    };
  }

  async markAsRead(notificationId: string | Types.ObjectId) {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId: string | Types.ObjectId) {
    return await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
  }

  async deleteNotification(notificationId: string | Types.ObjectId) {
    return await Notification.findByIdAndDelete(notificationId);
  }

  async deleteAllNotifications(userId: string | Types.ObjectId) {
    return await Notification.deleteMany({ userId });
  }
}

export const notificationService = new NotificationService();
