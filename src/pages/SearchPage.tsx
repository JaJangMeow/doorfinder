
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import TabBar from "@/components/TabBar";
import SearchBar from "@/components/SearchBar";
import PropertyCard, { PropertyData } from "@/components/PropertyCard";
import { useToast } from "@/components/ui/use-toast";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [searchResults, setSearchResults] = useState<PropertyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch properties on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*');
          
        if (error) throw error;
        
        const formattedProperties = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          address: item.address,
          price: item.price,
          bedrooms: item.bedrooms,
          availableFrom: item.available_from,
          imageUrl: item.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2673&q=80'
        }));
        
        setProperties(formattedProperties);
        // Initially no search, so all properties are shown
        setSearchResults(formattedProperties);
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

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      // If search is empty, show all properties
      setSearchResults(properties);
      return;
    }
    
    // Filter properties based on search term
    const filtered = properties.filter(
      property => 
        property.title.toLowerCase().includes(term.toLowerCase()) ||
        property.address.toLowerCase().includes(term.toLowerCase()) ||
        String(property.bedrooms).includes(term) ||
        String(property.price).includes(term)
    );
    
    setSearchResults(filtered);
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
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((index) => (
                <div 
                  key={index}
                  className="h-72 bg-muted animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {searchResults.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="inline-flex flex-col items-center text-muted-foreground">
                <Search size={48} className="mb-4 opacity-20" />
                <p className="text-lg">No properties found matching "{searchTerm}"</p>
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
