
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import TabBar from "@/components/TabBar";
import SearchBar from "@/components/SearchBar";
import PropertyCard, { PropertyData } from "@/components/PropertyCard";
import { useToast } from "@/components/ui/use-toast";
import { Search, BookOpen, MapPin } from "lucide-react";
import { searchPropertiesByCollege, PropertyFilter, SortOption } from "@/services/propertyService";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter } from "lucide-react";

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<PropertyFilter>({});
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { toast } = useToast();

  // Detailed filter states
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [minBedrooms, setMinBedrooms] = useState<number | undefined>(undefined);
  const [maxBedrooms, setMaxBedrooms] = useState<number | undefined>(undefined);
  const [maxDistance, setMaxDistance] = useState<number | undefined>(undefined);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | undefined>(undefined);
  const [hasHall, setHasHall] = useState<boolean | undefined>(undefined);
  const [hasSeparateKitchen, setHasSeparateKitchen] = useState<boolean | undefined>(undefined);

  // Initial load of properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        // Start with all properties
        const data = await searchPropertiesByCollege("", filters, sortOption);
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
  }, [toast, filters, sortOption]);

  // Get user location for distance filtering
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast({
            title: "Location detected",
            description: "Your location has been set for distance filtering.",
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location error",
            description: "Could not detect your location. Distance filtering will not be accurate.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation. Distance filtering will not be available.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    try {
      setIsLoading(true);
      const results = await searchPropertiesByCollege(term, filters, sortOption);
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

  const handleApplyFilters = () => {
    const newFilters: PropertyFilter = {};
    
    if (minPrice) newFilters.minPrice = minPrice;
    if (maxPrice) newFilters.maxPrice = maxPrice;
    if (minBedrooms) newFilters.minBedrooms = minBedrooms;
    if (maxBedrooms) newFilters.maxBedrooms = maxBedrooms;
    if (hasHall !== undefined) newFilters.hasHall = hasHall;
    if (hasSeparateKitchen !== undefined) newFilters.hasSeparateKitchen = hasSeparateKitchen;
    
    if (maxDistance && userLocation) {
      newFilters.maxDistance = maxDistance;
      newFilters.nearLocation = userLocation;
    }
    
    setFilters(newFilters);
    setIsFilterOpen(false);
  };

  const handleResetFilters = () => {
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMinBedrooms(undefined);
    setMaxBedrooms(undefined);
    setMaxDistance(undefined);
    setHasHall(undefined);
    setHasSeparateKitchen(undefined);
    setFilters({});
    setIsFilterOpen(false);
  };

  const handleSort = (option: SortOption) => {
    setSortOption(option);
  };

  const activeFiltersCount = Object.keys(filters).length;

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-6">
            <Search className="text-primary mr-3" size={28} />
            <h1 className="text-3xl font-bold">Find Student Housing</h1>
          </div>
          
          <div className="mb-8">
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Search by college name (e.g., KJC, Kristu Jayanti College)..."
              className="w-full"
            />
          </div>
          
          {/* Advanced filtering and sorting UI */}
          <div className="mb-8 flex flex-wrap gap-3 items-center">
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter size={16} />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-1 rounded-full bg-primary text-white text-xs w-5 h-5 flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 sm:w-96 p-4">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Filter Properties</h3>
                  
                  <div className="space-y-2">
                    <Label>Price Range (₹)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={minPrice || ''}
                        onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                      />
                      <span>to</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={maxPrice || ''}
                        onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Bedrooms</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={minBedrooms || ''}
                        onChange={(e) => setMinBedrooms(e.target.value ? Number(e.target.value) : undefined)}
                      />
                      <span>to</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={maxBedrooms || ''}
                        onChange={(e) => setMaxBedrooms(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Amenities</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="hasHall"
                          checked={hasHall === true}
                          onCheckedChange={(checked) => setHasHall(checked === true ? true : undefined)}
                        />
                        <Label htmlFor="hasHall">Has Hall</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="hasSeparateKitchen"
                          checked={hasSeparateKitchen === true}
                          onCheckedChange={(checked) => setHasSeparateKitchen(checked === true ? true : undefined)}
                        />
                        <Label htmlFor="hasSeparateKitchen">Separate Kitchen</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Distance (km)</Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={getUserLocation}
                        className="h-8 px-2"
                      >
                        <MapPin size={16} className="mr-1" />
                        Set My Location
                      </Button>
                    </div>
                    {maxDistance && (
                      <div className="pt-2 pb-1 px-1">
                        <p className="text-center text-sm mb-2">{maxDistance} km</p>
                        <Slider
                          value={[maxDistance]}
                          min={1}
                          max={50}
                          step={1}
                          onValueChange={(vals) => setMaxDistance(vals[0])}
                          disabled={!userLocation}
                        />
                      </div>
                    )}
                    {!maxDistance && (
                      <div>
                        <Button 
                          variant="outline" 
                          onClick={() => setMaxDistance(10)}
                          className="w-full"
                          disabled={!userLocation}
                        >
                          Enable distance filter
                        </Button>
                      </div>
                    )}
                    {!userLocation && (
                      <p className="text-xs text-muted-foreground">Set your location to enable distance filtering</p>
                    )}
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" onClick={handleResetFilters}>
                      Reset
                    </Button>
                    <Button onClick={handleApplyFilters}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Select value={sortOption} onValueChange={(val) => handleSort(val as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="bedrooms_desc">Most Bedrooms</SelectItem>
                {userLocation && <SelectItem value="nearest">Nearest First</SelectItem>}
              </SelectContent>
            </Select>
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
