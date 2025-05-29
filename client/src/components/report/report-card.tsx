'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { MapPin, MessageSquare, ChevronRight, AlertTriangle, ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Report from "@/interfaces/report";
import urgencyIcon from '@/constants/urgency-icon';
import { formatArea } from '@/lib/utils';
import { useMapContext } from '@/context/map-context';
import { Marker } from 'leaflet';

interface ReportCardProps {
  report: Report;
  className?: string;
  onViewMap?: () => void;
  onBack?: () => void;
}

export function ReportCard({ report, className, onViewMap, onBack, ...props }: ReportCardProps) {
  const [showComments, setShowComments] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isViewingMap, setIsViewingMap] = useState(false);
  
  const { mapInstanceRef } = useMapContext();

  useEffect(() => {
    if (!mapInstanceRef.current || !isViewingMap) return;

    let marker: Marker | null = null;

    if (report.location && report.location.coordinates && mapInstanceRef.current) {
      const { coordinates } = report.location;

      // Create and add new marker
      marker = new Marker([coordinates.lat, coordinates.lng], {
        draggable: false,
        title: report.title
      });

      marker.addTo(mapInstanceRef.current);
      mapInstanceRef.current.setView([coordinates.lat, coordinates.lng], 18);
    }

    return () => {
      if (marker) {
        marker.remove();
      }
    };
  }, [isViewingMap, report, mapInstanceRef]);

  const handleViewMap = () => {
    setIsViewingMap(true);
    if (onViewMap) onViewMap();
  };

  const handleBackFromMap = () => {
    setIsViewingMap(false);
  };
  
  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Handle comment submission - can be implemented later
    console.log("Comment submitted:", commentText);

    setCommentText("");
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === report.images!.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? report.images!.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className={cn("w-full max-w-lg flex flex-col gap-4 -mt-12", className)} {...props}>
      <Card className={cn(
        "h-[85vh] min-h-[400px] max-h-[800px]",
        isViewingMap ? "pointer-events-none hidden" : "pointer-events-auto"
        )}> {/* Set fixed height here */}
        <ScrollArea className="h-full"> {/* Make ScrollArea full height of card */}
          <CardContent className="flex flex-col items-start py-4">
            {/* Back button */}
            {onBack && (
              <div className="flex justify-start w-full">
                <Button
                  variant="ghost"
                  style={{ height: '32px', width: '32px', padding: '0' }}
                  onClick={onBack}
                >
                  <ChevronLeft 
                  size={24}
                  style={{ height: '24px', width: '24px' }}
                  className="text-foreground hover:text-secondary"
                  />
                </Button>
              </div>
            )}
            
            <div className="flex items-center">
              <div className={cn(
                "p-2 rounded-full self-start mt-1", 
              )}>
                {urgencyIcon[report.urgency]}
              </div>
              <div className="text-lg text-foreground font-bold">{report.title}</div>
            </div>
            
            {/* Complete: Username is now shown below the title and icon */}
            <div className="text-sm text-muted-foreground mb-3">
              Posted by {report.creator.username}
            </div>
              {/* Report Images */}
              <div className="relative w-full h-64 rounded-lg overflow-hidden mb-5">
                {report.images && report.images.length > 0 ? (
                  <Image
                    src={report.images[currentImageIndex] || "/img/placeholder-image.jpg"}
                    alt={report.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
                    <div className="text-center">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No images provided</p>
                    </div>
                  </div>
                )}
                
                {report.images && report.images.length > 1 && (
                  <>
                    {/* Image navigation buttons - fixed alignment */}
                    {currentImageIndex != 0 && (<div className="absolute inset-y-0 left-0 flex items-center pl-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full bg-white hover:bg-white shadow-md border-0"
                        onClick={prevImage}
                      >
                        <ChevronRight className="h-4 w-4 rotate-180 text-primary" />
                      </Button>
                    </div>)}
                    {currentImageIndex != report.images.length-1 &&(<div className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full bg-white hover:bg-white shadow-md border-0"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4 text-primary" />
                      </Button>
                    </div>)}
                    
                    {/* Image indicators */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {report.images.map((_, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "w-2 h-2 rounded-full transition-all", 
                            i === currentImageIndex ? "bg-background" : "bg-background/60"
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {/* Location with View in Map button */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {report.location ? formatArea(report.location.address) : "Unknown Location"}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs flex items-center gap-1.5 px-3 py-1 h-7"
                  onClick={handleViewMap}
                >
                  <MapPin className="h-3 w-3" />
                  View in Map
                </Button>
              </div>
              
              {/* Category */}
              <div className="flex mb-4">
                <span className="text-xs font-semibold text-slate-700 bg-muted px-3 py-1 rounded-full whitespace-nowrap">
                  {report.category}
                </span>
              </div>
              
              {/* TODO: Do we allow users to edit the status?
                      If so kay i-add lang ang dropdown*/}

              {/* Status */}
              <div className="flex items-center gap-2 mb-5">
                <span className="h-2 w-2 rounded-full text-primary"></span>
                <span className="text-sm font-medium text-primary">
                  {report.status}
                </span>
              </div>
              
              {/* Description */}
              <div className="mb-5">
                <p className="text-sm">{report.description}</p>
              </div>

              {/* COMPLETED: Include posted by username*/}
              
              <Separator className="my-4 w-full" />
              
              {/* Comments Section */}
              <div className="w-full">
                <div className="flex items-center justify-between mb-3">
                  <Button 
                    variant="ghost" 
                    className="p-0 h-auto flex items-center"
                    onClick={toggleComments}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Comments</span>
                  </Button>
                </div>
                
                {showComments && (
                  <div className="space-y-4 mt-3 w-full">
                    {/* Comment input field - styled like searchbar */}
                    <form onSubmit={handleCommentSubmit} className="w-full mb-4">
                      <div className="flex items-center w-full rounded-md bg-muted px-3 py-1 shadow-inner">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mr-2" />
                        <Input 
                          type="text"
                          placeholder="Type a comment"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="w-full border-0 h-8 bg-transparent font-medium text-xs focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                        />
                        <Button 
                          type="submit"
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6 p-1"
                          disabled={!commentText.trim()}
                        >
                          <span className="sr-only">Submit</span>
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.20308 1.04312C1.00481 0.954998 0.772341 1.0048 0.627577 1.16641C0.482813 1.32802 0.458794 1.56455 0.568117 1.75196L3.92115 7.50002L0.568117 13.2481C0.458794 13.4355 0.482813 13.672 0.627577 13.8336C0.772341 13.9952 1.00481 14.045 1.20308 13.9569L14.7031 7.95693C14.8836 7.87668 15 7.69762 15 7.50002C15 7.30243 14.8836 7.12337 14.7031 7.04312L1.20308 1.04312ZM4.84553 7.10002L2.21234 2.586L13.2689 7.50002L2.21234 12.414L4.84552 7.90002H9C9.22092 7.90002 9.4 7.72094 9.4 7.50002C9.4 7.27911 9.22092 7.10002 9 7.10002H4.84553Z" fill="currentColor"></path>
                          </svg>
                        </Button>
                      </div>
                    </form>
                    
                    {/* Comments list */}
                    {report.comments ? (report.comments.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-3 pb-3 border-b border-gray-100">
                        <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-200">
                          <Image
                            src={comment.creator.profilePicture || '/img/placeholder-avatar.png'}
                            alt={comment.creator.username}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{comment.creator.username}</span>
                            {comment.creator.location && (
                              <span className="text-xs text-gray-500">{formatArea(comment.creator.location!.address)}</span>
                            )}
                            <p className="text-sm mt-1">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))) : (
                      <p className="text-sm text-gray-500">No comments.</p>
                    )}
                  </div>
                )}
              </div>
          </CardContent>
        </ScrollArea> 
      </Card>
      {/* Map back button */}
      {isViewingMap && (
        <div className="fixed bottom-20 left-4 z-[1000] flex gap-2 pointer-events-auto">
          <Button
            variant="outline"
            onClick={handleBackFromMap}
          >
            Back to Report
          </Button>
        </div>
      )}
    </div>
  );
} 