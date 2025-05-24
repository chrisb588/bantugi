'use client';

import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, MapPin } from "lucide-react";
import { ReportCard, Report } from "@/components/report/report-card";

export default function ReportViewPage() {
  // Mock data - can be replaced with actual API calls
  const report: Report = {
    id: "1",
    title: "BAHA SA UP",
    category: "Environmental",
    location: "Lahug, Cebu City, Cebu",
    status: "Unresolved",
    urgency: "low",
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
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-hidden pointer-events-auto">
      <ReportCard report={report} onViewMap={handleViewMap} />  
    </div>
  );

  // return (
  //   <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-hidden">
  //     <div className="flex w-full max-w-lg flex-col gap-6">
  //       <Card className="h-[85vh] min-h-[400px] max-h-[800px] shadow-lg">
  //         <ScrollArea className="h-full">
  //           {/* Header - removed back button and made caution icon bigger */}
  //           <CardHeader className="flex flex-row items-center gap-2 py-2 px-4 sticky top-0 bg-background z-10">
  //             <div className="flex items-center gap-2">
  //               <AlertTriangle className="h-7 w-7" style={{ color: redColor }} />
  //               <h2 className="text-lg font-bold">{report.title}</h2>
  //             </div>
  //           </CardHeader>
            
  //           {/* Report Content */}
  //           <ReportCard report={report} onViewMap={handleViewMap} />
  //         </ScrollArea>
  //       </Card>
        
  //       {/* Bottom Navigation */}
  //       <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 flex justify-around">
  //         <Button variant="ghost">
  //           <MapPin className="h-6 w-6" />
  //         </Button>
  //         <Button variant="ghost" className="relative">
  //           <div className="absolute -top-1 -right-1 bg-red-500 h-4 w-4 rounded-full flex items-center justify-center">
  //             <span className="text-[10px] text-white">1</span>
  //           </div>
  //           <svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
  //             <path d="M3.5 8.5L7.5 12.5L11.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
  //             <path d="M7.5 2.5V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
  //           </svg>
  //         </Button>
  //         <Button variant="ghost">
  //           <svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
  //             <path d="M7.5 1C3.91015 1 1 3.91015 1 7.5C1 11.0899 3.91015 14 7.5 14C11.0899 14 14 11.0899 14 7.5C14 3.91015 11.0899 1 7.5 1ZM7.5 2C10.5376 2 13 4.46243 13 7.5C13 10.5376 10.5376 13 7.5 13C4.46243 13 2 10.5376 2 7.5C2 4.46243 4.46243 2 7.5 2ZM7 4V7H10V8H7H6V7V4H7Z" fill="currentColor"></path>
  //           </svg>
  //         </Button>
  //         <Button variant="ghost">
  //           <svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
  //             <path d="M7.5 11C4.80285 11 2.52952 9.62184 1.09622 7.50001C2.52952 5.37816 4.80285 4 7.5 4C10.1971 4 12.4705 5.37816 13.9038 7.50001C12.4705 9.62183 10.1971 11 7.5 11ZM7.5 5C5.22062 5 3.22466 6.1256 2.0044 7.50001C3.22466 8.87441 5.22062 10 7.5 10C9.77938 10 11.7753 8.87441 12.9956 7.50001C11.7753 6.1256 9.77938 5 7.5 5ZM7.5 9.5C8.60457 9.5 9.5 8.60457 9.5 7.5C9.5 6.39543 8.60457 5.5 7.5 5.5C6.39543 5.5 5.5 6.39543 5.5 7.5C5.5 8.60457 6.39543 9.5 7.5 9.5Z" fill="currentColor"></path>
  //           </svg>
  //         </Button>
  //         <Button variant="ghost">
  //           <svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
  //             <path d="M1.85001 7.50005C1.85001 4.37422 4.37427 1.85001 7.50005 1.85001C10.6258 1.85001 13.15 4.37422 13.15 7.50005C13.15 10.6259 10.6258 13.1501 7.50005 13.1501C4.37427 13.1501 1.85001 10.6259 1.85001 7.50005ZM7.50005 0.850006C3.82202 0.850006 0.850006 3.82198 0.850006 7.50005C0.850006 11.1781 3.82202 14.1501 7.50005 14.1501C11.1781 14.1501 14.1501 11.1781 14.1501 7.50005C14.1501 3.82198 11.1781 0.850006 7.50005 0.850006ZM7.50005 4.00001C7.77619 4.00001 8.00005 4.22387 8.00005 4.50001V7.29291L9.85361 9.14647C10.0489 9.34173 10.0489 9.65832 9.85361 9.85358C9.65835 10.0489 9.34177 10.0489 9.14651 9.85358L7.14651 7.85358C7.0527 7.75977 7.00005 7.63263 7.00005 7.50001V4.50001C7.00005 4.22387 7.22391 4.00001 7.50005 4.00001Z" fill="currentColor"></path>
  //           </svg>
  //         </Button>
  //       </div>
  //     </div>
  //   </div>
  // );
} 