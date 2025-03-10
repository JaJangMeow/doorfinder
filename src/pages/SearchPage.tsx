
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import TabBar from "@/components/TabBar";
import SearchBar from "@/components/SearchBar";
import { Search } from "lucide-react";

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    console.log("Searching for:", term);
    // In a real app, this would trigger a search API call
  };

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Find Your Ideal Property</h1>
          
          <div className="mb-8">
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Search by location, property type..."
              className="w-full"
            />
          </div>
          
          <div className="py-12 text-center">
            <div className="inline-flex flex-col items-center text-muted-foreground">
              <Search size={48} className="mb-4 opacity-20" />
              <p className="text-lg">Enter a search term to find properties</p>
            </div>
          </div>
        </div>
      </div>
      <TabBar />
    </div>
  );
};

export default SearchPage;
