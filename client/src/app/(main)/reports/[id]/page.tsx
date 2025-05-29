'use client'

import { Card, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle } from "lucide-react";
import { ReportCard } from "@/components/report/report-card";
import Report from "@/interfaces/report";
import { MobileNavbar } from "@/components/generic/mobile-navbar";
import { useEffect, useState, use } from "react";
// using tempreport until everything can be represented in the database
// report also needs GIS/ latitiude and longitude information for 
// view in map features

export default function ReportViewPage({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { id } = params;

  useEffect(() => {

    async function fetchReport() {
      try {
        const res = await fetch(`/api/reports/${id}`);
        if (!res.ok) throw new Error("Failed to fetch report");
        const data = await res.json();
        setReport(data);
      } catch (err) {
        setError((err as Error).message);
      }
    }

    fetchReport();
  }, [id]);

  if (error) return <div>Error: {error}</div>;
  if (!report) return <div>Loading report...</div>;

  const tempreport = {
    
    ...report,
    creator: {
      username: "Juan Dela Cruz",
      profilePicture: "/img/avatar.jpg"
    },
    datePosted: report.createdAt,
    comments: [
      {
        id: "1",
        creator: {
          username: "creeeees",
          profilePicture: "/img/avatar.jpg"
        },
        content: "Di diay ko, hmph!",
        createdAt: new Date(report.createdAt),
      }
    ]
  };

  const handleViewMap = () => {
    console.log("View in map clicked");
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-hidden pointer-events-auto">
      <ReportCard report={tempreport} onViewMap={handleViewMap} />  
    </div>
  );
} 