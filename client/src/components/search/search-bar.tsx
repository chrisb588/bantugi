import { Search } from "lucide-react";
import { useEffect } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Complete: Search bar is now highlighted when focused
interface SearchBarProps {
  onSearch?: (query: string) => void;
  value?: string;
  onFocus?: () => void,
  onBlur?: () => void,
}

export default function SearchBar({ onSearch, value = "", onFocus, onBlur }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.();
    e.stopPropagation(); // Prevent event from bubbling up
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.();
    e.stopPropagation(); // Prevent event from bubbling up
  };
  
  return (
    <div 
      className={
        cn(
          "flex items-center h-12 w-full min-w-0 rounded-full bg-background dark:bg-gray-900 border dark:border-gray-800 px-3 shadow-lg",
          isFocused && "ring-2 ring-primary border-primary",
        )
      }
    >
      <Search className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
      <Input
        type="search"
        placeholder="Search reports..."
        className="w-full border-0 h-full font-medium focus:ring-0 focus:border-0 focus:outline-none bg-transparent text-gray-700 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm"
        value={searchQuery}
        onChange={handleSearchChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </div>
  )
}
