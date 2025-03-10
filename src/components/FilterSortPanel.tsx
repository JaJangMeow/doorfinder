
import React, { useState } from 'react';
import { 
  Filter, SortAsc, SortDesc, Calendar, ChevronsUpDown, 
  Home, DollarSign, ArrowDown, ArrowUp, Bed 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PropertyFilter, SortOption } from '@/services/propertyService';
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
    availableFrom: undefined
  });
  
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value === '' ? undefined : Number(value)
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value
    }));
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
      availableFrom: undefined
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
                <Calendar size={16} className="text-muted-foreground" />
                <Label>Available From</Label>
              </div>
              <Input
                type="date"
                name="availableFrom"
                value={filters.availableFrom || ''}
                onChange={handleDateChange}
              />
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
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FilterSortPanel;
