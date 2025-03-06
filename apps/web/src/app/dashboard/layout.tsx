import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <DashboardSidebar />
      <div className="flex-1 md:ml-64">
        {/* Mobil cihazlar için üst boşluk */}
        <div className="h-14 md:hidden" />
        <main className="py-4 md:py-6">
          <div className="mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
