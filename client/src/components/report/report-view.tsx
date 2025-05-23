'use client';

import { useState } from 'react';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, MessageSquare, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface Author {
  name: string;
  location?: string;
  avatar?: string;
}

export interface Comment {
  id: string;
  author: Author;
  text: string;
  datePosted: string;
}

export interface Report {
  id: string;
  title: string;
  category: string;
  location: string;
  status: "Unresolved" | "In Progress" | "Resolved";
  description: string;
  images: string[];
  datePosted: string;
  author: Author;
  comments: Comment[];
}

interface ReportViewProps {
  report: Report;
  onViewMap?: () => void;
}

export function ReportView({ report, onViewMap }: ReportViewProps) {
  const [showComments, setShowComments] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
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
      prevIndex === report.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? report.images.length - 1 : prevIndex - 1
    );
  };

  // Define a consistent red color
  const redColor = "#B8180D";

  return (
    <CardContent className="px-5 py-3">
      {/* Report Images */}
      <div className="relative w-full h-64 rounded-lg overflow-hidden mb-5">
        {report.images.length > 0 && (
          <Image
            src={report.images[currentImageIndex] || "/img/placeholder-image.jpg"}
            alt={report.title}
            fill
            className="object-cover"
          />
        )}
        
        {report.images.length > 1 && (
          <>
            {/* Image navigation buttons - fixed alignment */}
            <div className="absolute inset-y-0 left-0 flex items-center pl-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-white hover:bg-white shadow-md border-0"
                onClick={prevImage}
              >
                <ChevronRight className="h-4 w-4 rotate-180" style={{ color: redColor }} />
              </Button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-white hover:bg-white shadow-md border-0"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" style={{ color: redColor }} />
              </Button>
            </div>
            
            {/* Image indicators */}
            <div className="absolute bottom-2 right-2 flex gap-1">
              {report.images.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-2 h-2 rounded-full transition-all", 
                    i === currentImageIndex ? "bg-white" : "bg-white/60"
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
          <span className="text-sm">{report.location}</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs flex items-center gap-1.5 px-3 py-1 h-7"
          onClick={onViewMap}
        >
          <MapPin className="h-3 w-3" />
          View in Map
        </Button>
      </div>
      
      {/* Category - moved below location */}
      <div className="flex mb-4">
        <span className="text-xs font-semibold text-slate-700 bg-muted px-3 py-1 rounded-full whitespace-nowrap">
          {report.category}
        </span>
      </div>
      
      {/* Status */}
      <div className="flex items-center gap-2 mb-5">
        <span 
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: redColor }}
        ></span>
        <span 
          className="text-sm font-medium"
          style={{ color: redColor }}
        >
          {report.status}
        </span>
      </div>
      
      {/* Description */}
      <div className="mb-5">
        <p className="text-sm">{report.description}</p>
      </div>
      
      <Separator className="my-4" />
      
      {/* Comments Section */}
      <div>
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
          <div className="space-y-4 mt-3">
            {/* Comment input field - styled like searchbar */}
            <form onSubmit={handleCommentSubmit} className="flex mb-4">
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
            {report.comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3 pb-3 border-b border-gray-100">
                <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-200">
                  {comment.author.avatar && (
                    <Image
                      src={comment.author.avatar}
                      alt={comment.author.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{comment.author.name}</span>
                    {comment.author.location && (
                      <span className="text-xs text-gray-500">{comment.author.location}</span>
                    )}
                    <p className="text-sm mt-1">{comment.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CardContent>
  );
} 