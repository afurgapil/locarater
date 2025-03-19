"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { notificationService } from "@/services/notification.service";
import NotificationsList from "./NotificationsList";

export default function NotificationButton() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const result = await notificationService.getNotifications({
        limit: 1,
        isRead: false,
      });
      setUnreadCount(result.unreadCount);
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  const handleUpdateUnreadCount = (newCount: number) => {
    setUnreadCount(newCount);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Bildirimler"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-4 sm:w-96 md:w-[450px]">
        <NotificationsList
          onClose={() => setOpen(false)}
          onUpdateUnreadCount={handleUpdateUnreadCount}
        />
      </PopoverContent>
    </Popover>
  );
}
