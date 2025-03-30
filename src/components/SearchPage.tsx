import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PropertyCard from "./PropertyCard";
import { supabase } from "@/lib/supabase";
import { Slider } from "./ui/slider";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Filter as FilterIcon,
  MapPin,
  SlidersHorizontal,
  X,
  Home,
  Bath,
  Calendar,
  Check,
} from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import SearchBox from "./SearchBox";
import useAuth from "@/hooks/useAuth";

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  availableFrom: string;
  imageUrl: string;
  latitude: number | null;
  longitude: number | null;
  squareFeet: number;
  hasHall: boolean;
  hasSeparateKitchen: boolean;
  distance?: number;
}

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearchTerm = searchParams.get("term") || "";
  const initialCategory = searchParams.get("category") || "";
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [bedroomsMin, setBedroomsMin] = useState<number | null>(null);
  const [bathroomsMin, setBathroomsMin] = useState<number | null>(null);
  const [hasHall, setHasHall] = useState<boolean | null>(null);
  const [hasSeparateKitchen, setHasSeparateKitchen] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<string>("price-asc");
  
  // User location for distance calculation
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  
  const { user } = useAuth();
  const [savedProperties, setSavedProperties] = useState<string[]>([]);

  // Get user's saved properties
  useEffect(() => {
    const fetchSavedProperties = async () => {
      if (!user) {
        setSavedProperties([]);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("saved_properties")
          .select("property_id")
          .eq("user_id", user.id);
          
        if (error) {
          throw error;
        }
        
        setSavedProperties(data.map(item => item.property_id));
      } catch (error) {
        console.error("Error fetching saved properties:", error);
        setSavedProperties([]);
      }
    };
    
    fetchSavedProperties();
  }, [user]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);

  // Fetch properties based on search and filters
  useEffect(() => {
    fetchProperties();
  }, [initialSearchTerm, initialCategory]);

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [
    properties,
    priceRange,
    bedroomsMin,
    bathroomsMin,
    hasHall,
    hasSeparateKitchen,
    sortBy,
  ]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      let query = supabase.from("properties").select("*");

      // Apply search term filter if provided
      if (initialSearchTerm) {
        query = query.or(
          `title.ilike.%${initialSearchTerm}%,address.ilike.%${initialSearchTerm}%`
        );
      }

      // Apply category filter if provided
      if (initialCategory) {
        query = query.eq("category", initialCategory);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Calculate distance if user location is available
      const propertiesWithDistance = data.map((property) => {
        let distance = undefined;
        
        if (
          userLocation &&
          property.latitude &&
          property.longitude
        ) {
          distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            property.latitude,
            property.longitude
          );
        }
        
        return {
          ...property,
          distance,
          imageUrl: property.images?.[0] || "https://placehold.co/600x400?text=No+Image"
        };
      });

      setProperties(propertiesWithDistance);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...properties];

    // Price filter
    result = result.filter(
      (property) => property.price >= priceRange[0] && property.price <= priceRange[1]
    );

    // Bedrooms filter
    if (bedroomsMin !== null) {
      result = result.filter((property) => property.bedrooms >= bedroomsMin);
    }

    // Bathrooms filter
    if (bathroomsMin !== null) {
      result = result.filter((property) => property.bathrooms >= bathroomsMin);
    }

    // Hall filter
    if (hasHall !== null) {
      result = result.filter((property) => property.hasHall === hasHall);
    }

    // Separate kitchen filter
    if (hasSeparateKitchen !== null) {
      result = result.filter(
        (property) => property.hasSeparateKitchen === hasSeparateKitchen
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "date-asc":
          return new Date(a.availableFrom).getTime() - new Date(b.availableFrom).getTime();
        case "date-desc":
          return new Date(b.availableFrom).getTime() - new Date(a.availableFrom).getTime();
        case "distance":
          if (a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance;
          }
          return 0;
        default:
          return 0;
      }
    });

    setFilteredProperties(result);
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return parseFloat(d.toFixed(2));
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  const resetFilters = () => {
    setPriceRange([0, 10000]);
    setBedroomsMin(null);
    setBathroomsMin(null);
    setHasHall(null);
    setHasSeparateKitchen(null);
    setSortBy("price-asc");
  };

  const handleSearch = (term: string) => {
    setSearchParams({ term });
  };

  const getMaxPrice = () => {
    if (properties.length === 0) return 10000;
    return Math.max(...properties.map((property) => property.price));
  };

  const toggleSaveProperty = async (propertyId: string) => {
    if (!user) return;
    
    try {
      if (savedProperties.includes(propertyId)) {
        // Remove from saved
        await supabase
          .from("saved_properties")
          .delete()
          .eq("user_id", user.id)
          .eq("property_id", propertyId);
          
        setSavedProperties(savedProperties.filter(id => id !== propertyId));
      } else {
        // Add to saved
        await supabase
          .from("saved_properties")
          .insert({
            user_id: user.id,
            property_id: propertyId
          });
          
        setSavedProperties([...savedProperties, propertyId]);
      }
    } catch (error) {
      console.error("Error toggling saved property:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8 animate-fade-in stagger-1">
        <h1 className="text-3xl font-bold mb-2">
          {initialSearchTerm
            ? `Properties in "${initialSearchTerm}"`
            : initialCategory
            ? `${initialCategory} Properties`
            : "All Properties"}
        </h1>
        <p className="text-muted-foreground mb-6">
          {filteredProperties.length} {filteredProperties.length === 1 ? "property" : "properties"} found
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="w-full">
            <SearchBox
              variant="inline"
              onSearch={handleSearch}
              showPopularSearches
            />
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 shrink-0">
                <FilterIcon size={16} />
                <span>Filters</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="flex items-center">
                  <FilterIcon size={18} className="mr-2" />
                  Filters
                </SheetTitle>
                <SheetDescription>
                  Filter properties based on your preferences
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="h-[calc(100vh-180px)] pr-4">
                <div className="py-6 space-y-6">
                  {/* Price Range */}
                  <div>
                    <h3 className="text-sm font-medium mb-4 flex items-center">
                      <SlidersHorizontal size={16} className="mr-2" />
                      Price Range (${priceRange[0]} - ${priceRange[1]})
                    </h3>
                    <Slider
                      defaultValue={priceRange}
                      min={0}
                      max={getMaxPrice()}
                      step={100}
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$0</span>
                      <span>${getMaxPrice()}</span>
                    </div>
                  </div>

                  {/* Bedrooms */}
                  <div>
                    <h3 className="text-sm font-medium mb-4 flex items-center">
                      <Home size={16} className="mr-2" />
                      Bedrooms
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[null, 1, 2, 3, 4, 5].map((value, index) => (
                        <Button
                          key={index}
                          variant={bedroomsMin === value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBedroomsMin(value)}
                          className="min-w-[50px]"
                        >
                          {value === null ? "Any" : value === 5 ? "5+" : value}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <h3 className="text-sm font-medium mb-4 flex items-center">
                      <Bath size={16} className="mr-2" />
                      Bathrooms
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[null, 1, 2, 3].map((value, index) => (
                        <Button
                          key={index}
                          variant={bathroomsMin === value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBathroomsMin(value)}
                          className="min-w-[50px]"
                        >
                          {value === null ? "Any" : value === 3 ? "3+" : value}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <h3 className="text-sm font-medium mb-4 flex items-center">
                      <Calendar size={16} className="mr-2" />
                      Sort By
                    </h3>
                    <Select
                      value={sortBy}
                      onValueChange={(value) => setSortBy(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        <SelectItem value="date-asc">Available: Soonest</SelectItem>
                        <SelectItem value="date-desc">Available: Latest</SelectItem>
                        {userLocation && (
                          <SelectItem value="distance">Distance</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Additional Features */}
                  <div>
                    <h3 className="text-sm font-medium mb-4">Additional Features</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasHall"
                          checked={hasHall === true}
                          onCheckedChange={(checked) =>
                            setHasHall(checked === "indeterminate" ? null : checked)
                          }
                          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                        <Label htmlFor="hasHall" className="cursor-pointer">
                          Has Hall
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasSeparateKitchen"
                          checked={hasSeparateKitchen === true}
                          onCheckedChange={(checked) =>
                            setHasSeparateKitchen(
                              checked === "indeterminate" ? null : checked
                            )
                          }
                          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                        <Label htmlFor="hasSeparateKitchen" className="cursor-pointer">
                          Separate Kitchen
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <SheetFooter className="flex-row justify-between sm:justify-between gap-2 pt-2 border-t">
                <Button variant="outline" onClick={resetFilters}>
                  Reset
                </Button>
                <SheetClose asChild>
                  <Button className="btn-hover-effect">
                    Apply Filters
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active filters */}
      {(bedroomsMin !== null ||
        bathroomsMin !== null ||
        hasHall !== null ||
        hasSeparateKitchen !== null ||
        sortBy !== "price-asc" ||
        priceRange[0] > 0 ||
        priceRange[1] < getMaxPrice()) && (
        <div className="mb-6 flex flex-wrap gap-2 animate-fade-in stagger-2">
          {bedroomsMin !== null && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
              onClick={() => setBedroomsMin(null)}
            >
              {bedroomsMin} {bedroomsMin === 1 ? "Bedroom" : "Bedrooms"} <X className="ml-1 h-4 w-4" />
            </Button>
          )}
          {bathroomsMin !== null && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
              onClick={() => setBathroomsMin(null)}
            >
              {bathroomsMin} {bathroomsMin === 1 ? "Bathroom" : "Bathrooms"} <X className="ml-1 h-4 w-4" />
            </Button>
          )}
          {hasHall === true && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
              onClick={() => setHasHall(null)}
            >
              Has Hall <X className="ml-1 h-4 w-4" />
            </Button>
          )}
          {hasSeparateKitchen === true && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
              onClick={() => setHasSeparateKitchen(null)}
            >
              Separate Kitchen <X className="ml-1 h-4 w-4" />
            </Button>
          )}
          {(priceRange[0] > 0 || priceRange[1] < getMaxPrice()) && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
              onClick={() => setPriceRange([0, getMaxPrice()])}
            >
              ${priceRange[0]} - ${priceRange[1]} <X className="ml-1 h-4 w-4" />
            </Button>
          )}
          {sortBy !== "price-asc" && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
              onClick={() => setSortBy("price-asc")}
            >
              Sorted by:{" "}
              {
                {
                  "price-desc": "Price: High to Low",
                  "date-asc": "Available: Soonest",
                  "date-desc": "Available: Latest",
                  distance: "Distance",
                }[sortBy]
              }{" "}
              <X className="ml-1 h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-muted-foreground hover:text-foreground"
            onClick={resetFilters}
          >
            Clear All
          </Button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in stagger-3">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div key={index} className="rounded-xl bg-muted/50 h-80 animate-pulse"></div>
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center py-12 animate-fade-in stagger-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <MapPin size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No properties found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search for a different location
          </p>
          <Button onClick={resetFilters}>Reset Filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property, index) => (
            <PropertyCard
              key={property.id}
              property={property}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
              onSave={user ? toggleSaveProperty : undefined}
              isSaved={savedProperties.includes(property.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage; 