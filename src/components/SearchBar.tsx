
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  className,
  placeholder = "Search for properties...",
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchText, setSearchText] = useState("");

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div
      className={cn(
        "relative flex items-center w-full max-w-md transition-all duration-300",
        isFocused ? "scale-[1.02]" : "",
        className
      )}
    >
      <div
        className={cn(
          "glass absolute inset-0 rounded-full transition-all duration-500",
          isFocused
            ? "ring-2 ring-primary/30 shadow-lg"
            : "ring-1 ring-border/50 shadow-sm"
        )}
      />
      <Search
        size={18}
        className={cn(
          "absolute left-4 transition-colors duration-300",
          isFocused ? "text-primary" : "text-muted-foreground"
        )}
      />
      <input
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="pl-12 pr-4 py-3 h-12 w-full bg-transparent rounded-full text-foreground focus:outline-none placeholder:text-muted-foreground/70 relative z-10"
        {...props}
      />
    </div>
  );
};

export default SearchBar;
