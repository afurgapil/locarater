"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useToast } from "@/hooks/useToast";
import { Spinner } from "@/components/ui/Spinner";

import {
  feedService,
  FeedItem,
  LocationFeedData,
  ReviewFeedData,
  FeedComment,
} from "@/services/feed.service";
import { formatDistanceToNow } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { getCategoryLabel, CategoryType } from "@/constants/categories";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  ThumbsUp,
  ThumbsDown,
  Flag,
  MessageCircle,
  Send,
  Trash,
} from "lucide-react";
import { reviewReportService } from "@/services/review-report.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BadgeFeedItem from "@/components/feed/BadgeFeedItem";

export default function FeedPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { showToast } = useToast();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  const fetchFeed = useCallback(
    async (pageNum = 1) => {
      try {
        const isInitialLoad = pageNum === 1;
        if (isInitialLoad) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const response = await feedService.getFeed(pageNum);

        if (isInitialLoad) {
          setFeedItems(response?.feed || []);
        } else {
          setFeedItems((prev) => [...prev, ...(response?.feed || [])]);
        }

        setHasMore(pageNum < (response?.pagination?.pages || 1));
      } catch (error) {
        console.error("Error fetching feed:", error);
        setError(
          "Feed yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
        );
        showToast("Feed yüklenirken bir hata oluştu", "error");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchFeed(nextPage);
        }
      },
      { threshold: 0.5 }
    );

    observerRef.current = observer;

    if (lastItemRef.current) {
      observer.observe(lastItemRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isLoadingMore, page]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          Hata
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-center">{error}</p>
        <Button onClick={() => fetchFeed()} className="mt-4">
          Tekrar Dene
        </Button>
      </div>
    );
  }

  if (!feedItems || feedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Feed Boş
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-center">
          Henüz gösterilecek bir içerik yok. Takip ettiğiniz kullanıcılar yorum
          yaptığında veya yeni mekanlar eklendiğinde burada görünecekler.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Akış
      </h1>

      <div className="space-y-4 divide-y divide-gray-200 dark:divide-gray-700">
        {feedItems.map((item, index) => {
          const isLastItem = index === feedItems.length - 1;

          return (
            <div
              key={item._id || index}
              ref={isLastItem ? lastItemRef : null}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
            >
              {item.type === "LOCATION" || item.type === "location" ? (
                <LocationFeedItem item={item} />
              ) : item.type === "BADGE" || item.type === "badge" ? (
                <BadgeFeedItem item={item} />
              ) : (
                <ReviewFeedItem item={item} />
              )}
            </div>
          );
        })}
      </div>

      {isLoadingMore && (
        <div className="flex justify-center my-6">
          <Spinner size="md" />
        </div>
      )}

      {!hasMore && feedItems.length > 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 my-6">
          Tüm içerikler yüklendi
        </p>
      )}
    </div>
  );
}

