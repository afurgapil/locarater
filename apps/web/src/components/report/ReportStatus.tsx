"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { reviewReportService } from "@/services/review-report.service";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

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
  status: "PENDING" | "RESOLVED" | "REJECTED";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

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

  const getStatusBadge = (status: ReviewReport["status"]) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">Beklemede</Badge>;
      case "RESOLVED":
        return <Badge variant="success">Çözüldü</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Reddedildi</Badge>;
      default:
        return null;
    }
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
              <Card key={report._id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{report.locationId.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Değerlendiren:</span>{" "}
                      {report.review.user.name} (@{report.review.user.username})
                    </p>
                    <p className="text-sm mt-2">{report.review.comment}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Rapor Nedeni:</span>{" "}
                      {report.reason}
                    </p>
                    {report.notes && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Admin Notu:</span>{" "}
                        {report.notes}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {format(new Date(report.createdAt), "d MMMM yyyy HH:mm", {
                        locale: tr,
                      })}
                    </p>
                  </div>
                  <div>{getStatusBadge(report.status)}</div>
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
                    <div>
                      <h3 className="font-semibold">
                        {report.locationId.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Raporlayan:</span>{" "}
                        {report.reporter.name} (@{report.reporter.username})
                      </p>
                      <p className="text-sm mt-2">{report.review.comment}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Rapor Nedeni:</span>{" "}
                        {report.reason}
                      </p>
                      {report.notes && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Admin Notu:</span>{" "}
                          {report.notes}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {format(
                          new Date(report.createdAt),
                          "d MMMM yyyy HH:mm",
                          {
                            locale: tr,
                          }
                        )}
                      </p>
                    </div>
                    <div>{getStatusBadge(report.status)}</div>
                  </div>
                </Card>
              ))
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
