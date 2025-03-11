
import React, { useState } from 'react';
import { 
  Filter, SortAsc, ChevronsUpDown, 
  Home, DollarSign, Bed, School, Bath, CheckSquare
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PropertyFilter, SortOption, BANGALORE_COLLEGES } from '@/services/propertyService';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";

interface FilterSortPanelProps {
  onApplyFilters: (filters: PropertyFilter) => void;
  onSort: (sortOption: SortOption) => void;
  className?: string;
}

const FilterSortPanel: React.FC<FilterSortPanelProps> = ({ 
  onApplyFilters, 
  onSort,
  className 
}) => {
  const [filters, setFilters] = useState<PropertyFilter>({
    minPrice: undefined,
    maxPrice: undefined,
    minBedrooms: undefined,
    maxBedrooms: undefined,
    minBathrooms: undefined,
    maxBathrooms: undefined,
    hasHall: undefined,
    hasSeparateKitchen: undefined,
    college: undefined
  });
  
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [collegeFilterOpen, setCollegeFilterOpen] = useState(false);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value === '' ? undefined : Number(value)
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleCollegeSelect = (college: string) => {
    setFilters(prev => ({
      ...prev,
      college
    }));
    setCollegeFilterOpen(false);
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  const handleSortChange = (value: string) => {
    const option = value as SortOption;
    setSortOption(option);
    onSort(option);
  };

  const clearFilters = () => {
    setFilters({
      minPrice: undefined,
      maxPrice: undefined,
      minBedrooms: undefined,
      maxBedrooms: undefined,
      minBathrooms: undefined,
      maxBathrooms: undefined,
      hasHall: undefined,
      hasSeparateKitchen: undefined,
      college: undefined
    });
    onApplyFilters({});
  };

  return (
    <div className={`flex flex-wrap items-center gap-3 mb-6 ${className}`}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={16} />
            <span>Filter</span>
            {Object.values(filters).some(val => val !== undefined) && (
              <span className="ml-1 rounded-full bg-primary text-white text-xs w-5 h-5 flex items-center justify-center">
                {Object.values(filters).filter(val => val !== undefined).length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-4">
            <h3 className="font-medium">Filter Properties</h3>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={16} className="text-muted-foreground" />
                <Label>Price Range (₹)</Label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={handleFilterChange}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Bed size={16} className="text-muted-foreground" />
                <Label>Bedrooms</Label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="number"
                    name="minBedrooms"
                    placeholder="Min"
                    value={filters.minBedrooms || ''}
                    onChange={handleFilterChange}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    name="maxBedrooms"
                    placeholder="Max"
                    value={filters.maxBedrooms || ''}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Bath size={16} className="text-muted-foreground" />
                <Label>Bathrooms</Label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="number"
                    name="minBathrooms"
                    placeholder="Min"
                    value={filters.minBathrooms || ''}
                    onChange={handleFilterChange}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    name="maxBathrooms"
                    placeholder="Max"
                    value={filters.maxBathrooms || ''}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <CheckSquare size={16} className="text-muted-foreground" />
                <Label>Amenities</Label>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="hasHall" 
                    checked={!!filters.hasHall} 
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('hasHall', checked === true)
                    }
                  />
                  <Label htmlFor="hasHall">Has Hall</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="hasSeparateKitchen" 
                    checked={!!filters.hasSeparateKitchen} 
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('hasSeparateKitchen', checked === true)
                    }
                  />
                  <Label htmlFor="hasSeparateKitchen">Separate Kitchen</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <School size={16} className="text-muted-foreground" />
                <Label>Near College</Label>
              </div>
              <Popover open={collegeFilterOpen} onOpenChange={setCollegeFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    role="combobox"
                  >
                    {filters.college || "Select college..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search college..." />
                    <CommandEmpty>No college found.</CommandEmpty>
                    <CommandList className="max-h-60">
                      <CommandGroup>
                        {BANGALORE_COLLEGES.map((college) => (
                          <CommandItem
                            key={college}
                            value={college}
                            onSelect={() => handleCollegeSelect(college)}
                          >
                            {college}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
              <Button size="sm" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex items-center">
        <div className="flex items-center gap-2">
          <SortAsc size={16} className="text-muted-foreground" />
          <Label className="whitespace-nowrap">Sort by:</Label>
        </div>
        <Select value={sortOption} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[160px] ml-2 h-9">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="bedrooms_desc">Most Bedrooms</SelectItem>
            <SelectItem value="nearest">Nearest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FilterSortPanel;
