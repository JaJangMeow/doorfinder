
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import TabBar from "@/components/TabBar";
import SearchBar from "@/components/SearchBar";
import PropertyCard, { PropertyData } from "@/components/PropertyCard";
import { useToast } from "@/components/ui/use-toast";
import { Search, BookOpen, School } from "lucide-react";
import { searchPropertiesByCollege } from "@/services/propertyService";

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initial load of properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        // Start with all properties
        const data = await searchPropertiesByCollege("");
        setProperties(data);
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast({
          title: "Error",
          description: "Failed to load properties. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [toast]);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    try {
      setIsLoading(true);
      const results = await searchPropertiesByCollege(term);
      setProperties(results);
    } catch (error) {
      console.error('Error searching properties:', error);
      toast({
        title: "Error",
        description: "Failed to search properties. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-6">
            <School className="text-primary mr-3" size={28} />
            <h1 className="text-3xl font-bold">Find Student Housing</h1>
          </div>
          
          <div className="mb-8">
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Search by college name (e.g., KJC, Kristu Jayanti College)..."
              className="w-full"
            />
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((index) => (
                <div 
                  key={index}
                  className="h-72 bg-muted animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="inline-flex flex-col items-center text-muted-foreground">
                <BookOpen size={48} className="mb-4 opacity-20" />
                <p className="text-lg">No properties found matching "{searchTerm}"</p>
                <p className="mt-2">Try searching for a different college or location</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <TabBar />
    </div>
  );
};

export default SearchPage;
