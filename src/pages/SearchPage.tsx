import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import TabBar from "@/components/TabBar";
import SearchBar from "@/components/SearchBar";
import PropertyCard, { PropertyData } from "@/components/PropertyCard";
import { useToast } from "@/components/ui/use-toast";
import { 
  Search, BookOpen, MapPin, Building, Bath, School, Info, 
  HelpCircle, Phone, X, Check, Filter, SlidersHorizontal, 
  ChevronsUpDown, Bed, Home, House, DollarSign, Maximize
} from "lucide-react";
import { searchPropertiesByCollege, PropertyFilter, SortOption, BANGALORE_COLLEGES } from "@/services/propertyService";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<PropertyFilter>({});
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const {
    toast
  } = useToast();

  const [activeFilterTab, setActiveFilterTab] = useState("price");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [amenities, setAmenities] = useState({
    hasHall,
    hasSeparateKitchen,
    hasFurnished: false,
    hasAC: false,
    hasWifi: false,
    hasGym: false
  });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const data = await searchPropertiesByCollege("", filters, sortOption);
        setProperties(data);
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast({
          title: "Error",
          description: "Failed to load properties. Please try again later.",
          variant: "destructive"
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
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateAmenities = (key, value) => {
    setAmenities(prev => ({
      ...prev,
      [key]: value
    }));
    
    if (key === 'hasHall') setHasHall(value || undefined);
    if (key === 'hasSeparateKitchen') setHasSeparateKitchen(value || undefined);
  };

  const handleApplyFilters = () => {
    const newFilters: PropertyFilter = {};
    
    if (priceRange[0] > 0) newFilters.minPrice = priceRange[0];
    if (priceRange[1] < 50000) newFilters.maxPrice = priceRange[1];
    
    if (bedrooms !== undefined) {
      if (bedrooms === "<5") {
        newFilters.maxBedrooms = 5;
      } else {
        newFilters.minBedrooms = Number(bedrooms);
        newFilters.maxBedrooms = Number(bedrooms);
      }
    }

    if (bathrooms !== undefined) {
      newFilters.minBathrooms = bathrooms;
      newFilters.maxBathrooms = bathrooms;
    }
    
    if (amenities.hasHall) newFilters.hasHall = true;
    if (amenities.hasSeparateKitchen) newFilters.hasSeparateKitchen = true;
    if (amenities.hasFurnished) newFilters.hasFurnished = true;
    if (amenities.hasAC) newFilters.hasAC = true;
    if (amenities.hasWifi) newFilters.hasWifi = true;
    if (amenities.hasGym) newFilters.hasGym = true;
    
    if (propertyType) newFilters.propertyType = propertyType;
    
    if (maxDistance && userLocation) {
      newFilters.maxDistance = maxDistance;
      newFilters.nearLocation = userLocation;
    }

    if (selectedColleges.length > 0) {
      newFilters.college = selectedColleges.join(',');
    }
    
    setFilters(newFilters);
    setIsFilterOpen(false);
    
    toast({
      title: "Filters Applied",
      description: `Found ${properties.length} properties with your filters`,
    });
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
    setPriceRange([0, 50000]);
    setAmenities({
      hasHall: false,
      hasSeparateKitchen: false,
      hasFurnished: false,
      hasAC: false,
      hasWifi: false,
      hasGym: false
    });
    setFilters({});
    setIsFilterOpen(false);
    
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared"
    });
  };

  const handleSort = (option: SortOption) => {
    setSortOption(option);
    toast({
      title: "Sorting Updated",
      description: `Properties sorted by ${option.replace('_', ' ')}`
    });
  };

  const handleCollegeSelect = (college: string) => {
    setSelectedColleges(prev => {
      if (prev.includes(college)) {
        return prev.filter(c => c !== college);
      }
      if (prev.length < 3) {
        return [...prev, college];
      }
      return prev;
    });
  };

  const removeCollege = (college: string) => {
    setSelectedColleges(prev => prev.filter(c => c !== college));
  };

  const activeFiltersCount = Object.keys(filters).length;

  return <div className="min-h-screen pb-16">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-6">
            <Search className="text-primary mr-3" size={28} />
            <h1 className="text-3xl font-bold">Find Student Housing</h1>
          </div>
          
          <div className="mb-8">
            <SearchBar onSearch={handleSearch} placeholder="Search by college name (e.g., KJC, Kristu Jayanti College)..." className="w-full" />
          </div>
          
          {selectedColleges.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {selectedColleges.map(college => (
                <Badge key={college} variant="secondary" className="flex items-center gap-1">
                  <School className="mr-1 h-3 w-3" />
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
                <Button variant="ghost" size="sm" onClick={() => setSelectedColleges([])} className="h-7 text-xs">
                  Clear All
                </Button>
              )}
            </div>
          )}
          
          <div className="mb-8 flex flex-wrap gap-3 items-center">
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <SlidersHorizontal size={16} />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-1 rounded-full bg-primary text-primary-foreground text-xs w-5 h-5 flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[340px] sm:w-[420px] p-0 shadow-lg border-border">
                <Tabs defaultValue={activeFilterTab} className="w-full" onValueChange={setActiveFilterTab}>
                  <div className="border-b p-3 flex justify-between items-center">
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="price">
                        <DollarSign className="mr-1 h-3.5 w-3.5" />
                        Price
                      </TabsTrigger>
                      <TabsTrigger value="rooms">
                        <Home className="mr-1 h-3.5 w-3.5" />
                        Rooms
                      </TabsTrigger>
                      <TabsTrigger value="more">
                        <Filter className="mr-1 h-3.5 w-3.5" />
                        More
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <div className="px-4 pt-4 pb-2">
                    <TabsContent value="price" className="mt-0 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Price Range (₹)</Label>
                          <div className="text-sm">
                            ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                          </div>
                        </div>
                        <Slider 
                          value={priceRange}
                          min={0}
                          max={50000}
                          step={500}
                          onValueChange={setPriceRange}
                          className="py-4"
                        />
                        <div className="flex gap-4 mt-2">
                          <div className="flex-1">
                            <Input 
                              type="number" 
                              placeholder="Min" 
                              value={priceRange[0] || ''}
                              onChange={e => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                              className="w-full"
                            />
                          </div>
                          <div className="flex-1">
                            <Input 
                              type="number" 
                              placeholder="Max" 
                              value={priceRange[1] || ''}
                              onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value) || 50000])}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Label className="mb-2 block">Property Type</Label>
                        <RadioGroup 
                          value={propertyType} 
                          onValueChange={(value: 'rental' | 'pg' | undefined) => setPropertyType(value)}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="rental" id="rental" />
                            <Label htmlFor="rental" className="flex items-center">
                              <House className="mr-1.5 h-4 w-4" />
                              Rental
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pg" id="pg" />
                            <Label htmlFor="pg" className="flex items-center">
                              <Building className="mr-1.5 h-4 w-4" />
                              PG
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="rooms" className="mt-0 space-y-4">
                      <div>
                        <Label className="mb-2 block">Bedrooms</Label>
                        <RadioGroup 
                          value={bedrooms?.toString()} 
                          onValueChange={value => setBedrooms(value)} 
                          className="grid grid-cols-5 gap-2"
                        >
                          {[1, 2, 3, 4, '<5'].map(num => (
                            <div key={num} className="flex items-center space-x-2">
                              <RadioGroupItem value={num.toString()} id={`bed-${num}`} />
                              <Label htmlFor={`bed-${num}`} className="flex items-center">
                                {num === '<5' ? num : (
                                  <>
                                    <Bed className="mr-1 h-3 w-3" />
                                    {num}
                                  </>
                                )}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      
                      <div>
                        <Label className="mb-2 block">Bathrooms</Label>
                        <RadioGroup 
                          value={bathrooms?.toString()} 
                          onValueChange={value => setBathrooms(Number(value))} 
                          className="grid grid-cols-5 gap-2"
                        >
                          {[1, 2, 3, 4].map(num => (
                            <div key={num} className="flex items-center space-x-2">
                              <RadioGroupItem value={num.toString()} id={`bath-${num}`} />
                              <Label htmlFor={`bath-${num}`} className="flex items-center">
                                <Bath className="mr-1 h-3 w-3" />
                                {num}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="more" className="mt-0 space-y-4">
                      <div>
                        <Label className="mb-2 block">Amenities</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="hasHall" 
                              checked={amenities.hasHall} 
                              onCheckedChange={checked => updateAmenities('hasHall', !!checked)}
                            />
                            <Label htmlFor="hasHall">Has Hall</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="hasSeparateKitchen" 
                              checked={amenities.hasSeparateKitchen} 
                              onCheckedChange={checked => updateAmenities('hasSeparateKitchen', !!checked)}
                            />
                            <Label htmlFor="hasSeparateKitchen">Separate Kitchen</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="hasFurnished" 
                              checked={amenities.hasFurnished} 
                              onCheckedChange={checked => updateAmenities('hasFurnished', !!checked)}
                            />
                            <Label htmlFor="hasFurnished">Furnished</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="hasAC" 
                              checked={amenities.hasAC} 
                              onCheckedChange={checked => updateAmenities('hasAC', !!checked)}
                            />
                            <Label htmlFor="hasAC">Air Conditioning</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="hasWifi" 
                              checked={amenities.hasWifi} 
                              onCheckedChange={checked => updateAmenities('hasWifi', !!checked)}
                            />
                            <Label htmlFor="hasWifi">WiFi</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="hasGym" 
                              checked={amenities.hasGym} 
                              onCheckedChange={checked => updateAmenities('hasGym', !!checked)}
                            />
                            <Label htmlFor="hasGym">Gym Access</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="mb-2 block">College</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="relative">
                                <Select 
                                  value={selectedColleges.length > 0 ? "colleges" : undefined} 
                                  onValueChange={college => {
                                    if (college !== "colleges") {
                                      handleCollegeSelect(college);
                                    }
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select colleges (max 3)" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {BANGALORE_COLLEGES.map(college => (
                                      <SelectItem 
                                        key={college} 
                                        value={college} 
                                        disabled={selectedColleges.length >= 3 && !selectedColleges.includes(college)}
                                      >
                                        <div className="flex items-center">
                                          <School className="mr-2 h-4 w-4" />
                                          <span>{college}</span>
                                          {selectedColleges.includes(college) && <Check className="ml-2 h-4 w-4" />}
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
                        
                        {selectedColleges.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {selectedColleges.map(college => (
                              <Badge key={college} variant="outline" className="text-xs">
                                {college}
                                <X 
                                  size={12} 
                                  className="ml-1 cursor-pointer" 
                                  onClick={() => removeCollege(college)} 
                                />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center">
                          <Label>Distance from you</Label>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={getUserLocation} 
                            className="h-8 px-2"
                          >
                            <MapPin size={16} className="mr-1" />
                            {userLocation ? "Update Location" : "Set My Location"}
                          </Button>
                        </div>
                        
                        {userLocation ? (
                          <div className="pt-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Radius: {maxDistance || 10} km</span>
                              {maxDistance && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 px-2 py-0 text-xs"
                                  onClick={() => setMaxDistance(undefined)}
                                >
                                  Clear
                                </Button>
                              )}
                            </div>
                            <Slider
                              value={[maxDistance || 10]}
                              min={1}
                              max={50}
                              step={1}
                              onValueChange={vals => setMaxDistance(vals[0])}
                              className="py-2"
                            />
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1">
                            Set your location to enable distance filtering
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </div>
                  
                  <div className="flex justify-between p-4 border-t">
                    <Button variant="outline" onClick={handleResetFilters}>
                      Reset All
                    </Button>
                    <Button onClick={handleApplyFilters}>
                      Apply Filters
                    </Button>
                  </div>
                </Tabs>
              </PopoverContent>
            </Popover>

            <Select value={sortOption} onValueChange={val => handleSort(val as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center">
                  <ChevronsUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </div>
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
            
            {activeFiltersCount > 0 && (
              <Badge variant="outline" className="flex items-center gap-1 px-3">
                <Filter className="h-3 w-3 mr-1" />
                {activeFiltersCount} {activeFiltersCount === 1 ? 'filter' : 'filters'} active
                <button 
                  onClick={handleResetFilters} 
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              </Badge>
            )}
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(index => (
                <div key={index} className="h-72 bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="inline-flex flex-col items-center text-muted-foreground">
                <BookOpen size={48} className="mb-4 opacity-20" />
                <p className="text-lg">No properties found</p>
                <p className="mt-2">Try adjusting your filters or search terms</p>
                {activeFiltersCount > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={handleResetFilters} 
                    className="mt-4"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <TabBar />
    </div>;
};

export default SearchPage;
