export const BADGES = [
  {
    value: "LOCATION",
    label: "Mekanlar",
  },
  {
    value: "REVIEW",
    label: "Değerlendirmeler",
  },
  {
    value: "INTERACTION",
    label: "Etkileşimler",
  },
  {
    value: "QUALITY",
    label: "Kalite",
  },
];

export type BadgeType = (typeof BADGES)[number]["value"];

export const getBadgeLabel = (value: BadgeType): string => {
  return BADGES.find((badge) => badge.value === value)?.label || value;
};
