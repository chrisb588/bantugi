'use client';

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FilterDropdown({ isOpen, onClose }: FilterDropdownProps) {
  const [urgency, setUrgency] = useState("Low");
  const [category, setCategory] = useState("Miscellaneous");
  const [status, setStatus] = useState("In Progress");

  if (!isOpen) return null;

  // Get urgency circle background color
  const getUrgencyCircleColor = (urgencyValue: string) => {
    switch (urgencyValue) {
      case "High":
        return "bg-urgency-high";
      case "Medium":
        return "bg-urgency-medium";
      case "Low":
        return "bg-urgency-low";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <>
      {/* Mobile Filter Dropdown */}
      <div className="fixed inset-0 z-50 pointer-events-auto md:hidden">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/20" 
          onClick={onClose}
        />
        
        {/* Filter Card */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-96 max-w-[90vw]">
          <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 items-center">
            <div className="px-6 w-full">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Filters
              </h3>
              <Separator />
            </div>
            
            <CardContent className="pt-2 space-y-4 w-full">
              {/* Filter Content - Same for both mobile and desktop */}
              {renderFilterContent()}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Desktop Filter Dropdown */}
      <div className="hidden md:block fixed inset-0 z-50 pointer-events-auto">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-transparent" 
          onClick={onClose}
        />
        
        {/* Filter Card - positioned near top center, below search bar */}
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-80">
          <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800">
            <div className="px-4 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Filters
              </h3>
              <Separator />
            </div>
            
            <CardContent className="pt-2 space-y-4">
              {/* Filter Content - Same for both mobile and desktop */}
              {renderFilterContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );

  // Shared filter content for both mobile and desktop
  function renderFilterContent() {
    return (
      <>
        {/* Urgency Filter */}
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-gray-700 dark:text-gray-300">Urgency:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-between gap-2 rounded-full px-3 py-1.5 bg-muted text-sm min-w-[80px] shadow-md">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getUrgencyCircleColor(urgency)}`}></div>
                  <span>{urgency}</span>
                </div>
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-32 shadow-lg">
              <DropdownMenuItem onClick={() => setUrgency("All")}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                  <span>All</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setUrgency("High")}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-urgency-high"></div>
                  <span>High</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setUrgency("Medium")}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-urgency-medium"></div>
                  <span>Medium</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setUrgency("Low")}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-urgency-low"></div>
                  <span>Low</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Category Filter */}
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-gray-700 dark:text-gray-300">Category:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-between gap-2 rounded-full px-3 py-1.5 bg-muted text-sm min-w-[120px] shadow-md">
                <span>{category}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 shadow-lg">
              <DropdownMenuItem onClick={() => setCategory("All")}>
                <span>All</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategory("Environment")}>
                <span>Environment</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategory("Infrastructure")}>
                <span>Infrastructure</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategory("Basic Services")}>
                <span>Basic Services</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategory("Crime and Order")}>
                <span>Crime and Order</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategory("Miscellaneous")}>
                <span>Miscellaneous</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status Filter */}
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-gray-700 dark:text-gray-300">Status:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-between gap-2 rounded-full px-3 py-1.5 bg-muted text-sm min-w-[100px] shadow-md">
                <span>{status}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-32 shadow-lg">
              <DropdownMenuItem onClick={() => setStatus("All")}>
                <span>All</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatus("Unresolved")}>
                <span>Unresolved</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatus("Being Addressed")}>
                <span>Being Addressed</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatus("Resolved")}>
                <span>Resolved</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </>
    );
  }
} 