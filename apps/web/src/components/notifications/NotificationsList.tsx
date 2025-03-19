"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Notification as INotification,
  notificationService,
} from "@/services/notification.service";
import { useToast } from "@/hooks/useToast";
import {
  Loader2,
  Bell,
  CheckCircle,
  AlertCircle,
  Flag,
  Award,
  Heart,
  UserPlus,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NotificationsListProps {
  onClose?: () => void;
  onUpdateUnreadCount?: (count: number) => void;
}

export default function NotificationsList({
  onClose,
  onUpdateUnreadCount,
}: NotificationsListProps) {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const { showToast } = useToast();

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const result = await notificationService.getNotifications({
        isRead: activeTab === "unread" ? false : undefined,
      });
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      showToast("Bildirimler yüklenirken bir hata oluştu", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      const newUnreadCount = unreadCount - 1;
      setUnreadCount(newUnreadCount);
      onUpdateUnreadCount?.(newUnreadCount);

      if (onClose && activeTab === "unread" && unreadCount === 1) {
        onClose();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      showToast("Bildirim okundu olarak işaretlenirken hata oluştu", "error");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      onUpdateUnreadCount?.(0);
      showToast("Tüm bildirimler okundu olarak işaretlendi", "success");

      if (onClose && activeTab === "unread") {
        onClose();
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      showToast(
        "Bildirimler okundu olarak işaretlenirken hata oluştu",
        "error"
      );
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      const newUnreadCount =
        unreadCount -
        (notifications.find((n) => n._id === notificationId && !n.isRead)
          ? 1
          : 0);
      setUnreadCount(newUnreadCount);
      onUpdateUnreadCount?.(newUnreadCount);
      showToast("Bildirim silindi", "success");

      if (onClose && notifications.length === 1) {
        onClose();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      showToast("Bildirim silinirken hata oluştu", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex h-48 w-full flex-col items-center justify-center space-y-2 text-center">
        <Bell className="h-8 w-8 text-gray-400" />
        <p className="text-gray-500">
          {activeTab === "all"
            ? "Henüz bildiriminiz bulunmuyor"
            : "Okunmamış bildiriminiz bulunmuyor"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Bildirimler</h2>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-xs"
          >
            Tümünü Okundu İşaretle
          </Button>
        )}
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "all" | "unread")}
        className="w-full"
      >
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="all">Tümü</TabsTrigger>
          <TabsTrigger value="unread">
            Okunmamış {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-2">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDeleteNotification}
            />
          ))}
        </TabsContent>

        <TabsContent value="unread" className="space-y-2">
          {notifications
            .filter((n) => !n.isRead)
            .map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDeleteNotification}
              />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface NotificationItemProps {
  notification: INotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "REPORT_CREATED":
        return <Flag className="h-5 w-5 text-red-500" />;
      case "REPORT_RESOLVED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "REPORT_REJECTED":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "BADGE_EARNED":
        return <Award className="h-5 w-5 text-purple-500" />;
      case "REVIEW_LIKED":
        return <Heart className="h-5 w-5 text-pink-500" />;
      case "NEW_FOLLOWER":
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card
      className={`relative mb-2 w-full overflow-hidden p-4 transition-colors ${
        !notification.isRead ? "bg-gray-50 dark:bg-gray-900" : ""
      }`}
    >
      {!notification.isRead && (
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500"></span>
      )}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1">
          <div className="mb-1 flex items-start justify-between">
            <h3 className="font-medium">{notification.title}</h3>
            <span className="text-xs text-gray-500">
              {format(new Date(notification.createdAt), "d MMM, HH:mm", {
                locale: tr,
              })}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {notification.message}
          </p>
          <div className="mt-2 flex justify-end gap-2">
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(notification._id)}
                className="h-8 text-xs"
              >
                Okundu İşaretle
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(notification._id)}
              className="h-8 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
            >
              <Trash className="mr-1 h-3 w-3" />
              Sil
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
