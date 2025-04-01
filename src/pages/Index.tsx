
import React, { useRef, useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import Button from "@/components/Button";
import TabBar from "@/components/TabBar";
import { Building, ChevronDown, Search, Map, Grid } from "lucide-react";
import { getProperties } from "@/services/propertyService";
import { useToast } from "@/components/ui/use-toast";
import PropertyMapView from "@/components/PropertyMapView";
import DownloadAppButton from "@/components/DownloadAppButton";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const { toast } = useToast();
  
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
  
  const handleToggleMapFullscreen = useCallback(() => {
    setIsMapFullscreen(prev => !prev);
  }, []);
  
  return (
    <div className="min-h-screen pb-16 overflow-x-hidden">
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
            
            {/* Download App Button */}
            <div className="mt-4 animate-slide-up" style={{ animationDelay: "300ms" }}>
              <DownloadAppButton />
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
          
          {/* Download App Button */}
          <div className="mt-6">
            <DownloadAppButton />
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} DoorFinder. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* TabBar */}
      <TabBar />
    </div>
  );
};

export default Index;
