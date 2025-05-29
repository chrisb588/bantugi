'use client'

import { ReportCard } from "@/components/report/report-card";
import Report from "@/interfaces/report";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // Import useParams and useRouter

// using tempreport until everything can be represented in the database
// report also needs GIS/ latitiude and longitude information for 
// view in map features

export default function ReportViewPage() { // Removed params from props
  const params = useParams(); // Use useParams hook
  const router = useRouter(); // For navigation
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);

  // Extract id from params
  useEffect(() => {
    if (params && typeof params.id === 'string') {
      setId(params.id);
    } else if (params && Array.isArray(params.id) && params.id.length > 0 && typeof params.id[0] === 'string') {
      // Handle cases where id might be an array (less common for simple routes)
      setId(params.id[0]);
    }
  }, [params]);

  useEffect(() => {
    if (!id) return;

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

  const tempreport: Report = { // Ensure tempreport matches Report interface
    ...report,
    id: report.id || id || "", // Ensure id is always a string
    creator: {
      username: report.creator?.username || "Juan Dela Cruz", // Use actual data if available
      profilePicture: report.creator?.profilePicture || "/img/avatar.jpg"
    },
    // datePosted: report.createdAt, // createdAt is already part of Report
    comments: report.comments || [ // Use actual comments if available
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
    console.log("View in map clicked for report:", tempreport.id);
    // Example: Navigate to home and try to center map (complex, needs state management or query params)
    // For simplicity, just log or use router to go to home page.
    // A more robust solution would involve global state or passing coordinates via query params to the map page.
    if (tempreport.location?.coordinates) {
      const { lat, lng } = tempreport.location.coordinates;
      router.push(`/home?lat=${lat}&lng=${lng}&zoom=18`); // Example of passing coords
    } else {
      router.push('/home');
    }
  };

  const handleBack = () => {
    router.back(); // Simple back navigation
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-hidden pointer-events-auto">
      <ReportCard report={tempreport} onViewMap={handleViewMap} onBack={handleBack} />  
    </div>
  );
}