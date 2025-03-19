"use client";

import { useEffect, useState } from "react";
import {
  reviewReportService,
  type ReviewReport,
  type ReportStatus,
  type ReportResult,
} from "@/services/review-report.service";
import { useToast } from "@/hooks/useToast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categoryDescriptions: Record<string, string> = {
  SPAM: "Spam",
  INAPPROPRIATE_CONTENT: "Uygunsuz İçerik",
  FALSE_INFORMATION: "Yanlış Bilgi",
  HARASSMENT: "Taciz/Hakaret",
  OTHER: "Diğer",
};

const resultDescriptions: Record<string, string> = {
  REMOVED: "İçerik Kaldırıldı",
  WARNING_ISSUED: "Kullanıcı Uyarıldı",
  NO_ACTION: "İşlem Yapılmadı",
  FALSE_REPORT: "Yanlış Rapor",
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ReviewReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReviewReport | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedResult, setSelectedResult] = useState<ReportResult | "">("");
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

  const handleDeleteReport = async (reportId: string) => {
    try {
      await reviewReportService.deleteReport(reportId);
      showToast("Rapor başarıyla silindi", "success");
      fetchReports();
    } catch (error) {
      console.error("Error deleting report:", error);
      showToast("Rapor silinirken bir hata oluştu", "error");
    }
  };

  const handleStatusUpdate = async (reportId: string, status: ReportStatus) => {
    try {
      setIsUpdating(true);

      const updateData = {
        status,
        result: selectedResult || undefined,
        notes: notes.trim() || undefined,
      };

      await reviewReportService.updateReportStatus(reportId, updateData);
      showToast("Rapor durumu başarıyla güncellendi", "success");
      fetchReports();
      setIsDetailsOpen(false);
      setNotes("");
      setSelectedResult("");
    } catch (error) {
      console.error("Error updating report status:", error);
      showToast("Rapor durumu güncellenirken bir hata oluştu", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Beklemede</span>
          </Badge>
        );
      case "IN_REVIEW":
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            <span>İnceleniyor</span>
          </Badge>
        );
      case "RESOLVED":
        return (
          <Badge
            variant="success"
            className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Çözüldü</span>
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="destructive"
            className="flex items-center gap-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>Reddedildi</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, string> = {
      SPAM: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      INAPPROPRIATE_CONTENT:
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      FALSE_INFORMATION:
        "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      HARASSMENT:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    };

    return (
      <Badge
        variant="outline"
        className={`${variants[category] || variants.OTHER} border-none`}
      >
        {categoryDescriptions[category] || "Kategori"}
      </Badge>
    );
  };

  const getResultBadge = (result?: string) => {
    if (!result) return null;

    const variants: Record<string, string> = {
      REMOVED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      WARNING_ISSUED:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      NO_ACTION:
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      FALSE_REPORT:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    };

    return (
      <Badge
        variant="outline"
        className={`${variants[result] || variants.NO_ACTION} border-none`}
      >
        {resultDescriptions[result] || "Sonuç"}
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
            <Card
              key={report._id}
              className="overflow-hidden dark:border-white"
            >
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-medium">
                    <Link
                      href={`/locations/${report.locationId._id}`}
                      className="hover:underline"
                    >
                      {report.locationId.name}
                    </Link>
                  </CardTitle>
                  {getCategoryBadge(report.category)}
                </div>
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

                    {report.result && (
                      <div className="mt-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <p className="text-sm font-medium">
                          Sonuç: {getResultBadge(report.result)}
                        </p>
                      </div>
                    )}

                    {report.notes && (
                      <div className="mt-2 rounded-md bg-gray-50 p-2 dark:bg-gray-800">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Not:</span>{" "}
                          {report.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReport(report);
                        setIsDetailsOpen(true);
                        setNotes(report.notes || "");
                        setSelectedResult(report.result || "");
                      }}
                    >
                      Detaylar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteReport(report._id)}
                    >
                      Sil
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="mb-2 font-medium">Rapor Bilgileri</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Durum:</span>
                          {getStatusBadge(selectedReport.status)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Kategori:</span>
                          {getCategoryBadge(selectedReport.category)}
                        </div>
                        {selectedReport.result && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Sonuç:</span>
                            {getResultBadge(selectedReport.result)}
                          </div>
                        )}
                        <div>
                          <span className="text-sm font-medium">
                            Rapor Eden:
                          </span>
                          <Link
                            href={`/users/${selectedReport.reporter.username}`}
                            className="ml-2 text-sm font-medium hover:underline"
                          >
                            {selectedReport.reporter.name ||
                              selectedReport.reporter.username}
                          </Link>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Tarih:</span>
                          <span className="ml-2 text-sm">
                            {format(
                              new Date(selectedReport.createdAt),
                              "d MMMM yyyy HH:mm",
                              {
                                locale: tr,
                              }
                            )}
                          </span>
                        </div>
                        {selectedReport.processedAt && (
                          <div>
                            <span className="text-sm font-medium">
                              İşlem Tarihi:
                            </span>
                            <span className="ml-2 text-sm">
                              {format(
                                new Date(selectedReport.processedAt),
                                "d MMMM yyyy HH:mm",
                                {
                                  locale: tr,
                                }
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

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
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {selectedReport.review.comment}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Rapor Nedeni</h3>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedReport.reason}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {selectedReport.status === "PENDING" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-result">İşlem Sonucu</Label>
                    <Select
                      value={selectedResult}
                      onValueChange={(value: string) =>
                        setSelectedResult(value as ReportResult)
                      }
                    >
                      <SelectTrigger id="report-result">
                        <SelectValue placeholder="İşlem sonucunu seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REMOVED">
                          İçerik Kaldırıldı
                        </SelectItem>
                        <SelectItem value="WARNING_ISSUED">
                          Kullanıcı Uyarıldı
                        </SelectItem>
                        <SelectItem value="NO_ACTION">
                          İşlem Yapılmadı
                        </SelectItem>
                        <SelectItem value="FALSE_REPORT">
                          Yanlış Rapor
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="report-notes">Not (İsteğe Bağlı)</Label>
                    <Textarea
                      id="report-notes"
                      placeholder="Rapor hakkında not ekleyin..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleStatusUpdate(selectedReport._id, "REJECTED")
                      }
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>İşleniyor...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          <span>Reddet</span>
                        </div>
                      )}
                    </Button>
                    <Button
                      onClick={() =>
                        handleStatusUpdate(selectedReport._id, "RESOLVED")
                      }
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>İşleniyor...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          <span>Çözüldü Olarak İşaretle</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