function LocationFeedItem({ item }: { item: FeedItem }) {
  const locationData = item.data as LocationFeedData;

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0">
          {locationData?.creator?.imageUrl ? (
            <Image
              src={locationData.creator.imageUrl}
              alt={locationData.creator.name || "Kullanıcı"}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                {locationData?.creator?.name?.[0]?.toUpperCase() || "?"}
              </span>
            </div>
          )}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            <Link
              href={`/users/${locationData?.creator?.username || ""}`}
              className="hover:underline"
            >
              {locationData?.creator?.name || "Kullanıcı"}
            </Link>{" "}
            <span className="text-gray-600 dark:text-gray-400">
              yeni bir mekan ekledi
            </span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(item?.createdAt || new Date()))}
          </p>
        </div>
      </div>

      <div className="mt-2">
        <Link href={`/locations/${locationData?.location?._id || ""}`}>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
            {locationData?.location?.name || "Mekan"}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {getCategoryLabel(
            (locationData?.location?.category || "") as CategoryType
          )}
        </p>
        {locationData?.location?.imageUrl && (
          <div className="mt-3 relative h-48 rounded-lg overflow-hidden">
            <Image
              src={locationData.location.imageUrl}
              alt={locationData.location.name}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewFeedItem({ item }: { item: FeedItem }) {
  const reviewData = item.data as ReviewFeedData;
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
    reviewData?.review?.userReaction || null
  );
  const [likes, setLikes] = useState(reviewData?.review?.likes || 0);
  const [dislikes, setDislikes] = useState(reviewData?.review?.dislikes || 0);

  const handleReport = async () => {
    if (!reportReason.trim()) {
      showToast("Lütfen bir rapor nedeni girin", "error");
      return;
    }

    if (!reviewData?.location?._id || !reviewData?.review?._id) {
      showToast("Değerlendirme bilgileri eksik", "error");
      return;
    }

    try {
      setIsSubmittingReport(true);
      await reviewReportService.createReport({
        locationId: reviewData.location._id,
        reviewId: reviewData.review._id,
        reason: reportReason,
      });
      showToast("Değerlendirme başarıyla raporlandı", "success");
      setIsReportDialogOpen(false);
      setReportReason("");
    } catch (error: unknown) {
      console.error("Error reporting review:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Değerlendirme raporlanırken bir hata oluştu";
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

    if (!reviewData?.review?._id) {
      showToast("Değerlendirme bilgileri eksik", "error");
      return;
    }

    try {
      if (userReaction === "like") {
        await feedService.removeReaction(reviewData.review._id);
        setUserReaction(null);
        setLikes((prev) => Math.max(0, prev - 1));
      } else {
        await feedService.likeReview(reviewData.review._id);
        if (userReaction === "dislike") {
          setDislikes((prev) => Math.max(0, prev - 1));
        }
        setUserReaction("like");
        setLikes((prev) => prev + 1);
      }
      showToast("İşlem başarıyla gerçekleştirildi", "success");
    } catch (error) {
      console.error("Error liking review:", error);
      showToast("Beğeni işlemi sırasında bir hata oluştu", "error");
    }
  };

  const handleDislike = async () => {
    if (!user) {
      showToast("Bu işlemi gerçekleştirmek için giriş yapmalısınız", "error");
      return;
    }

    if (!reviewData?.review?._id) {
      showToast("Değerlendirme bilgileri eksik", "error");
      return;
    }

    try {
      if (userReaction === "dislike") {
        await feedService.removeReaction(reviewData.review._id);
        setUserReaction(null);
        setDislikes((prev) => Math.max(0, prev - 1));
      } else {
        await feedService.dislikeReview(reviewData.review._id);
        if (userReaction === "like") {
          setLikes((prev) => Math.max(0, prev - 1));
        }
        setUserReaction("dislike");
        setDislikes((prev) => prev + 1);
      }
      showToast("İşlem başarıyla gerçekleştirildi", "success");
    } catch (error) {
      console.error("Error disliking review:", error);
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
    if (!reviewData?.review?._id) {
      showToast("Değerlendirme bilgileri eksik", "error");
      return;
    }

    try {
      setIsLoadingComments(true);
      const commentsData = await feedService.getReviewComments(
        reviewData.review._id
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

    if (!reviewData?.review?._id) {
      showToast("Değerlendirme bilgileri eksik", "error");
      return;
    }

    try {
      setIsSubmittingComment(true);
      const comment = await feedService.addComment(
        reviewData.review._id,
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
    if (!reviewData?.review?._id) {
      showToast("Değerlendirme bilgileri eksik", "error");
      return;
    }

    try {
      await feedService.deleteComment(reviewData.review._id, commentId);
      setComments((prev) =>
        prev.filter((comment) => comment._id !== commentId)
      );
      showToast("Yorum başarıyla silindi", "success");
    } catch (error) {
      console.error("Error deleting comment:", error);
      showToast("Yorum silinirken bir hata oluştu", "error");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0">
          {reviewData?.reviewer?.imageUrl ? (
            <Image
              src={reviewData.reviewer.imageUrl}
              alt={reviewData.reviewer.name || "Kullanıcı"}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                {reviewData?.reviewer?.name?.[0]?.toUpperCase() || "?"}
              </span>
            </div>
          )}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            <Link
              href={`/users/${reviewData?.reviewer?.username || ""}`}
              className="hover:underline"
            >
              {reviewData?.reviewer?.name || "Kullanıcı"}
            </Link>{" "}
            <span className="text-gray-600 dark:text-gray-400">
              bir yorum yaptı
            </span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(
              new Date(reviewData?.review?.createdAt || new Date())
            )}
          </p>
        </div>
      </div>

      <div className="mt-2">
        <Link href={`/locations/${reviewData?.location?._id || ""}`}>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
            {reviewData?.location?.name || "Mekan"}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {getCategoryLabel(
            (reviewData?.location?.category || "") as CategoryType
          )}
        </p>

        <div className="mt-2 flex items-center">
          <span className="text-yellow-500 mr-2">
            {(reviewData?.review?.rating?.overall || 0).toFixed(1)} ★
          </span>
        </div>

        {reviewData?.review?.comment && (
          <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm">
            {reviewData.review.comment}
          </p>
        )}

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
                : reviewData?.review?.commentCount &&
                    reviewData.review.commentCount > 0
                  ? reviewData.review.commentCount
                  : ""}
            </span>
          </Button>

          {user &&
            reviewData?.reviewer?._id &&
            user._id !== reviewData.reviewer._id && (
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
                            {formatDistanceToNow(new Date(comment.createdAt))}
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
      </div>

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent>
          <DialogTitle>Değerlendirmeyi Raporla</DialogTitle>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Bu değerlendirmeyi neden raporlamak istediğinizi açıklayın:
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
