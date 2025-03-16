"use client";

import { useState } from "react";
import { Review } from "@/types/review";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Star, PencilIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ReviewCardProps {
  review: Review;
  locationId: string;
  onEdit?: (review: Review) => void;
  onDelete?: () => Promise<void>;
}

export function ReviewCard({ review, onEdit, onDelete }: ReviewCardProps) {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDelete = async () => {
    try {
      await onDelete?.();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting review:", error);
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

              {(onEdit || onDelete) && (
                <div className="flex justify-end gap-2">
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
              )}
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
    </>
  );
}
