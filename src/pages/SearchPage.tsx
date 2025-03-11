import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import TabBar from "@/components/TabBar";
import SearchBar from "@/components/SearchBar";
import PropertyCard, { PropertyData } from "@/components/PropertyCard";
import { useToast } from "@/components/ui/use-toast";
import { Search, BookOpen, MapPin, Building, Bath, School, Info, HelpCircle, Phone, X, Check, Filter } from "lucide-react";
import { searchPropertiesByCollege, PropertyFilter, SortOption, BANGALORE_COLLEGES } from "@/services/propertyService";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [bedrooms, setBedrooms] = useState<number | string | undefined>(undefined);
  const [bathrooms, setBathrooms] = useState<number | undefined>(undefined);
  const [maxDistance, setMaxDistance] = useState<number | undefined>(undefined);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | undefined>(undefined);
  const [hasHall, setHasHall] = useState<boolean | undefined>(undefined);
  const [hasSeparateKitchen, setHasSeparateKitchen] = useState<boolean | undefined>(undefined);
  const [propertyType, setPropertyType] = useState<'rental' | 'pg' | undefined>(undefined);
  const [selectedColleges, setSelectedColleges] = useState<string[]>([]);
  
  // Dialog states
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [howItWorksDialogOpen, setHowItWorksDialogOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  // Function to get user's location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          
          // Enable distance filter with default value when location is set
          if (!maxDistance) {
            setMaxDistance(10);
          }
          
          toast({
            title: "Location Set",
            description: "Your current location has been set for distance filtering.",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please check your browser permissions.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  };

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
    
    // Handle bedrooms - including "<5" option
    if (bedrooms !== undefined) {
      if (bedrooms === "<5") {
        newFilters.maxBedrooms = 5;
      } else {
        newFilters.minBedrooms = Number(bedrooms);
        newFilters.maxBedrooms = Number(bedrooms);
      }
    }
    
    // Handle bathrooms
    if (bathrooms !== undefined) {
      newFilters.minBathrooms = bathrooms;
      newFilters.maxBathrooms = bathrooms;
    }
    
    if (hasHall !== undefined) newFilters.hasHall = hasHall;
    if (hasSeparateKitchen !== undefined) newFilters.hasSeparateKitchen = hasSeparateKitchen;
    if (propertyType) newFilters.propertyType = propertyType;
    
    if (maxDistance && userLocation) {
      newFilters.maxDistance = maxDistance;
      newFilters.nearLocation = userLocation;
    }
    
    // Handle college selection
    if (selectedColleges.length > 0) {
      newFilters.college = selectedColleges.join(',');
    }
    
    setFilters(newFilters);
    setIsFilterOpen(false);
  };

  const handleResetFilters = () => {
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setBedrooms(undefined);
    setBathrooms(undefined);
    setMaxDistance(undefined);
    setHasHall(undefined);
    setHasSeparateKitchen(undefined);
    setPropertyType(undefined);
    setSelectedColleges([]);
    setFilters({});
    setIsFilterOpen(false);
  };

  const handleSort = (option: SortOption) => {
    setSortOption(option);
  };
  
  const handleCollegeSelect = (college: string) => {
    setSelectedColleges((prev) => {
      // If already selected, remove it
      if (prev.includes(college)) {
        return prev.filter(c => c !== college);
      }
      // If not selected and we have less than 3, add it
      if (prev.length < 3) {
        return [...prev, college];
      }
      // Otherwise, keep the same selection
      return prev;
    });
  };
  
  const removeCollege = (college: string) => {
    setSelectedColleges(prev => prev.filter(c => c !== college));
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
          
          {/* Information Links */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-2">
            <Dialog open={aboutDialogOpen} onOpenChange={setAboutDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center justify-start">
                  <Info size={16} className="mr-2" />
                  <span className="text-sm">About Us</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>About Us</DialogTitle>
                  <DialogDescription>
                    We literally made this in a day for the Arcade Tank. Imagine what more we could do with this and what it could be! Imagine this being used by everyone—not just students—for searching new places. It would be so much simpler.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            
            <Dialog open={howItWorksDialogOpen} onOpenChange={setHowItWorksDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center justify-start">
                  <Info size={16} className="mr-2" />
                  <span className="text-sm">How It Works</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>How It Works</DialogTitle>
                  <DialogDescription>
                    DoorFinder helps students find housing near their colleges. Browse listings, filter by price and amenities, save favorites, and contact owners directly. Property owners can post their listings and manage inquiries.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            
            <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center justify-start">
                  <HelpCircle size={16} className="mr-2" />
                  <span className="text-sm">Help Center</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Help Center</DialogTitle>
                  <DialogDescription>
                    C'mon, it's super basic and so simple—help yourself hehe.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            
            <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center justify-start">
                  <Phone size={16} className="mr-2" />
                  <span className="text-sm">Contact Us</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Contact Us</DialogTitle>
                  <DialogDescription>
                    24mscs10@kristujayanti.com, joelkizyking@gmail.com, Instagram: mew_chew_
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Selected Colleges display */}
          {selectedColleges.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {selectedColleges.map(college => (
                <Badge key={college} variant="secondary" className="flex items-center gap-1">
                  {college}
                  <button 
                    onClick={() => removeCollege(college)}
                    className="ml-1 rounded-full hover:bg-muted p-0.5"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              ))}
              {selectedColleges.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedColleges([])}
                  className="h-7 text-xs"
                >
                  Clear All
                </Button>
              )}
            </div>
          )}
          
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
                    <Label>Property Type</Label>
                    <RadioGroup 
                      value={propertyType} 
                      onValueChange={(value: 'rental' | 'pg' | undefined) => setPropertyType(value)}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="rental" id="rental" />
                        <Label htmlFor="rental">Rental</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pg" id="pg" />
                        <Label htmlFor="pg">PG</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Bedrooms</Label>
                    <RadioGroup 
                      value={bedrooms?.toString()} 
                      onValueChange={(value) => setBedrooms(value)}
                      className="grid grid-cols-3 gap-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="bed-1" />
                        <Label htmlFor="bed-1">1</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id="bed-2" />
                        <Label htmlFor="bed-2">2</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3" id="bed-3" />
                        <Label htmlFor="bed-3">3</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="4" id="bed-4" />
                        <Label htmlFor="bed-4">4</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="<5" id="bed-5" />
                        <Label htmlFor="bed-5">&lt;5</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Bathrooms</Label>
                    <RadioGroup 
                      value={bathrooms?.toString()} 
                      onValueChange={(value) => setBathrooms(Number(value))}
                      className="grid grid-cols-4 gap-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="bath-1" />
                        <Label htmlFor="bath-1">1</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id="bath-2" />
                        <Label htmlFor="bath-2">2</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3" id="bath-3" />
                        <Label htmlFor="bath-3">3</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="4" id="bath-4" />
                        <Label htmlFor="bath-4">4</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>College</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="relative">
                            <Select
                              value={selectedColleges.length > 0 ? "colleges" : undefined}
                              onValueChange={(college) => {
                                if (college !== "colleges") {
                                  handleCollegeSelect(college);
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select colleges (max 3)" />
                              </SelectTrigger>
                              <SelectContent>
                                {BANGALORE_COLLEGES.map((college) => (
                                  <SelectItem 
                                    key={college} 
                                    value={college}
                                    disabled={selectedColleges.length >= 3 && !selectedColleges.includes(college)}
                                  >
                                    <div className="flex items-center">
                                      <School className="mr-2 h-4 w-4" />
                                      <span>{college}</span>
                                      {selectedColleges.includes(college) && (
                                        <Check className="ml-2 h-4 w-4" />
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {selectedColleges.length >= 3 && (
                              <div className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                {selectedColleges.length}
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Select up to 3 colleges</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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

