
import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import Button from "@/components/Button";
import { Search, ArrowLeft, LogIn, UserPlus } from "lucide-react";
import { getProperties } from "@/services/propertyService";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

const BrowsePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState("");
  
  const { data: properties, isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: () => getProperties(),
  });

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // In guest mode, we'll just show results on this page
  };

  const handleAuthPrompt = () => {
    toast({
      title: "Authentication Required",
      description: "Please sign in or create an account to view property details",
    });
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Guest Header */}
      <header className="fixed top-0 left-0 right-0 bg-background/90 backdrop-blur-md z-50 border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')} 
              className="p-2 rounded-full hover:bg-muted transition-colors mr-2"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center text-xl font-semibold text-foreground">
              <span className="text-primary font-bold">Door</span>
              <span>Finder</span>
            </div>
          </div>
          
          {/* Auth Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              iconLeft={<LogIn size={16} />}
              onClick={() => navigate('/login')}
            >
              Sign in
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              iconLeft={<UserPlus size={16} />}
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </div>
        </div>
      </header>

      <div className="pt-24 container mx-auto px-4">
        <div className="max-w-3xl mx-auto mb-8">
          <h1 className="text-2xl font-bold mb-6">Browse Student Housing</h1>
          <div className="mb-6">
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Search locations or colleges..."
              className="w-full"
            />
          </div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-muted-foreground">
              Browsing as a guest. <button onClick={() => navigate('/register')} className="text-primary hover:underline">Create an account</button> for full access.
            </p>
          </div>
        </div>

        {/* Property Listings */}
        <div className="mb-12">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <div 
                  key={index}
                  className="h-64 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div key={property.id} onClick={handleAuthPrompt}>
                  <PropertyCard 
                    property={property} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No properties found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Auth Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
        <div className="container mx-auto flex justify-between items-center">
          <p className="text-sm text-muted-foreground">Guest browsing mode</p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => navigate('/register')}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowsePage;
