import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Complete: Search bar is now highlighted when focused
interface SearchBarProps {
  onSearch?: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };
  
  return (
    <div 
      className={
        cn(
          "flex items-center h-14 md:h-12 w-full min-w-0 rounded-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-4 md:px-3 shadow-lg",
          isFocused && "ring-2 ring-primary border-primary",
        )
      }
    >
      <Search className="h-5 w-5 md:h-4 md:w-4 text-gray-500 dark:text-gray-400 mr-3 md:mr-2 flex-shrink-0" />
      <Input
        type="search"
        placeholder="Search reports..."
        className="w-full border-0 h-full font-medium focus:ring-0 focus:border-0 focus:outline-none bg-transparent text-gray-700 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-400 md:text-sm"
        value={searchQuery}
        onChange={handleSearchChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  )
}
