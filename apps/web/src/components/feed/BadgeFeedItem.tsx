import {
  FeedItem,
  BadgeFeedData,
  feedService,
  FeedComment,
} from "@/services/feed.service";
import Image from "next/image";
import Link from "next/link";
import {
  Badge,
  ThumbsUp,
  ThumbsDown,
  Flag,
  MessageCircle,
  Send,
  Trash,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { BadgeCategory } from "@/types/badge";
import { getBadgeLabel } from "@/constants/badges";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/Spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { reviewReportService } from "@/services/review-report.service";

interface BadgeFeedItemProps {
  item: FeedItem;
}

export default function BadgeFeedItem({ item }: BadgeFeedItemProps) {
  const badgeData = item.data as BadgeFeedData;
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [userReaction, setUserReaction] = useState<"like" | "dislike" | null>(
    null
  );
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);

  const getBadgeCategoryLabel = (category: string) => {
    return getBadgeLabel(category as BadgeCategory);
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      showToast("Lütfen bir rapor nedeni girin", "error");
      return;
    }

    if (!badgeData?.badge?._id) {
      showToast("Rozet bilgileri eksik", "error");
      return;
    }

    try {
      setIsSubmittingReport(true);
      await reviewReportService.createReport({
        locationId: badgeData.badge._id,
        reviewId: item._id || badgeData.badge._id,
        reason: reportReason,
      });
      showToast("Rozet bildirimi başarıyla raporlandı", "success");
      setIsReportDialogOpen(false);
      setReportReason("");
    } catch (error: unknown) {
      console.error("Error reporting badge notification:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Rozet bildirimi raporlanırken bir hata oluştu";
      showToast(errorMessage, "error");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      showToast("Bu işlemi gerçekleştirmek için giriş yapmalısınız", "error");
      return;
    }

    if (!item._id) {
      showToast("Bildirim ID'si eksik", "error");
      return;
    }

    try {
      if (userReaction === "like") {
        await feedService.removeBadgeNotificationReaction(item._id);
        setUserReaction(null);
        setLikes((prev) => Math.max(0, prev - 1));
      } else {
        await feedService.likeBadgeNotification(item._id);
        if (userReaction === "dislike") {
          setDislikes((prev) => Math.max(0, prev - 1));
        }
        setUserReaction("like");
        setLikes((prev) => prev + 1);
      }
      showToast("İşlem başarıyla gerçekleştirildi", "success");
    } catch (error) {
      console.error("Error liking badge notification:", error);
      showToast("Beğeni işlemi sırasında bir hata oluştu", "error");
    }
  };

  const handleDislike = async () => {
    if (!user) {
      showToast("Bu işlemi gerçekleştirmek için giriş yapmalısınız", "error");
      return;
    }

    if (!item._id) {
      showToast("Bildirim ID'si eksik", "error");
      return;
    }

    try {
      if (userReaction === "dislike") {
        await feedService.removeBadgeNotificationReaction(item._id);
        setUserReaction(null);
        setDislikes((prev) => Math.max(0, prev - 1));
      } else {
        await feedService.dislikeBadgeNotification(item._id);
        if (userReaction === "like") {
          setLikes((prev) => Math.max(0, prev - 1));
        }
        setUserReaction("dislike");
        setDislikes((prev) => prev + 1);
      }
      showToast("İşlem başarıyla gerçekleştirildi", "success");
    } catch (error) {
      console.error("Error disliking badge notification:", error);
      showToast("Beğenmeme işlemi sırasında bir hata oluştu", "error");
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      await loadComments();
    }
    setShowComments(!showComments);
  };

  const loadComments = async () => {
    if (!item._id) {
      showToast("Bildirim ID'si eksik", "error");
      return;
    }

    try {
      setIsLoadingComments(true);
      const commentsData = await feedService.getBadgeNotificationComments(
        item._id
      );
      setComments(commentsData || []);
    } catch (error) {
      console.error("Error loading comments:", error);
      showToast("Yorumlar yüklenirken bir hata oluştu", "error");
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      showToast("Yorum yapmak için giriş yapmalısınız", "error");
      return;
    }

    if (!newComment.trim()) {
      showToast("Yorum alanı boş olamaz", "error");
      return;
    }

    if (!item._id) {
      showToast("Bildirim ID'si eksik", "error");
      return;
    }

    try {
      setIsSubmittingComment(true);
      const comment = await feedService.addBadgeNotificationComment(
        item._id,
        newComment
      );
      if (comment) {
        setComments((prev) => [comment, ...prev]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      showToast("Yorum eklenirken bir hata oluştu", "error");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!item._id) {
      showToast("Bildirim ID'si eksik", "error");
      return;
    }

    try {
      await feedService.deleteBadgeNotificationComment(item._id, commentId);
      setComments((prev) =>
        prev.filter((comment) => comment._id !== commentId)
      );
      showToast("Yorum başarıyla silindi", "success");
    } catch (error) {
      console.error("Error deleting comment:", error);
      showToast("Yorum silinirken bir hata oluştu", "error");
    }
  };

  useEffect(() => {
    if (badgeData?.badge) {
      setLikes(badgeData.badge.likes || 0);
      setDislikes(badgeData.badge.dislikes || 0);
      setUserReaction(badgeData.badge.userReaction || null);
    }
  }, [badgeData?.badge]);

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0">
          {badgeData?.user?.imageUrl ? (
            <Image
              src={badgeData.user.imageUrl}
              alt={badgeData.user.name || "Kullanıcı"}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                {badgeData?.user?.name?.[0]?.toUpperCase() || "?"}
              </span>
            </div>
          )}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            <Link
              href={`/users/${badgeData?.user?.username || ""}`}
              className="hover:underline"
            >
              {badgeData?.user?.name || "Kullanıcı"}
            </Link>{" "}
            <span className="text-amber-600 dark:text-amber-400">
              yeni bir rozet kazandı
            </span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(item?.createdAt || new Date()), {
              locale: tr,
              addSuffix: true,
            })}
          </p>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-4 flex items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          {badgeData?.badge?.image && (
            <Image
              src={badgeData.badge.image}
              alt={badgeData.badge.name}
              width={64}
              height={64}
              className="rounded-full"
              unoptimized
            />
          )}
        </div>
        <div>
          <p className="font-semibold text-base text-amber-700 dark:text-amber-400 mb-1">
            {badgeData?.badge?.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {getBadgeCategoryLabel(badgeData?.badge?.category)} Kategorisi
          </p>
          <div className="flex gap-2 mt-2">
            <Badge size={16} className="text-amber-500" />
            <span className="text-sm">
              Tebrikler {badgeData?.user?.name || "Kullanıcı"}!
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`flex items-center gap-1 ${
            userReaction === "like"
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <ThumbsUp className="h-4 w-4" />
          <span>{likes}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleDislike}
          className={`flex items-center gap-1 ${
            userReaction === "dislike"
              ? "text-red-600 dark:text-red-400"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <ThumbsDown className="h-4 w-4" />
          <span>{dislikes}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleComments}
          className="flex items-center gap-1 text-gray-500 dark:text-gray-400"
        >
          <MessageCircle className="h-4 w-4" />
          <span>
            {showComments && comments.length > 0
              ? comments.length
              : badgeData?.badge?.commentCount &&
                  badgeData.badge.commentCount > 0
                ? badgeData.badge.commentCount
                : ""}
          </span>
        </Button>

        {user && badgeData?.user?._id && user._id !== badgeData.user._id && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsReportDialogOpen(true)}
            className="flex items-center gap-1 text-gray-500 dark:text-gray-400"
          >
            <Flag className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showComments && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          {user && (
            <div className="flex gap-2 mb-4">
              <Textarea
                placeholder="Yorum yaz..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[60px] flex-grow"
              />
              <Button
                onClick={handleAddComment}
                disabled={isSubmittingComment}
                className="self-end"
              >
                {isSubmittingComment ? (
                  <Spinner size="sm" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}

          {isLoadingComments ? (
            <div className="flex justify-center py-4">
              <Spinner size="md" />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={comment.user.imageUrl}
                      alt={comment.user.name}
                    />
                    <AvatarFallback>
                      {comment.user.name[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-grow bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          href={`/users/${comment.user.username}`}
                          className="text-sm font-medium text-gray-900 dark:text-white hover:underline"
                        >
                          {comment.user.name}
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            locale: tr,
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      {user &&
                        comment?.user?._id &&
                        (user._id === comment.user._id ||
                          user.role === "ADMIN") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-red-500 hover:text-red-700 p-1 h-auto"
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              Henüz yorum yok. İlk yorumu sen yap!
            </p>
          )}
        </div>
      )}

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent>
          <DialogTitle>Rozet Bildirimini Raporla</DialogTitle>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Bu rozet bildirimini neden raporlamak istediğinizi açıklayın:
            </p>
            <Textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Rapor nedeninizi yazın..."
              className="min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsReportDialogOpen(false)}
              >
                İptal
              </Button>
              <Button
                onClick={handleReport}
                disabled={isSubmittingReport || !reportReason.trim()}
              >
                {isSubmittingReport ? <Spinner size="sm" /> : "Raporla"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
