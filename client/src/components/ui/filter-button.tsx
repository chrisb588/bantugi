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
      size="lg" 
      className={`rounded-full shadow-lg drop-shadow-md h-14 w-14 ${className || ''}`}
      onClick={handleClick}
    >
      <ListFilter className="h-12 w-12 drop-shadow-sm" />
    </Button>
  );
} 