import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  format,
  formatDistanceToNow as formatDistanceToNowFns,
} from "date-fns";
import { tr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: string | Date): string => {
  return format(new Date(date), "dd MMMM yyyy", { locale: tr });
};

export const formatDistanceToNow = (date: Date): string => {
  return formatDistanceToNowFns(date, { addSuffix: true, locale: tr });
};
