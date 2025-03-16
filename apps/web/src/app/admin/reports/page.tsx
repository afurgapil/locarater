"use client";

import { useEffect, useState } from "react";
import {
  reviewReportService,
  ReviewReport,
} from "@/services/review-report.service";
import { useToast } from "@/hooks/useToast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function ReportsPage() {
  const [reports, setReports] = useState<ReviewReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReviewReport | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReports = async () => {
    try {
      const data = await reviewReportService.getAllReports();
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
      showToast("Raporlar yüklenirken bir hata oluştu", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    reportId: string,
    status: "RESOLVED" | "REJECTED"
  ) => {
    try {
      setIsUpdating(true);
      await reviewReportService.updateReportStatus(reportId, status);
      showToast("Rapor durumu başarıyla güncellendi", "success");
      fetchReports();
      setIsDetailsOpen(false);
    } catch (error) {
      console.error("Error updating report status:", error);
      showToast("Rapor durumu güncellenirken bir hata oluştu", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: ReviewReport["status"]) => {
    const variants = {
      PENDING:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      RESOLVED:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };

    const labels = {
      PENDING: "Beklemede",
      RESOLVED: "Çözüldü",
      REJECTED: "Reddedildi",
    };

    return (
      <Badge className={variants[status]} variant="secondary">
        {labels[status]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Değerlendirme Raporları</h1>
      </div>

      <div className="grid gap-4">
        {reports.length === 0 ? (
          <Card>
            <CardContent className="flex h-32 items-center justify-center">
              <p className="text-gray-500">Henüz hiç rapor bulunmuyor.</p>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report._id} className="overflow-hidden">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">
                  <Link
                    href={`/locations/${report.locationId._id}`}
                    className="hover:underline"
                  >
                    {report.locationId.name}
                  </Link>
                </CardTitle>
                {getStatusBadge(report.status)}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        Rapor Eden:{" "}
                        <Link
                          href={`/users/${report.reporter.username}`}
                          className="font-medium text-gray-900 hover:underline dark:text-white"
                        >
                          {report.reporter.name || report.reporter.username}
                        </Link>
                      </span>
                      <span>
                        {format(new Date(report.createdAt), "d MMMM yyyy", {
                          locale: tr,
                        })}
                      </span>
                    </div>
                    <p className="text-sm">{report.reason}</p>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReport(report);
                        setIsDetailsOpen(true);
                      }}
                    >
                      Detaylar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Rapor Detayları</DialogTitle>
          {selectedReport && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-medium">Değerlendirme</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <Link
                          href={`/users/${selectedReport.review.user.username}`}
                          className="font-medium hover:underline"
                        >
                          {selectedReport.review.user.name ||
                            selectedReport.review.user.username}
                        </Link>
                        <span className="text-sm text-gray-500">
                          {format(
                            new Date(selectedReport.createdAt),
                            "d MMMM yyyy",
                            {
                              locale: tr,
                            }
                          )}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">
                        {selectedReport.review.comment}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">Rapor Nedeni</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <Link
                          href={`/users/${selectedReport.reporter.username}`}
                          className="font-medium hover:underline"
                        >
                          {selectedReport.reporter.name ||
                            selectedReport.reporter.username}
                        </Link>
                        <span className="text-sm text-gray-500">
                          {format(
                            new Date(selectedReport.createdAt),
                            "d MMMM yyyy",
                            {
                              locale: tr,
                            }
                          )}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">
                        {selectedReport.reason}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {selectedReport.status === "PENDING" && (
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleStatusUpdate(selectedReport._id, "REJECTED")
                    }
                    disabled={isUpdating}
                  >
                    {isUpdating ? "İşleniyor..." : "Reddet"}
                  </Button>
                  <Button
                    onClick={() =>
                      handleStatusUpdate(selectedReport._id, "RESOLVED")
                    }
                    disabled={isUpdating}
                  >
                    {isUpdating ? "İşleniyor..." : "Çözüldü Olarak İşaretle"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
