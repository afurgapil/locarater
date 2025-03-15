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
import { Star, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ReviewCardProps {
  review: Review;
  onEdit?: (review: Review) => void;
  onDelete?: (review: Review) => void;
  isOwner?: boolean;
}

export function ReviewCard({
  review,
  onEdit,
  onDelete,
  isOwner,
}: ReviewCardProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(10)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
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
          {/* Content */}
          <CardContent
            className={`flex-1 p-6 ${!review.imageUrl ? "md:max-w-none" : "md:max-w-[67%]"}`}
          >
            <div className="flex flex-col gap-4">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <Link href={`/users/${review.user.username}`}>
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage
                      src={review.user?.imageUrl}
                      alt={review.user.name}
                    />
                    <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                  </Avatar>
                </Link>

                <div>
                  <Link href={`/users/${review.user.username}`}>
                    <p className="font-medium">{review.user.name}</p>
                  </Link>
                  <p className="text-sm text-gray-500">
                    {format(new Date(review.visitDate), "d MMMM yyyy", {
                      locale: tr,
                    })}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="ml-auto bg-yellow-100 text-yellow-700"
                >
                  {review.rating.overall}/10
                </Badge>
              </div>

              {/* Comment */}
              <p className="text-gray-700 dark:text-gray-300">
                {review.comment}
              </p>

              {/* Ratings */}
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-50 dark:bg-gray-900 p-3">
                <div>
                  <p className="text-sm font-medium">Lezzet</p>
                  {renderStars(review.rating.taste)}
                </div>
                <div>
                  <p className="text-sm font-medium">Servis</p>
                  {renderStars(review.rating.service)}
                </div>
                <div>
                  <p className="text-sm font-medium">Ambiyans</p>
                  {renderStars(review.rating.ambiance)}
                </div>
                <div>
                  <p className="text-sm font-medium">Fiyat/Performans</p>
                  {renderStars(review.rating.pricePerformance)}
                </div>
              </div>

              {/* Actions */}
              {isOwner && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit?.(review)}
                  >
                    Düzenle
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete?.(review)}
                  >
                    Sil
                  </Button>
                </div>
              )}
            </div>
          </CardContent>

          {/* Review Image */}
          {review.imageUrl && !imageError && (
            <div className="relative h-48 md:h-auto md:w-1/3 md:min-w-[250px]">
              <div
                className="group relative h-full w-full cursor-pointer"
                onClick={() => setIsImageModalOpen(true)}
              >
                <Image
                  src={review.imageUrl}
                  alt="Review"
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

      {/* Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-4xl p-0">
          <DialogTitle className="p-6 pb-0">
            {review.user.name} değerlendirmesi
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-50"
            onClick={() => setIsImageModalOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="relative h-[80vh] w-full">
            <Image
              src={review.imageUrl || ""}
              alt="Review"
              fill
              className="object-contain"
              sizes="100vw"
              quality={75}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
