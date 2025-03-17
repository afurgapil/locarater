import { Badge, BadgeCategory } from "../models/badge.model";
import { UserBadge } from "../models/user-badge.model";
import mongoose from "mongoose";

export async function seedBadges() {
  try {
    await Badge.deleteMany({});
    await UserBadge.deleteMany({});

    const locationBadges = [
      {
        name: "Keşifçi",
        description: "İlk lokasyonunu ekledin!",
        image: "/badges/location-bronze.svg",
        category: BadgeCategory.LOCATION,
        requiredCount: 1,
      },
      {
        name: "Gezgin",
        description: "5 lokasyon ekledin!",
        image: "/badges/location-silver.svg",
        category: BadgeCategory.LOCATION,
        requiredCount: 5,
      },
      {
        name: "Kaşif",
        description: "10 lokasyon ekledin!",
        image: "/badges/location-gold.svg",
        category: BadgeCategory.LOCATION,
        requiredCount: 10,
      },
    ];

    const reviewBadges = [
      {
        name: "Yorumcu",
        description: "İlk yorumunu yaptın!",
        image: "/badges/review-bronze.svg",
        category: BadgeCategory.REVIEW,
        requiredCount: 1,
      },
      {
        name: "Eleştirmen",
        description: "5 yorum yaptın!",
        image: "/badges/review-silver.svg",
        category: BadgeCategory.REVIEW,
        requiredCount: 5,
      },
      {
        name: "İnceleyici",
        description: "10 yorum yaptın!",
        image: "/badges/review-gold.svg",
        category: BadgeCategory.REVIEW,
        requiredCount: 10,
      },
    ];

    const socialBadges = [
      {
        name: "Etkileşimci",
        description: "10 etkileşim gerçekleştirdin!",
        image: "/badges/social-bronze.svg",
        category: BadgeCategory.INTERACTION,
        requiredCount: 10,
      },
      {
        name: "Popüler",
        description: "25 etkileşim gerçekleştirdin!",
        image: "/badges/social-silver.svg",
        category: BadgeCategory.INTERACTION,
        requiredCount: 25,
      },
      {
        name: "Sosyal Kelebek",
        description: "50 etkileşim gerçekleştirdin!",
        image: "/badges/social-gold.svg",
        category: BadgeCategory.INTERACTION,
        requiredCount: 50,
      },
    ];

    const qualityBadges = [
      {
        name: "Kaliteli Yorumcu",
        description: "İlk kaliteli yorumunu yaptın!",
        image: "/badges/quality-bronze.svg",
        category: BadgeCategory.QUALITY,
        requiredCount: 1,
      },
      {
        name: "Uzman İnceleyici",
        description: "5 kaliteli yorum yaptın!",
        image: "/badges/quality-silver.svg",
        category: BadgeCategory.QUALITY,
        requiredCount: 5,
      },
      {
        name: "Kalite Ustası",
        description: "10 kaliteli yorum yaptın!",
        image: "/badges/quality-gold.svg",
        category: BadgeCategory.QUALITY,
        requiredCount: 10,
      },
    ];

    await Badge.insertMany([
      ...locationBadges,
      ...reviewBadges,
      ...socialBadges,
      ...qualityBadges,
    ]);

    console.log("Rozetler başarıyla eklendi!");
  } catch (error) {
    console.error("Rozet ekleme hatası:", error);
    throw error;
  }
}

if (require.main === module) {
  seedBadges()
    .then(() => {
      console.log("Seed işlemi tamamlandı!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed işlemi sırasında hata:", error);
      process.exit(1);
    });
}
