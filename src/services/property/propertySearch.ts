
import { supabase } from "@/lib/supabase";
import { PropertyData } from "@/components/PropertyCard";
import { PropertyFilter, SortOption } from "./types";
import { applyPropertyFilters, applySorting } from "./filters";
import { applyDistanceFilter, mapPropertyItemsToData } from "./utils";

/**
 * Get all properties with optional filters and sorting
 */
export const getProperties = async (
  filters?: PropertyFilter,
  sortOption?: SortOption
): Promise<PropertyData[]> => {
  try {
    let query = supabase
      .from('properties')
      .select('*');
    
    // Apply filters  
    query = applyPropertyFilters(query, filters);
    
    // Apply sorting
    query = applySorting(query, sortOption);
    
    const { data, error } = await query;
      
    if (error) throw error;
    
    // Map database items to frontend data format
    let properties = mapPropertyItemsToData(data);
    
    // Apply distance filtering and sorting if needed
    if (filters?.nearLocation && filters.maxDistance) {
      properties = applyDistanceFilter(
        properties, 
        filters.nearLocation, 
        filters.maxDistance, 
        sortOption === 'nearest'
      );
    }
    
    return properties;
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
};

/**
 * Search properties by college name with optional filters and sorting
 */
export const searchPropertiesByCollege = async (
  collegeName: string, 
  filters?: PropertyFilter,
  sortOption?: SortOption
): Promise<PropertyData[]> => {
  try {
    // If filters already include college or college name is empty, use regular search
    if (filters?.college || !collegeName.trim()) {
      return getProperties(filters, sortOption);
    }
    
    let query = supabase
      .from('properties')
      .select('*')
      .ilike('nearby_college', `%${collegeName}%`);
      
    // Apply filters
    query = applyPropertyFilters(query, filters);
    
    // Apply sorting
    query = applySorting(query, sortOption);
    
    const { data, error } = await query;
      
    if (error) throw error;
    
    // Map database items to frontend data format
    let properties = mapPropertyItemsToData(data);
    
    // Apply distance filtering and sorting if needed
    if (filters?.nearLocation && filters.maxDistance) {
      properties = applyDistanceFilter(
        properties, 
        filters.nearLocation, 
        filters.maxDistance, 
        sortOption === 'nearest'
      );
    }
    
    return properties;
  } catch (error) {
    console.error('Error searching properties by college:', error);
    return [];
  }
};
