
import { supabase } from "@/lib/supabase";
import { PropertyData } from "@/components/PropertyCard";
import { PropertyDetailData } from "@/components/PropertyDetail";

export interface PropertyFilter {
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  availableFrom?: string;
  maxDistance?: number;
  nearLocation?: {
    lat: number;
    lng: number;
  };
}

export type SortOption = 'price_asc' | 'price_desc' | 'bedrooms_desc' | 'newest' | 'oldest' | 'nearest';

export const getProperties = async (
  filters?: PropertyFilter,
  sortOption?: SortOption
): Promise<PropertyData[]> => {
  try {
    let query = supabase
      .from('properties')
      .select('*');
      
    // Apply filters if provided
    if (filters) {
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
      
      if (filters.availableFrom) {
        query = query.gte('available_from', filters.availableFrom);
      }
    }
    
    // Apply sorting
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
      // Default sorting is newest first
      query = query.order('created_at', { ascending: false });
    }
    
    const { data, error } = await query;
      
    if (error) throw error;
    
    let properties = data.map((item: any) => ({
      id: item.id,
      title: item.title,
      address: item.address,
      price: item.price,
      bedrooms: item.bedrooms,
      availableFrom: item.available_from,
      imageUrl: item.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2673&q=80',
      latitude: item.latitude,
      longitude: item.longitude
    }));
    
    // Calculate distance and filter by max distance if needed
    if (filters?.nearLocation && filters.maxDistance) {
      properties = properties.filter(property => {
        if (!property.latitude || !property.longitude) return false;
        
        // Calculate distance using the Haversine formula
        const distance = calculateDistance(
          filters.nearLocation.lat,
          filters.nearLocation.lng,
          property.latitude,
          property.longitude
        );
        
        // Add the distance to the property object for sorting
        property.distance = distance;
        
        // Filter by max distance (in kilometers)
        return distance <= filters.maxDistance;
      });
      
      // Sort by distance if 'nearest' sort option is selected
      if (sortOption === 'nearest') {
        properties.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      }
    }
    
    return properties;
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
};

export const searchPropertiesByCollege = async (
  collegeName: string, 
  filters?: PropertyFilter,
  sortOption?: SortOption
): Promise<PropertyData[]> => {
  try {
    // If no college name provided, return filtered properties
    if (!collegeName.trim()) {
      return getProperties(filters, sortOption);
    }
    
    // Search for the college name in the description field (which includes the nearby_college information)
    let query = supabase
      .from('properties')
      .select('*')
      .ilike('description', `%${collegeName}%`);
      
    // Apply filters if provided
    if (filters) {
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
      
      if (filters.availableFrom) {
        query = query.gte('available_from', filters.availableFrom);
      }
    }
    
    // Apply sorting
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
      // Default sorting is newest first
      query = query.order('created_at', { ascending: false });
    }
    
    const { data, error } = await query;
      
    if (error) throw error;
    
    let properties = data.map((item: any) => ({
      id: item.id,
      title: item.title,
      address: item.address,
      price: item.price,
      bedrooms: item.bedrooms,
      availableFrom: item.available_from,
      imageUrl: item.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2673&q=80',
      latitude: item.latitude,
      longitude: item.longitude
    }));
    
    // Calculate distance and filter by max distance if needed
    if (filters?.nearLocation && filters.maxDistance) {
      properties = properties.filter(property => {
        if (!property.latitude || !property.longitude) return false;
        
        // Calculate distance using the Haversine formula
        const distance = calculateDistance(
          filters.nearLocation.lat,
          filters.nearLocation.lng,
          property.latitude,
          property.longitude
        );
        
        // Add the distance to the property object for sorting
        property.distance = distance;
        
        // Filter by max distance (in kilometers)
        return distance <= filters.maxDistance;
      });
      
      // Sort by distance if 'nearest' sort option is selected
      if (sortOption === 'nearest') {
        properties.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      }
    }
    
    return properties;
  } catch (error) {
    console.error('Error searching properties by college:', error);
    return [];
  }
};

export const getPropertyById = async (id: string): Promise<PropertyDetailData | null> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      title: data.title,
      address: data.address,
      price: data.price,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms || 1,
      squareFeet: data.square_feet || 800,
      availableFrom: data.available_from,
      description: data.description || 'No description available.',
      images: data.images || [data.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2673&q=80'],
      contactName: data.contact_name || 'Property Manager',
      contactEmail: data.contact_email || 'contact@example.com',
      contactPhone: data.contact_phone || '(555) 123-4567',
      latitude: data.latitude,
      longitude: data.longitude
    };
  } catch (error) {
    console.error('Error fetching property details:', error);
    return null;
  }
};

// Helper function to calculate distance between two points using the Haversine formula
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};
