import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header showDashboardLink={false} />
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
