'use client';

import { Button } from "@/components/ui/button";
import { ListFilter } from "lucide-react";

interface FilterButtonProps {
  onClick?: () => void;
  className?: string;
}

export function FilterButton({ onClick, className }: FilterButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Button 
      variant="default" 
      className={`rounded-full shadow-lg h-14 w-14 md:h-12 md:w-12 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 ${className || ''}`}
      onClick={handleClick}
    >
      <ListFilter className="h-5 w-5 md:h-4 md:w-4 text-gray-500 dark:text-gray-400" />
    </Button>
  );
} 