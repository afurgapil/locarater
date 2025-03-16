"use client";

import { useState, ChangeEvent } from "react";
import { Review } from "@/types/review";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Star, PencilIcon, TrashIcon, ImageIcon, Flag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { locationService } from "@/services/location.service";
import { reviewReportService } from "@/services/review-report.service";
import { useToast } from "@/hooks/useToast";
import { Textarea } from "@/components/ui/textarea";

interface ReviewCardProps {
  review: Review;
  locationId: string;
  onEdit?: (review: Review) => void;
  onDelete?: () => Promise<void>;
}

export function ReviewCard({
  review,
  locationId,
  onEdit,
  onDelete,
}: ReviewCardProps) {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isImageCopyDialogOpen, setIsImageCopyDialogOpen] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const isAdmin = user?.role === "ADMIN";
  const isOwnReview = user?._id === review.user._id;

  const handleDelete = async () => {
    try {
      await onDelete?.();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const handleCopyImage = async () => {
    if (!review.imageUrl) return;

    try {
      setIsCopyingImage(true);
      await locationService.updateLocationImageFromReview(
        locationId,
        review.imageUrl
      );
      showToast("Görsel başarıyla mekan görseli olarak ayarlandı", "success");
      setIsImageCopyDialogOpen(false);
    } catch (error) {
      console.error("Error copying image:", error);
      showToast("Görsel kopyalanırken bir hata oluştu", "error");
    } finally {
      setIsCopyingImage(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      showToast("Lütfen bir rapor nedeni girin", "error");
      return;
    }

    try {
      setIsSubmittingReport(true);
      await reviewReportService.createReport({
        locationId,
        reviewId: review._id,
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(10)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Card className="w-full overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <CardContent
            className={`flex-1 p-6 ${
              !review.imageUrl || imageError
                ? "md:max-w-none"
                : "md:max-w-[67%]"
            }`}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Link href={`/users/${review.user.username}`}>
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage
                      src={review.user.imageUrl}
                      alt={review.user.name || review.user.username}
                    />
                    <AvatarFallback>
                      {(review.user.name || review.user.username)
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <div>
                  <Link href={`/users/${review.user.username}`}>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {review.user.name || review.user.username}
                    </p>
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(review.visitDate), "d MMMM yyyy", {
                      locale: tr,
                    })}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="ml-auto bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                >
                  {review.rating.overall.toFixed(1)}/10
                </Badge>
              </div>

              <p className="text-gray-700 dark:text-gray-300">
                {review.comment}
              </p>

              <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-50 dark:bg-gray-900 p-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Lezzet
                  </p>
                  {renderStars(review.rating.taste)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Servis
                  </p>
                  {renderStars(review.rating.service)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ambiyans
                  </p>
                  {renderStars(review.rating.ambiance)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fiyat/Performans
                  </p>
                  {renderStars(review.rating.pricePerformance)}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                {user && !isOwnReview && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsReportDialogOpen(true)}
                    className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                  >
                    <Flag className="h-4 w-4 mr-1" />
                    Raporla
                  </Button>
                )}
                {isAdmin && review.imageUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsImageCopyDialogOpen(true)}
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    <ImageIcon className="h-4 w-4 mr-1" />
                    Görseli Mekana Taşı
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(review)}
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Düzenle
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Sil
                  </Button>
                )}
              </div>
            </div>
          </CardContent>

          {review.imageUrl && !imageError && (
            <div className="relative h-48 md:h-auto md:w-1/3 md:min-w-[250px]">
              <div
                className="group relative h-full w-full cursor-pointer"
                onClick={() => setIsImageOpen(true)}
              >
                <Image
                  src={review.imageUrl}
                  alt="Review image"
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  onError={() => setImageError(true)}
                  quality={75}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <p className="text-white">Büyütmek için tıklayın</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Image Dialog */}
      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogContent className="max-w-4xl p-0">
          <DialogTitle className="p-6 pb-0">
            {review.user.name || review.user.username} değerlendirmesi
          </DialogTitle>
          <div className="relative h-[80vh] w-full">
            <Image
              src={review.imageUrl!}
              alt="Review image"
              fill
              className="object-contain"
              sizes="100vw"
              quality={75}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogTitle>Değerlendirmeyi Sil</DialogTitle>
          <div className="mt-4">
            <p className="text-gray-600 dark:text-gray-300">
              Bu değerlendirmeyi silmek istediğinizden emin misiniz? Bu işlem
              geri alınamaz.
            </p>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Vazgeç
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Sil
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Copy Dialog */}
      <Dialog
        open={isImageCopyDialogOpen}
        onOpenChange={setIsImageCopyDialogOpen}
      >
        <DialogContent>
          <DialogTitle>Görseli Mekana Taşı</DialogTitle>
          <div className="mt-4">
            <p className="text-gray-600 dark:text-gray-300">
              Bu değerlendirmenin görselini mekanın ana görseli olarak ayarlamak
              istediğinizden emin misiniz? Mevcut mekan görseli varsa
              değiştirilecektir.
            </p>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsImageCopyDialogOpen(false)}
              disabled={isCopyingImage}
            >
              Vazgeç
            </Button>
            <Button
              variant="default"
              onClick={handleCopyImage}
              disabled={isCopyingImage}
            >
              {isCopyingImage ? "İşleniyor..." : "Görseli Taşı"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent>
          <DialogTitle>Değerlendirmeyi Raporla</DialogTitle>
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Bu değerlendirmeyi neden uygunsuz bulduğunuzu açıklayın.
            </p>
            <Textarea
              value={reportReason}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setReportReason(e.target.value)
              }
              placeholder="Rapor nedeninizi yazın..."
              className="min-h-[100px]"
            />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsReportDialogOpen(false);
                setReportReason("");
              }}
              disabled={isSubmittingReport}
            >
              Vazgeç
            </Button>
            <Button
              variant="default"
              onClick={handleReport}
              disabled={isSubmittingReport}
            >
              {isSubmittingReport ? "Gönderiliyor..." : "Raporla"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
