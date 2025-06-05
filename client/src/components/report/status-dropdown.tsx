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
  isLoading?: boolean;
}

export function StatusDropdownMenu({
  value,
  onValueChange,
  isLoading = false
}: StatusDropdownMenuProps) {
  const categories = [
    "Unresolved",
    "Being Addressed",
    "Resolved"
  ];
  
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-700";
      case "Being Addressed":
        return "bg-yellow-100 text-yellow-700";
      case "Unresolved":
        return "bg-red-100 text-red-700";
      default:
        return "bg-muted text-foreground";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isLoading}>
        <button className={`flex items-center text-left justify-between gap-2 rounded-full px-3 py-1 text-xs w-full ${getStatusColor(value)}`}>
          <span>
            {isLoading ? (
              <span className="flex items-center gap-1">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Updating...</span>
              </span>
            ) : (
              value || "-----"
            )}
          </span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40">
        {categories.map((category) => (
          <DropdownMenuItem 
            key={category}
            onClick={() => onValueChange(category)}
            className={`flex items-center gap-2 ${category === value ? 'font-medium' : ''}`}
          >
            <div className={`h-2 w-2 rounded-full ${
              category === "Resolved" ? "bg-green-600" : 
              category === "Being Addressed" ? "bg-yellow-600" : 
              "bg-red-600"
            }`} />
            {category}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
