'use client';

import { Card, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle } from "lucide-react";
import { ReportView, Report } from "@/components/report/report-view";
import { MobileNavbar } from "@/components/generic/mobile-navbar";

export default function ReportViewPage() {
  // Mock data - can be replaced with actual API calls
  const report: Report = {
    id: "1",
    title: "BAHA SA UP",
    category: "Environmental",
    location: "Lahug, Cebu City, Cebu",
    status: "Unresolved",
    description: "Panabangi mi ngari kay kusog kaayo ang baha diri, abot tuhod ang baha!",
    images: ["/img/flood-image.png", "/img/flood-image.png"],
    datePosted: new Date().toISOString(),
    author: {
      name: "Juan Dela Cruz",
      location: "Jagobiao, Mandaue City, Cebu",
      avatar: "/img/avatar.jpg"
    },
    comments: [
      {
        id: "1",
        author: {
          name: "creeeees",
          location: "Jagobiao, Mandaue City, Cebu",
          avatar: "/img/avatar.jpg"
        },
        text: "Di diay ko, hmph!",
        datePosted: new Date().toISOString()
      }
    ]
  };

  const handleViewMap = () => {
    // Implementation for view in map functionality
    console.log("View in map clicked");
  };

  // Define a consistent red color
  const redColor = "#B8180D";

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-hidden">
      <div className="flex w-full max-w-lg flex-col gap-6">
        <Card className="h-[85vh] min-h-[400px] max-h-[800px] shadow-lg">
          <ScrollArea className="h-full">
            {/* Header */}
            <CardHeader className="flex flex-row items-center gap-2 py-2 px-4 sticky top-0 bg-background z-10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-7 w-7" style={{ color: redColor }} />
                <h2 className="text-lg font-bold">{report.title}</h2>
              </div>
            </CardHeader>
            
            {/* Report Content */}
            <ReportView report={report} onViewMap={handleViewMap} />
          </ScrollArea>
        </Card>
        
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <MobileNavbar />
        </div>
      </div>
    </div>
  );
} 