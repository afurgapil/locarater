"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Header } from "@/components/layout/Header";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <div className="flex flex-1 pt-14 md:pt-16">
        <DashboardSidebar />
        <div className="flex-1 md:ml-64">
          <main className="py-4 md:py-6">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
