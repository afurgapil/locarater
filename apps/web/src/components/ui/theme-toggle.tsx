"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300">
        <span className="h-5 w-5 block" />
      </button>
    );
  }

  return (
    <button
      className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "dark" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
      <span className="sr-only">Tema değiştir</span>
    </button>
  );
}
