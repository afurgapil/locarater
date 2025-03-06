export const CATEGORIES = [
  { value: "RESTAURANT", label: "Restoran" },
  { value: "FAST_FOOD", label: "Fast Food" },
  { value: "HOME_MADE", label: "Ev Yemekleri" },
  { value: "STREET_FOOD", label: "Sokak Lezzeti" },
  { value: "CAFE", label: "Kafe" },
  { value: "PATISSERIE", label: "Tatlıcı" },
  { value: "FINE_DINING", label: "Fine Dining" },
  { value: "BAR", label: "Bar" },
  { value: "CLUB", label: "Kulüp" },
  { value: "PUB", label: "Pub" },
  { value: "OTHER", label: "Diğer" },
] as const;

export type CategoryType = (typeof CATEGORIES)[number]["value"];

export const getCategoryLabel = (value: CategoryType): string => {
  return (
    CATEGORIES.find((category) => category.value === value)?.label || value
  );
};

export const getCategoryImage = (category: CategoryType): string => {
  const imageMap: Record<CategoryType, string> = {
    RESTAURANT: "/assets/RESTAURANT.jpg",
    FAST_FOOD: "/assets/FAST_FOOD.webp",
    HOME_MADE: "/assets/HOME_MADE.jpg",
    STREET_FOOD: "/assets/STREET_FOOD.jpeg",
    CAFE: "/assets/CAFE.jpg",
    PATISSERIE: "/assets/PATISSERIE.webp",
    FINE_DINING: "/assets/FINE_DINING.png",
    BAR: "/assets/placeholder.png", // Varsayılan resim
    CLUB: "/assets/CLUB.jpg",
    PUB: "/assets/PUB.jpeg",
    OTHER: "/assets/OTHER.jpeg",
  };

  return imageMap[category] || "/assets/placeholder.png";
};
