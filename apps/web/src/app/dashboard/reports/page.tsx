import { Metadata } from "next";
import { ReportStatus } from "@/components/report/ReportStatus";

export const metadata: Metadata = {
  title: "Raporlarım | LocaRater",
  description: "Raporlarınızı takip edin",
};

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Raporlarım</h1>
        <p className="text-gray-600">
          Gönderdiğiniz ve size ait raporları buradan takip edebilirsiniz.
        </p>
      </div>

      <ReportStatus />
    </div>
  );
}
