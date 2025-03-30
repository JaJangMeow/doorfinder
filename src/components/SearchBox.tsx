import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MapPin, Search, X, Home, Building, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const popularSearches = [
  "New York",
  "San Francisco",
  "Los Angeles",
  "Chicago",
  "Boston",
];

interface SearchBoxProps {
  className?: string;
  expanded?: boolean;
  variant?: "default" | "minimal" | "inline";
  showPopularSearches?: boolean;
  onSearch?: (term: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  className,
  expanded = false,
  variant = "default",
  showPopularSearches = false,
  onSearch,
}) => {
  const [searchParams] = useSearchParams();
  const initialTerm = searchParams.get("term") || "";
  const [searchTerm, setSearchTerm] = useState(initialTerm);
  const [isFocused, setIsFocused] = useState(expanded);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchTerm.trim().length > 2) {
      fetchSuggestions(searchTerm);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const fetchSuggestions = async (term: string) => {
    try {
      // Get suggestions from properties table
      const { data, error } = await supabase
        .from("properties")
        .select("address")
        .ilike("address", `%${term}%`)
        .limit(5);

      if (error) {
        throw error;
      }

      // Extract unique addresses
      const uniqueAddresses = Array.from(
        new Set(data.map((item) => item.address))
      );
      setSuggestions(uniqueAddresses);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      if (onSearch) {
        onSearch(searchTerm);
      } else {
        navigate(`/search?term=${encodeURIComponent(searchTerm)}`);
      }
      setIsFocused(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setSuggestions([]);
  };

  return (
    <div
      className={cn(
        "relative",
        {
          "w-full max-w-xl mx-auto": variant === "default",
          "w-full": variant === "inline",
          "w-auto": variant === "minimal",
        },
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 p-2 transition-all duration-300",
          {
            "glass rounded-lg shadow-lg": variant === "default",
            "bg-muted/50 rounded-md": variant === "inline",
            "bg-background/80 backdrop-blur-sm border rounded-full shadow-sm": variant === "minimal",
          },
          isFocused && "shadow-md"
        )}
      >
        <div
          className={cn("relative flex-1", {
            "min-w-[300px]": variant === "minimal" && isFocused,
          })}
        >
          <Input
            type="text"
            placeholder="Search city, neighborhood, or address"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={handleKeyDown}
            className={cn(
              "pl-10 border-none shadow-none bg-transparent",
              {
                "h-11": variant === "default",
                "h-9": variant === "inline" || variant === "minimal",
              }
            )}
          />
          <MapPin
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={variant === "minimal" ? 16 : 18}
          />
          {searchTerm && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {variant !== "minimal" && (
          <Button
            className="btn-hover-effect"
            size={variant === "default" ? "lg" : "default"}
            onClick={handleSearch}
          >
            <Search className="mr-2" size={variant === "default" ? 18 : 16} />
            Search
          </Button>
        )}

        {variant === "minimal" && (
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full"
            onClick={handleSearch}
          >
            <Search size={16} />
          </Button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isFocused && (suggestions.length > 0 || (showPopularSearches && popularSearches.length > 0)) && (
        <div className="absolute w-full mt-1 rounded-md bg-background border shadow-lg z-10 animate-fade-in">
          {suggestions.length > 0 ? (
            <ul className="py-2">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-2"
                  onClick={() => {
                    setSearchTerm(suggestion);
                    handleSearch();
                  }}
                >
                  <Building size={16} className="text-muted-foreground" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          ) : showPopularSearches ? (
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                Popular Searches
              </div>
              <ul className="py-1">
                {popularSearches.map((search, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-2 rounded-md"
                    onClick={() => {
                      setSearchTerm(search);
                      handleSearch();
                    }}
                  >
                    <MapPin size={16} className="text-muted-foreground" />
                    <span>{search}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBox; 