import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import { debounce } from "lodash";

// TODO: Make this so that the entire search bar gets highlighted
// and not just the input field
interface SearchBarProps {
  onSearch?: (query: string) => void;
  className?: string;
}

export default function SearchBar({ onSearch, className }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce search to avoid too many API calls
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      onSearch?.(query);
    }, 300),
    [onSearch]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };
  
  return (
    <div 
      className={
        cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex items-center h-9 w-full min-w-0 rounded-md bg-muted px-3 py-1 text-base shadow-inner transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        )
      }
    >
      <Search className="h-4 w-4" />
      <Input
        type="search"
        placeholder="Search"
        className="w-full border-0 h-8 font-semibold"
        value={searchQuery}
        onChange={handleSearchChange}
      />
    </div>
  )
}