"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import {
  type ReportCategory,
  type ReportResult,
  type ReportStatus as ReportStatusType,
  reviewReportService,
} from "@/services/review-report.service";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

interface ReviewReport {
  _id: string;
  locationId: {
    _id: string;
    name: string;
  };
  review: {
    _id: string;
    comment: string;
    user: {
      _id: string;
      username: string;
      name: string;
    };
  };
  reporter: {
    _id: string;
    username: string;
    name: string;
  };
  reason: string;
  category: ReportCategory;
  status: ReportStatusType;
  result?: ReportResult;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
}

const categoryDescriptions: Record<ReportCategory, string> = {
  SPAM: "Spam",
  INAPPROPRIATE_CONTENT: "Uygunsuz İçerik",
  FALSE_INFORMATION: "Yanlış Bilgi",
  HARASSMENT: "Taciz/Hakaret",
  OTHER: "Diğer",
};

const resultDescriptions: Record<ReportResult, string> = {
  REMOVED: "İçerik Kaldırıldı",
  WARNING_ISSUED: "Kullanıcı Uyarıldı",
  NO_ACTION: "İşlem Yapılmadı",
  FALSE_REPORT: "Yanlış Rapor",
};

export function ReportStatus() {
  const { user } = useUser();
  const [userReports, setUserReports] = useState<ReviewReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const reports = await reviewReportService.getUserReports();
        setUserReports(reports);
      } catch (error) {
        setError("Raporlar yüklenirken bir hata oluştu");
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReports();
    }
  }, [user]);

  const getStatusBadge = (status: ReportStatusType) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
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
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Çözüldü</span>
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5" />
            <span>Reddedildi</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  const getResultBadge = (result?: ReportResult) => {
    if (!result) return null;

    const variants: Record<ReportResult, string> = {
      REMOVED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      WARNING_ISSUED:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      NO_ACTION:
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      FALSE_REPORT:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    };

    return (
      <Badge variant="outline" className={`${variants[result]} border-none`}>
        {resultDescriptions[result]}
      </Badge>
    );
  };

  const getCategoryBadge = (category: ReportCategory) => {
    const variants: Record<ReportCategory, string> = {
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
      <Badge variant="outline" className={`${variants[category]} border-none`}>
        {categoryDescriptions[category]}
      </Badge>
    );
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <Tabs defaultValue="sent" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="sent">Gönderdiğim Raporlar</TabsTrigger>
        <TabsTrigger value="received">Aldığım Raporlar</TabsTrigger>
      </TabsList>

      <TabsContent value="sent">
        <div className="grid gap-4">
          {userReports.length === 0 ? (
            <p className="text-gray-500">Henüz rapor göndermemişsiniz.</p>
          ) : (
            userReports.map((report) => (
              <Card key={report._id} className="p-4 dark:border-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        {report.locationId.name}
                      </h3>
                      <div className="flex gap-2">
                        {getCategoryBadge(report.category)}
                        {getStatusBadge(report.status)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Değerlendiren:</span>{" "}
                      {report.review.user.name} (@{report.review.user.username})
                    </p>
                    <p className="text-sm mt-2">{report.review.comment}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Rapor Nedeni:</span>{" "}
                      {report.reason}
                    </p>

                    {report.result && (
                      <div className="mt-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <p className="text-sm font-medium">
                          Sonuç: {getResultBadge(report.result)}
                        </p>
                      </div>
                    )}

                    {report.notes && (
                      <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <span className="font-medium">Admin Notu:</span>{" "}
                        {report.notes}
                      </p>
                    )}

                    <div className="flex justify-between items-center mt-3">
                      <p className="text-xs text-gray-500">
                        Oluşturulma:{" "}
                        {format(
                          new Date(report.createdAt),
                          "d MMMM yyyy HH:mm",
                          {
                            locale: tr,
                          }
                        )}
                      </p>
                      {report.processedAt && (
                        <p className="text-xs text-gray-500">
                          İşlem:{" "}
                          {format(
                            new Date(report.processedAt),
                            "d MMMM yyyy HH:mm",
                            {
                              locale: tr,
                            }
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="received">
        <div className="grid gap-4">
          {userReports.filter((report) => report.review.user._id === user?._id)
            .length === 0 ? (
            <p className="text-gray-500">Henüz rapor almamışsınız.</p>
          ) : (
            userReports
              .filter((report) => report.review.user._id === user?._id)
              .map((report) => (
                <Card key={report._id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">
                          {report.locationId.name}
                        </h3>
                        <div className="flex gap-2">
                          {getCategoryBadge(report.category)}
                          {getStatusBadge(report.status)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Raporlayan:</span>{" "}
                        {report.reporter.name} (@{report.reporter.username})
                      </p>
                      <p className="text-sm mt-2">{report.review.comment}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Rapor Nedeni:</span>{" "}
                        {report.reason}
                      </p>

                      {report.result && (
                        <div className="mt-3 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <p className="text-sm font-medium">
                            Sonuç: {getResultBadge(report.result)}
                          </p>
                        </div>
                      )}

                      {report.notes && (
                        <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <span className="font-medium">Admin Notu:</span>{" "}
                          {report.notes}
                        </p>
                      )}

                      <div className="flex justify-between items-center mt-3">
                        <p className="text-xs text-gray-500">
                          Oluşturulma:{" "}
                          {format(
                            new Date(report.createdAt),
                            "d MMMM yyyy HH:mm",
                            {
                              locale: tr,
                            }
                          )}
                        </p>
                        {report.processedAt && (
                          <p className="text-xs text-gray-500">
                            İşlem:{" "}
                            {format(
                              new Date(report.processedAt),
                              "d MMMM yyyy HH:mm",
                              {
                                locale: tr,
                              }
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
