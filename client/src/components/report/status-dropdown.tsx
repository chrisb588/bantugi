import { ChevronDown } from "lucide-react"; // Remove unused ChevronUp

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

interface StatusDropdownMenuProps {
  value?: string;
  onValueChange: (value: string) => void;
}

export function StatusDropdownMenu({
  value,
  onValueChange
}: StatusDropdownMenuProps) {
  const categories = [
    "Unresolved",
    "Being Addressed",
    "Resolved"
  ];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center text-left justify-between gap-2 rounded-full px-3 py-1 bg-muted text-xs w-full">
          <span>{value || "-----"}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32">
        {categories.map((category) => (
          <DropdownMenuItem 
            key={category}
            onClick={() => onValueChange(category)}
          >
            {category}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
