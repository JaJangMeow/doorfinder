
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import PropertyCard, { PropertyData } from "@/components/PropertyCard";
import Button from "@/components/Button";
import TabBar from "@/components/TabBar";
import { MapPin, Search, ChevronDown, School, BookOpen, Plus } from "lucide-react";
import { getProperties } from "@/services/propertyService";
import { useToast } from "@/components/ui/use-toast";

const Index: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch properties using react-query
  const { data: properties, isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: getProperties,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load properties. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80" 
            alt="College campus housing" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container mx-auto px-4 z-10 animate-fade-in">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 text-sm bg-primary/20 backdrop-blur-sm text-primary rounded-full mb-4 animate-slide-up">
              Find housing near your college or university
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
              Student Housing Made Simple
            </h1>
            <p className="text-white/90 text-lg mb-8 animate-slide-up" style={{ animationDelay: "200ms" }}>
              Find affordable housing near your campus, posted by students for students. Connect directly with housing owners and find your perfect college home.
            </p>
            
            <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
              <SearchBar 
                onSearch={handleSearch}
                placeholder="Search by college name, location..."
                className="max-w-xl"
              />
            </div>
            
            <div className="mt-6 flex gap-4 animate-slide-up" style={{ animationDelay: "400ms" }}>
              <Button 
                variant="primary" 
                size="lg"
                iconLeft={<Search size={18} />}
                onClick={() => navigate('/search')}
              >
                Find Housing
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-white/20 border-white/20 text-white hover:bg-white/30"
                iconLeft={<Plus size={18} />}
                onClick={() => navigate('/post')}
              >
                Post Your Space
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-float">
          <button 
            onClick={() => {
              const featuredSection = document.getElementById('featured-properties');
              if (featuredSection) {
                featuredSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="flex flex-col items-center text-white/80 hover:text-white transition-colors"
          >
            <span className="text-sm mb-2">Discover More</span>
            <ChevronDown size={24} />
          </button>
        </div>
      </section>
      
      {/* Featured Properties */}
      <section id="featured-properties" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-sm bg-primary/10 text-primary rounded-full mb-3">
              For students, by students
            </span>
            <h2 className="text-3xl font-bold mb-4">Featured Student Housing</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse through recently posted properties near popular college campuses.
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <div 
                  key={index}
                  className="h-72 bg-muted animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.slice(0, 6).map((property, index) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No properties found.</p>
            </div>
          )}
          
          <div className="mt-16 text-center">
            <Button size="lg" onClick={() => navigate('/search')}>
              View All Properties
            </Button>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-sm bg-primary/10 text-primary rounded-full mb-3">
              Simple Process
            </span>
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              DoorFinder makes it easy to find or list student housing in just a few simple steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="glass p-6 rounded-xl text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Search className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Search</h3>
              <p className="text-muted-foreground">
                Search for housing near your college or university campus using simple filters.
              </p>
            </div>
            
            <div className="glass p-6 rounded-xl text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect</h3>
              <p className="text-muted-foreground">
                Connect directly with students who are looking to hand over their apartments.
              </p>
            </div>
            
            <div className="glass p-6 rounded-xl text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Move In</h3>
              <p className="text-muted-foreground">
                Finalize details with the current tenant and move into your new student home.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/post')}
              iconLeft={<Plus size={18} />}
            >
              Post Your Housing
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center text-xl font-semibold text-foreground mb-4">
                <School className="text-primary mr-2" size={24} />
                <span className="text-primary font-bold">Door</span>
                <span>Finder</span>
              </div>
              <p className="text-muted-foreground max-w-md">
                The student housing marketplace. Find your perfect college home with our free, community-driven platform.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:gap-16">
              <div>
                <h3 className="font-medium mb-4">About</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Our Story</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Community</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-4">Support</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Help Center</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact Us</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <h3 className="font-medium mb-4">Get Started</h3>
                <ul className="space-y-2">
                  <li><a href="/post" className="text-muted-foreground hover:text-foreground transition-colors">List Your Housing</a></li>
                  <li><a href="/search" className="text-muted-foreground hover:text-foreground transition-colors">Find Housing</a></li>
                  <li><a href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">Sign Up</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-border text-center">
            <p className="text-muted-foreground">
              © {new Date().getFullYear()} DoorFinder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* TabBar */}
      <TabBar />
    </div>
  );
};

export default Index;
