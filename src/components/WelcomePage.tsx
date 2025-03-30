import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ChevronRight, Search, MapPin, Home, Building, GraduationCap, ArrowRight, X, Star } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import SearchBox from "./SearchBox";

// Mock data for popular cities with images
const popularCities = [
  { name: "New York", image: "https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
  { name: "San Francisco", image: "https://images.unsplash.com/photo-1534050359320-02900022671e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
  { name: "Los Angeles", image: "https://images.unsplash.com/photo-1515896769750-31548aa180ed?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
  { name: "Chicago", image: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
  { name: "Boston", image: "https://images.unsplash.com/photo-1501979376754-f46c524aab69?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
  { name: "Seattle", image: "https://images.unsplash.com/photo-1531335773602-9595d274578e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
];

// Featured properties data
const featuredProperties = [
  {
    id: "1",
    title: "Modern Downtown Apartment",
    address: "123 Main St, New York",
    price: 2500,
    beds: 2,
    baths: 1,
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "2",
    title: "Luxury Waterfront Condo",
    address: "456 Ocean Ave, San Francisco",
    price: 3200,
    beds: 3,
    baths: 2,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "3",
    title: "Cozy Studio near University",
    address: "789 Campus Rd, Boston",
    price: 1200,
    beds: 1,
    baths: 1,
    image: "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
  }
];

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Handle scroll for sticky search header on mobile
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = () => {
    navigate(`/search?term=${encodeURIComponent(searchTerm)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const toggleSearchBox = () => {
    setShowSearchBox(!showSearchBox);
  };

  // Format prices with commas
  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sticky search bar */}
      {isMobile && (
        <div 
          className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
            scrolled 
              ? "bg-background/90 backdrop-blur-md shadow-md py-2" 
              : "bg-transparent py-4"
          }`}
        >
          <div className="container px-4">
            <div 
              className="flex items-center gap-2 rounded-full bg-background/80 border shadow-sm p-2 cursor-pointer"
              onClick={toggleSearchBox}
            >
              <Search size={18} className="text-muted-foreground ml-2" />
              <div className="text-muted-foreground flex-1">
                Search properties...
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full"
              >
                <MapPin size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile search overlay */}
      {isMobile && showSearchBox && (
        <div className="fixed inset-0 bg-background z-40 animate-fade-in">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Search properties</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                onClick={toggleSearchBox}
              >
                <X size={18} />
              </Button>
            </div>
            <SearchBox 
              expanded 
              variant="default" 
              onSearch={(term) => {
                setSearchTerm(term);
                navigate(`/search?term=${encodeURIComponent(term)}`);
                setShowSearchBox(false);
              }}
              showPopularSearches
            />
          </div>
        </div>
      )}

      <div className="relative pt-16 md:pt-0 flex flex-col min-h-[calc(100vh-64px)]">
        {/* Background decorative elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-[5%] left-[10%] w-40 h-40 md:w-64 md:h-64 rounded-full bg-primary/5 animate-pulse-subtle" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[15%] right-[5%] w-48 h-48 md:w-80 md:h-80 rounded-full bg-primary/5 animate-pulse-subtle" style={{ animationDuration: '12s' }} />
          <div className="absolute top-[30%] right-[10%] w-32 h-32 md:w-40 md:h-40 rounded-full bg-blue-500/5 animate-pulse-subtle" style={{ animationDuration: '10s' }} />
        </div>

        {/* Hero section */}
        <div className="container px-4 pt-4 md:pt-16 pb-8 flex flex-col md:flex-row md:items-center md:gap-12 z-10 animate-fade-in stagger-1">
          <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight animate-fade-in stagger-1">
              Find Your Perfect <span className="text-primary">Door</span>
            </h1>
            <p className="text-base md:text-xl text-muted-foreground mb-8 animate-fade-in stagger-2 max-w-md mx-auto md:mx-0">
              Discover thousands of properties for rent with accurate details and
              virtual tours.
            </p>

            {/* Desktop search box */}
            {!isMobile && (
              <div className="relative animate-fade-in stagger-3 max-w-md mx-auto md:mx-0">
                <SearchBox
                  variant="default"
                  expanded
                  onSearch={(term) => {
                    navigate(`/search?term=${encodeURIComponent(term)}`);
                  }}
                />
              </div>
            )}

            {/* Quick action buttons */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start mt-8 animate-fade-in stagger-4">
              <Button 
                variant="outline" 
                className="rounded-full"
                onClick={() => navigate("/search?filter=newest")}
              >
                <Star size={16} className="mr-2 text-yellow-500" />
                New listings
              </Button>
              <Button 
                variant="outline" 
                className="rounded-full"
                onClick={() => navigate("/map")}
              >
                <MapPin size={16} className="mr-2" />
                Map view
              </Button>
            </div>
          </div>
          
          {/* Hero image */}
          <div className="md:w-1/2 hidden md:block">
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl animate-fade-in stagger-2">
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Modern apartment living room" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Discover your dream home</h3>
                    <p className="text-sm text-muted-foreground">Start your search today</p>
                  </div>
                  <Button size="sm" className="rounded-full btn-hover-effect">
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container px-4 pb-12 z-10">
          {/* Popular Cities (horizontal scroll on mobile) */}
          <div className="my-8 md:my-16 animate-fade-in stagger-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-semibold">
                Popular Cities
              </h2>
              <Button 
                variant="ghost" 
                className="text-primary text-sm font-medium" 
                onClick={() => navigate("/search")}
              >
                View all
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
            
            <div className="overflow-x-auto pb-4 -mx-4 px-4 md:overflow-visible md:pb-0 md:mx-0 md:px-0 no-scrollbar">
              <div className={`flex gap-4 md:grid md:grid-cols-3 lg:grid-cols-6 md:gap-4 min-w-max md:min-w-0`}>
                {popularCities.map((city, index) => (
                  <div
                    key={city.name}
                    onClick={() => {
                      navigate(`/search?term=${encodeURIComponent(city.name)}`);
                    }}
                    className="w-36 md:w-full shrink-0 md:shrink rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group animate-fade-in"
                    style={{ animationDelay: `${(index + 6) * 100}ms` }}
                  >
                    <div className="relative h-24 w-full">
                      <img
                        src={city.image}
                        alt={city.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <span className="text-white font-medium text-sm">
                          {city.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Categories */}
          <div className="mb-12 animate-fade-in stagger-5">
            <h2 className="text-xl md:text-2xl font-semibold mb-6">
              Browse by Category
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { 
                  title: "Apartments", 
                  description: "Modern city living",
                  icon: <Building className="text-blue-500" size={24} />,
                  color: "bg-blue-500/10",
                  badgeText: "Popular"
                },
                { 
                  title: "Houses", 
                  description: "Spacious family homes",
                  icon: <Home className="text-green-500" size={24} />,
                  color: "bg-green-500/10"
                },
                { 
                  title: "Student Housing", 
                  description: "Near universities",
                  icon: <GraduationCap className="text-amber-500" size={24} />,
                  color: "bg-amber-500/10"
                }
              ].map((category, index) => (
                <div 
                  key={category.title}
                  className={`rounded-2xl p-5 ${category.color} transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer animate-fade-in sheen-effect relative`}
                  style={{ animationDelay: `${(index + 10) * 100}ms` }}
                  onClick={() => navigate(`/search?category=${encodeURIComponent(category.title)}`)}
                >
                  {category.badgeText && (
                    <span className="absolute top-3 right-3 text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {category.badgeText}
                    </span>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-white/80">
                      {category.icon}
                    </div>
                    <h3 className="text-lg font-medium">{category.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                  <div className="flex items-center text-primary text-sm font-medium">
                    <span>Explore</span>
                    <ChevronRight size={16} className="ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Properties */}
          <div className="animate-fade-in stagger-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-semibold">
                Featured Properties
              </h2>
              <Button 
                variant="ghost" 
                className="text-primary text-sm font-medium" 
                onClick={() => navigate("/search?filter=featured")}
              >
                View all
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
            
            <div className="overflow-x-auto pb-4 -mx-4 px-4 md:overflow-visible md:pb-0 md:mx-0 md:px-0 no-scrollbar">
              <div className="flex gap-4 md:grid md:grid-cols-1 lg:grid-cols-3 md:gap-6 min-w-max md:min-w-0">
                {featuredProperties.map((property, index) => (
                  <div
                    key={property.id}
                    className="w-72 md:w-full shrink-0 md:shrink rounded-xl overflow-hidden bg-card border shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group animate-fade-in"
                    style={{ animationDelay: `${(index + 12) * 100}ms` }}
                    onClick={() => navigate(`/property/${property.id}`)}
                  >
                    <div className="relative h-40 w-full overflow-hidden">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-3 right-3">
                        <div className="bg-background/80 backdrop-blur-sm text-sm font-medium px-2 py-1 rounded-md">
                          ${formatPrice(property.price)}/mo
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-lg mb-1 line-clamp-1">{property.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{property.address}</p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center">
                          <Home size={14} className="mr-1 text-muted-foreground" />
                          {property.beds} {property.beds === 1 ? 'bed' : 'beds'}
                        </span>
                        <span className="flex items-center">
                          <MapPin size={14} className="mr-1 text-muted-foreground" />
                          {property.baths} {property.baths === 1 ? 'bath' : 'baths'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* App Install Banner for mobile */}
        {isMobile && (
          <div className="fixed bottom-4 left-4 right-4 bg-primary text-white rounded-xl p-4 shadow-lg z-20 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">Get the DoorFinder App</h3>
                <p className="text-sm text-white/80">Better experience on mobile</p>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                className="text-primary"
                onClick={() => window.open('https://play.google.com/store', '_blank')}
              >
                Install
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomePage; 