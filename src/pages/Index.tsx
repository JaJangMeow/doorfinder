import React, { useRef, useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import Button from "@/components/Button";
import TabBar from "@/components/TabBar";
import { Building, ChevronDown, BookOpen, Search, MapPin, Clock, Globe, Map, Layers, Grid, List } from "lucide-react";
import { getProperties } from "@/services/propertyService";
import { useToast } from "@/components/ui/use-toast";
import PropertyMapView from "@/components/PropertyMapView";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const {
    toast
  } = useToast();
  const {
    data: properties,
    isLoading,
    error
  } = useQuery({
    queryKey: ['properties'],
    queryFn: () => getProperties(),
    staleTime: 60000, // 1 minute
  });
  
  // Get user's location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Don't show error toast for this since it's not critical
        }
      );
    }
  }, []);

  // Parallax scroll effect for hero section
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollY = window.scrollY;
        const heroImg = heroRef.current.querySelector('img') as HTMLImageElement | null;
        const heroContent = heroRef.current.querySelector('.hero-content') as HTMLElement | null;
        
        if (heroImg && heroContent) {
          // Parallax effect for background image
          heroImg.style.transform = `translateY(${scrollY * 0.4}px)`;
          
          // Fade out hero content on scroll
          const opacity = 1 - (scrollY / 400);
          heroContent.style.opacity = opacity > 0 ? String(opacity) : '0';
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load properties. Please try again later.",
        variant: "destructive"
      });
    }
  }, [error, toast]);
  
  const handleOurStoryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
      title: "Our Story",
      description: "We're a team of students who built DoorFinder to make finding student housing easier and more accessible.",
      duration: 5000
    });
  };
  
  const handleHowItWorksClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
      title: "How It Works",
      description: "Browse available properties, connect with landlords, and find your perfect student housing in just a few taps.",
      duration: 3000
    });
  };

  const handleToggleMapFullscreen = useCallback(() => {
    setIsMapFullscreen(prev => !prev);
  }, []);
  
  return <div className="min-h-screen pb-16 overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section with Dynamic Background and Enhanced CTA */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-background z-10" />
          <img src="/lovable-uploads/83895367-873f-49ab-ab0f-09cf6a9ea424.png" alt="Student housing illustration" className="w-full h-full object-cover opacity-90 scale-110" />
        </div>
        
        <div className="container mx-auto px-4 z-10 hero-content">
          <div className="max-w-lg bg-white/80 backdrop-blur-md p-8 rounded-lg shadow-sm border border-white/20">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-slide-up">
              Find Your Perfect <span className="text-primary">Student Housing</span>
            </h1>
            <p className="text-muted-foreground mb-6 animate-slide-up" style={{
            animationDelay: "100ms"
          }}>
              Discover affordable housing near your campus with our interactive map and advanced search features.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <Button 
                variant="primary" 
                size="lg" 
                iconLeft={<Search size={18} />}
                onClick={() => navigate('/search')}
                className="shadow-md"
              >
                Search Properties
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                iconLeft={<Map size={18} />}
                onClick={() => {
                  const mapSection = document.getElementById('map-view');
                  if (mapSection) {
                    mapSection.scrollIntoView({
                      behavior: 'smooth'
                    });
                    setViewMode('map');
                  }
                }}
                className="backdrop-blur-sm bg-white/70"
              >
                Explore Map
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-float">
          <button onClick={() => {
          const featuredSection = document.getElementById('featured-properties');
          if (featuredSection) {
            featuredSection.scrollIntoView({
              behavior: 'smooth'
            });
          }
        }} className="flex flex-col items-center text-primary hover:text-primary/80 transition-colors bg-white/80 p-3 rounded-full shadow-sm">
            <ChevronDown size={24} />
          </button>
        </div>
      </section>
      
      {/* Featured Properties Section with View Toggle */}
      <section id="featured-properties" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-2">
            <h2 className="text-2xl font-semibold">Featured Housing</h2>

            <div className="flex items-center gap-2">
              <div className="bg-muted rounded-lg p-1 flex items-center">
                <button 
                  onClick={() => setViewMode('grid')} 
                  className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-muted-foreground'}`}
                >
                  <Grid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('map')} 
                  className={`p-1 rounded ${viewMode === 'map' ? 'bg-white shadow-sm' : 'text-muted-foreground'}`}
                >
                  <Map size={18} />
                </button>
              </div>
              
              <Button variant="ghost" onClick={() => navigate('/search')} className="text-primary -ml-2 sm:ml-0">
                View all
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(index => (
                  <div key={index} className="h-64 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="h-[400px] bg-muted animate-pulse rounded-lg" />
            )
          ) : properties && properties.length > 0 ? (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                  {properties.slice(0, 6).map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
              
              {/* Map View */}
              {viewMode === 'map' && (
                <div id="map-view" className="h-[500px]">
                  <PropertyMapView 
                    properties={properties} 
                    userLocation={userLocation}
                    isFullscreen={isMapFullscreen}
                    onToggleFullscreen={handleToggleMapFullscreen}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <Building size={48} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No properties available right now.</p>
              <Button variant="link" onClick={() => navigate('/post')} className="mt-2">
                Be the first to post a property
              </Button>
            </div>
          )}
        </div>
      </section>
      
      {/* Overview Stats - Enhanced with Icons and Better Layout */}
      <section className="py-10 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-1">300+</div>
              <div className="text-sm text-muted-foreground">Active Listings</div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-1">1000+</div>
              <div className="text-sm text-muted-foreground">Happy Students</div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-1">50+</div>
              <div className="text-sm text-muted-foreground">Universities</div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works - Enhanced with Better Visuals */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-2 text-center">How It Works</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-lg mx-auto">
            Find your ideal student housing in three simple steps
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto stagger-children">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center border border-border/40 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Search className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-medium mb-2">Search</h3>
              <p className="text-muted-foreground text-sm">
                Use our map view to find housing near your campus with our powerful search filters
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center border border-border/40 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-medium mb-2">Connect</h3>
              <p className="text-muted-foreground text-sm">
                Chat with student landlords and schedule property viewings in your preferred areas
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center border border-border/40 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-medium mb-2">Move In</h3>
              <p className="text-muted-foreground text-sm">
                Complete the paperwork online and enjoy your new student home with peace of mind
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Neighborhoods - New Section */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-2 text-center">Popular Student Areas</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-lg mx-auto">
            Discover the most popular neighborhoods for student housing
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Bloomsbury", image: "https://images.unsplash.com/photo-1544954412-78da2cfa1a0c?q=80&w=1200", count: 25 },
              { name: "Camden", image: "https://images.unsplash.com/photo-1564680550702-20fcf1f87f73?q=80&w=1200", count: 42 },
              { name: "Islington", image: "https://images.unsplash.com/photo-1600631322138-ea2ca0727665?q=80&w=1200", count: 37 },
              { name: "Shoreditch", image: "https://images.unsplash.com/photo-1575258904228-7d10170d131a?q=80&w=1200", count: 31 }
            ].map((area, index) => (
              <div 
                key={index} 
                className="group relative h-48 rounded-lg overflow-hidden"
                onClick={() => navigate(`/search?location=${area.name}`)}
              >
                <img 
                  src={area.image} 
                  alt={area.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/0" />
                <div className="absolute bottom-0 p-4 w-full">
                  <h3 className="text-lg font-medium text-white">{area.name}</h3>
                  <p className="text-sm text-white/90">{area.count} properties</p>
                </div>
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button 
              variant="outline"
              onClick={() => navigate('/search')}
              className="bg-white"
            >
              <Layers size={16} className="mr-2" />
              Explore All Areas
            </Button>
          </div>
        </div>
      </section>
      
      {/* CTA Section - Enhanced */}
      <section className="py-16 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to find your perfect space?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join thousands of students who found their ideal housing through DoorFinder's interactive map and search features
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => navigate('/search')}
              className="shadow-md"
            >
              <Search size={18} className="mr-2" />
              Start Searching
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate('/post')}
              className="bg-white/80"
            >
              <Building size={18} className="mr-2" />
              List Your Property
            </Button>
          </div>
        </div>
      </section>
      
      {/* Improved Footer */}
      <footer className="bg-white py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-6">
            <div>
              <h3 className="font-medium mb-3 text-sm">About</h3>
              <ul className="space-y-2 text-sm">
                <li className="Hello">
                  <a href="#" 
                     className="text-muted-foreground hover:text-primary transition-colors touch-feedback"
                     onClick={handleOurStoryClick}>
                    Our Story
                  </a>
                </li>
                <li>
                  <a href="#" 
                     className="text-muted-foreground hover:text-primary transition-colors touch-feedback"
                     onClick={handleHowItWorksClick}>
                    How It Works
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-3 text-sm">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors touch-feedback">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors touch-feedback">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-3 text-sm">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors touch-feedback">Privacy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors touch-feedback">Terms</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-3 text-sm">Get Started</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/post" className="text-muted-foreground hover:text-primary transition-colors touch-feedback">List Housing</a></li>
                <li><a href="/search" className="text-muted-foreground hover:text-primary transition-colors touch-feedback">Find Housing</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} DoorFinder. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* TabBar */}
      <TabBar />
    </div>;
};
export default Index;
