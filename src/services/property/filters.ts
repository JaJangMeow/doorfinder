
import { supabase } from "@/lib/supabase";
import { PropertyFilter } from "./types";

/**
 * Apply filters to a Supabase query
 */
export const applyPropertyFilters = (query: any, filters?: PropertyFilter) => {
  if (!filters) return query;
  
  if (filters.college) {
    const colleges = filters.college.split(',');
    if (colleges.length === 1) {
      query = query.ilike('nearby_college', `%${colleges[0]}%`);
    } else if (colleges.length > 1) {
      let collegeFilter = '';
      colleges.forEach((college, index) => {
        collegeFilter += `nearby_college.ilike.%${college}%`;
        if (index < colleges.length - 1) {
          collegeFilter += ',';
        }
      });
      query = query.or(collegeFilter);
    }
  }
  
  if (filters.propertyType) {
    query = query.eq('property_type', filters.propertyType);
  }
  
  if (filters.hasHall !== undefined) {
    query = query.eq('has_hall', filters.hasHall);
  }

  if (filters.hasSeparateKitchen !== undefined) {
    query = query.eq('has_separate_kitchen', filters.hasSeparateKitchen);
  }
  
  if (filters.hasFurnished !== undefined) {
    query = query.eq('is_furnished', filters.hasFurnished);
  }
  
  if (filters.hasAC !== undefined) {
    query = query.eq('has_ac', filters.hasAC);
  }
  
  if (filters.hasWifi !== undefined) {
    query = query.eq('has_wifi', filters.hasWifi);
  }
  
  if (filters.hasGym !== undefined) {
    query = query.eq('has_gym', filters.hasGym);
  }
  
  if (filters.minPrice) {
    query = query.gte('price', filters.minPrice);
  }
  
  if (filters.maxPrice) {
    query = query.lte('price', filters.maxPrice);
  }
  
  if (filters.minBedrooms) {
    query = query.gte('bedrooms', filters.minBedrooms);
  }
  
  if (filters.maxBedrooms) {
    query = query.lte('bedrooms', filters.maxBedrooms);
  }
  
  if (filters.minBathrooms) {
    query = query.gte('bathrooms', filters.minBathrooms);
  }
  
  if (filters.maxBathrooms) {
    query = query.lte('bathrooms', filters.maxBathrooms);
  }
  
  if (filters.availableFrom) {
    query = query.gte('available_from', filters.availableFrom);
  }
  
  if (filters.genderPreference) {
    if (filters.genderPreference === 'any') {
      // If 'any' is selected, we want to show all properties including those 
      // specifically for boys or girls and those with no preference
      // No additional filter needed
    } else {
      // Show only properties for the specific gender or with no preference ('any')
      query = query.or(`gender_preference.eq.${filters.genderPreference},gender_preference.eq.any`);
    }
  }
  
  if (filters.floorNumber !== undefined) {
    query = query.eq('floor_number', filters.floorNumber);
  }
  
  return query;
};

/**
 * Apply sorting to a Supabase query
 */
export const applySorting = (query: any, sortOption?: string) => {
  if (sortOption) {
    switch (sortOption) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'bedrooms_desc':
        query = query.order('bedrooms', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }
  } else {
    query = query.order('created_at', { ascending: false });
  }
  
  return query;
};
