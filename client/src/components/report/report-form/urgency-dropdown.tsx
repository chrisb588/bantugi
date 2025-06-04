import { ChevronDown } from "lucide-react"; // Remove unused ChevronUp
import { cn } from "@/lib/utils";

// Remove unused imports
// import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  // DropdownMenuGroup,
  DropdownMenuItem,
  // DropdownMenuLabel,
  // DropdownMenuPortal,
  // DropdownMenuSeparator,
  // DropdownMenuShortcut,
  // DropdownMenuSub,
  // DropdownMenuSubContent,
  // DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UrgencyDropdownMenuProps {
  value?: "Low" | "Medium" | "High";
  onValueChange: (value: "Low" | "Medium" | "High") => void;
}

const urgencyColors = {
  'Low': 'bg-urgency-low',
  'Medium': 'bg-urgency-medium',
  'High': 'bg-urgency-high',
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
            <div className={cn("w-2 h-2 rounded-full", urgencyColors[level])}></div>
            <span>{level}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}