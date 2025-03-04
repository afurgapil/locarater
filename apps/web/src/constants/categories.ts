export const CATEGORIES = [
  { value: "RESTAURANT", label: "Restoran" },
  { value: "FAST_FOOD", label: "Fast Food" },
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
