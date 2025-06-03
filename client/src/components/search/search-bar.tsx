import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import { debounce } from "lodash";

// Complete: Search bar is now highlighted when focused
interface SearchBarProps {
  onSearch?: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

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
          "flex items-center h-9 w-full min-w-0 rounded-md bg-background/60 border border-input px-3 py-1 shadow-sm",
          isFocused && "ring-2 ring-accent border-accent bg-background/80",
        )
      }
    >
      <Search className="h-4 w-4" />
      <Input
        type="search"
        placeholder="Search"
        className="w-full border-0 h-8 font-semibold focus:ring-0 focus:border-0 focus:outline-none bg-transparent"
        value={searchQuery}
        onChange={handleSearchChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  )
}
