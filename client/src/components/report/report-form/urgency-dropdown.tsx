import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UrgencyDropdownMenuProps {
  value?: "Low" | "Medium" | "High";
  onValueChange: (value: "Low" | "Medium" | "High") => void;
}

export function UrgencyDropdownMenu({ value, onValueChange }: UrgencyDropdownMenuProps) {
  const urgencyLevels: ["Low", "Medium", "High"] = ["Low", "Medium", "High"];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-between gap-2 rounded-full px-3 py-1 bg-muted text-xs w-full">
          <span>{value || "Select urgency"}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32">
        {urgencyLevels.map((level) => (
          <DropdownMenuItem 
            key={level}
            onClick={() => onValueChange(level)}
          >
            {level}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}