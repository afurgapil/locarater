"use client";

import { useState } from "react";
import { CATEGORIES } from "@/constants/categories";

export function CategoryFilter({
  selectedCategory,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange("")}
        className={`px-4 py-2 rounded-full text-sm font-medium ${
          !selectedCategory
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        }`}
      >
        Tümü
      </button>
      {CATEGORIES.map((category) => (
        <button
          key={category.value}
          onClick={() => onChange(category.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            selectedCategory === category.value
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
