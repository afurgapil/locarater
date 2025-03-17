export type BadgeCategory = "LOCATION" | "REVIEW" | "INTERACTION" | "QUALITY";
export type BadgeLevel = "bronze" | "silver" | "gold" | "platinum";

export interface Badge {
  _id: string;
  name: string;
  description: string;
  image: string;
  category: BadgeCategory;
  requiredCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserBadge {
  _id: string;
  userId: string;
  badgeId: string;
  unlockedAt: Date | null;
  progress: number;
  createdAt?: Date;
  updatedAt?: Date;
}
