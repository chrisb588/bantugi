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

interface CategoryDropdownMenuProps {
  value?: string;
  onValueChange: (value: string) => void;
}

export function CategoryDropdownMenu({
  value,
  onValueChange
}: CategoryDropdownMenuProps) {
  const categories = [
    "Environmental",
    "Infrastructure",
    "Basic Services",
    "Crime and Order",
    "Miscellaneous"
  ];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-between gap-2 rounded-full px-3 py-1 bg-muted text-xs w-full">
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
