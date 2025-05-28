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
    <div className="fixed inset-0 z-50 pointer-events-auto md:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20" 
        onClick={onClose}
      />
      
      {/* Filter Card */}
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-96 max-w-[90vw]">
        <Card className="bg-white shadow-xl border border-gray-200">
          <div className="px-6 pt-0">
            <h3 className="text-xl font-semibold text-gray-900 drop-shadow-sm mb-2">
              Filters
            </h3>
            <Separator />
          </div>
          
          <CardContent className="pt-2 space-y-2">
            {/* Urgency Filter */}
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-gray-700 drop-shadow-sm">Urgency:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-between gap-2 rounded-full px-3 py-1.5 bg-muted text-sm min-w-[80px] shadow-md">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getUrgencyCircleColor(urgency)} drop-shadow-sm`}></div>
                      <span className="drop-shadow-sm">{urgency}</span>
                    </div>
                    <ChevronDown className="h-3 w-3 drop-shadow-sm" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-32 shadow-lg">
                  <DropdownMenuItem onClick={() => setUrgency("High")}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-urgency-high drop-shadow-sm"></div>
                      <span className="drop-shadow-sm">High</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setUrgency("Medium")}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-urgency-medium drop-shadow-sm"></div>
                      <span className="drop-shadow-sm">Medium</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setUrgency("Low")}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-urgency-low drop-shadow-sm"></div>
                      <span className="drop-shadow-sm">Low</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Category Filter */}
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-gray-700 drop-shadow-sm">Category:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-between gap-2 rounded-full px-3 py-1.5 bg-muted text-sm min-w-[120px] shadow-md">
                    <span className="drop-shadow-sm">{category}</span>
                    <ChevronDown className="h-3 w-3 drop-shadow-sm" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40 shadow-lg">
                  <DropdownMenuItem onClick={() => setCategory("Environment")}>
                    <span className="drop-shadow-sm">Environment</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCategory("Infrastructure")}>
                    <span className="drop-shadow-sm">Infrastructure</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCategory("Basic Services")}>
                    <span className="drop-shadow-sm">Basic Services</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCategory("Crime and Order")}>
                    <span className="drop-shadow-sm">Crime and Order</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCategory("Miscellaneous")}>
                    <span className="drop-shadow-sm">Miscellaneous</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Status Filter */}
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-gray-700 drop-shadow-sm">Status:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-between gap-2 rounded-full px-3 py-1.5 bg-muted text-sm min-w-[100px] shadow-md">
                    <span className="drop-shadow-sm">{status}</span>
                    <ChevronDown className="h-3 w-3 drop-shadow-sm" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-32 shadow-lg">
                  <DropdownMenuItem onClick={() => setStatus("Unresolved")}>
                    <span className="drop-shadow-sm">Unresolved</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatus("In Progress")}>
                    <span className="drop-shadow-sm">In Progress</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatus("Resolved")}>
                    <span className="drop-shadow-sm">Resolved</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 