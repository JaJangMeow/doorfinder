
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import PropertyCard, { PropertyData } from "@/components/PropertyCard";
import Button from "@/components/Button";
import { MapPin, Search, ChevronDown } from "lucide-react";

// Mock data - in a real app this would come from an API
const mockProperties: PropertyData[] = [
  {
    id: "1",
    title: "Modern Downtown Apartment",
    address: "123 Main St, New York, NY 10001",
    price: 2500,
    bedrooms: 2,
    availableFrom: "2023-08-01",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
  },
  {
    id: "2",
    title: "Spacious Family Home with Garden",
    address: "456 Oak Ave, San Francisco, CA 94117",
    price: 4200,
    bedrooms: 4,
    availableFrom: "2023-09-01",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
  },
  {
    id: "3",
    title: "Cozy Studio in Historic Building",
    address: "789 Maple St, Chicago, IL 60611",
    price: 1200,
    bedrooms: 1,
    availableFrom: "2023-07-15",
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
  },
  {
    id: "4",
    title: "Luxury Penthouse with City Views",
    address: "101 Tower Dr, Miami, FL 33101",
    price: 6500,
    bedrooms: 3,
    availableFrom: "2023-10-01",
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
  },
  {
    id: "5",
    title: "Charming Cottage Near Lake",
    address: "222 Lakeside Ln, Seattle, WA 98101",
    price: 2800,
    bedrooms: 2,
    availableFrom: "2023-08-15",
    imageUrl: "https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
  },
  {
    id: "6",
    title: "Industrial Loft in Art District",
    address: "333 Gallery Ave, Portland, OR 97201",
    price: 2100,
    bedrooms: 1,
    availableFrom: "2023-07-15",
    imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
  }
];

const Index: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // In a real app, this would trigger an API call
    console.log("Searching for:", term);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2673&q=80" 
            alt="Modern living space" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container mx-auto px-4 z-10 animate-fade-in">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 text-sm bg-primary/20 backdrop-blur-sm text-primary rounded-full mb-4 animate-slide-up">
              Find your perfect home with ease
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
              Discover Your Next Home
            </h1>
            <p className="text-white/90 text-lg mb-8 animate-slide-up" style={{ animationDelay: "200ms" }}>
              Browse through our curated listings of properties, from cozy studios to spacious family homes, and find the perfect place to call home.
            </p>
            
            <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
              <SearchBar 
                onSearch={handleSearch}
                placeholder="Search by location, property type..."
                className="max-w-xl"
              />
            </div>
            
            <div className="mt-6 flex gap-4 animate-slide-up" style={{ animationDelay: "400ms" }}>
              <Button 
                variant="primary" 
                size="lg"
                iconLeft={<Search size={18} />}
              >
                Browse Properties
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-white/20 border-white/20 text-white hover:bg-white/30"
                iconLeft={<MapPin size={18} />}
              >
                Map View
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
              Hand-picked properties
            </span>
            <h2 className="text-3xl font-bold mb-4">Featured Listings</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse through our selection of carefully curated properties that match different preferences and budgets.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockProperties.map((property, index) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                className="animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              />
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Button size="lg">
              View All Properties
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
                <span className="text-primary font-bold">Door</span>
                <span>Finder</span>
              </div>
              <p className="text-muted-foreground max-w-md">
                Find your perfect rental property with our free, community-driven platform. List or find with ease.
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
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">List a Property</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Find Properties</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Sign Up</a></li>
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
    </div>
  );
};

export default Index;
