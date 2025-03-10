import { supabase } from "@/lib/supabase";
import { PropertyData } from "@/components/PropertyCard";
import { PropertyDetailData } from "@/components/PropertyDetail";

// All properties can include distance property for sorting
export interface PropertyFilter {
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number; 
  maxBathrooms?: number;
  availableFrom?: string;
  maxDistance?: number;
  nearLocation?: {
    lat: number;
    lng: number;
  };
  college?: string;
  hasHall?: boolean;
  hasSeparateKitchen?: boolean;
}

export type SortOption = 'price_asc' | 'price_desc' | 'bedrooms_desc' | 'newest' | 'oldest' | 'nearest';

// List of colleges in Bangalore
export const BANGALORE_COLLEGES = [
  'Christ University',
  'Bangalore University',
  'Jain University',
  'RV College of Engineering',
  'PES University',
  'MS Ramaiah Institute of Technology',
  'Bangalore Institute of Technology',
  'Mount Carmel College',
  'St. Joseph\'s College',
  'Indian Institute of Science (IISc)',
  'National Law School of India University',
  'Kristu Jayanti College',
  'Presidency College',
  'Alliance University',
  'Bangalore Medical College',
  'Reva University',
  'BMS College of Engineering',
  'New Horizon College'
];

export const getProperties = async (
  filters?: PropertyFilter,
  sortOption?: SortOption
): Promise<PropertyData[]> => {
  try {
    let query = supabase
      .from('properties')
      .select('*');
      
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
      
      if (filters.minBathrooms) {
        query = query.gte('bathrooms', filters.minBathrooms);
      }
      
      if (filters.maxBathrooms) {
        query = query.lte('bathrooms', filters.maxBathrooms);
      }
      
      if (filters.availableFrom) {
        query = query.gte('available_from', filters.availableFrom);
      }
      
      if (filters.college) {
        query = query.ilike('nearby_college', `%${filters.college}%`);
      }

      if (filters.hasHall !== undefined) {
        query = query.eq('has_hall', filters.hasHall);
      }

      if (filters.hasSeparateKitchen !== undefined) {
        query = query.eq('has_separate_kitchen', filters.hasSeparateKitchen);
      }
    }
    
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
    
    const { data, error } = await query;
      
    if (error) throw error;
    
    let properties = data.map((item: any) => ({
      id: item.id,
      title: item.title,
      address: item.address,
      price: item.price,
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms || 1,
      availableFrom: item.available_from,
      imageUrl: item.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2673&q=80',
      latitude: item.latitude,
      longitude: item.longitude,
      hasHall: item.has_hall,
      hasSeparateKitchen: item.has_separate_kitchen,
      distance: undefined // Initialize with undefined
    }));
    
    if (filters?.nearLocation && filters.maxDistance) {
      properties = properties.filter(property => {
        if (!property.latitude || !property.longitude) return false;
        
        const distance = calculateDistance(
          filters.nearLocation.lat,
          filters.nearLocation.lng,
          property.latitude,
          property.longitude
        );
        
        // Explicitly assign distance to property
        property.distance = distance;
        
        return distance <= filters.maxDistance;
      });
      
      if (sortOption === 'nearest') {
        properties.sort((a, b) => {
          const distanceA = a.distance !== undefined ? a.distance : Infinity;
          const distanceB = b.distance !== undefined ? b.distance : Infinity;
          return distanceA - distanceB;
        });
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
    if (!collegeName.trim()) {
      return getProperties(filters, sortOption);
    }
    
    let query = supabase
      .from('properties')
      .select('*')
      .ilike('nearby_college', `%${collegeName}%`);
      
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
      
      if (filters.minBathrooms) {
        query = query.gte('bathrooms', filters.minBathrooms);
      }
      
      if (filters.maxBathrooms) {
        query = query.lte('bathrooms', filters.maxBathrooms);
      }
      
      if (filters.availableFrom) {
        query = query.gte('available_from', filters.availableFrom);
      }
      
      if (filters.hasHall !== undefined) {
        query = query.eq('has_hall', filters.hasHall);
      }

      if (filters.hasSeparateKitchen !== undefined) {
        query = query.eq('has_separate_kitchen', filters.hasSeparateKitchen);
      }
    }
    
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
    
    const { data, error } = await query;
      
    if (error) throw error;
    
    let properties = data.map((item: any) => ({
      id: item.id,
      title: item.title,
      address: item.address,
      price: item.price,
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms || 1,
      availableFrom: item.available_from,
      imageUrl: item.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2673&q=80',
      latitude: item.latitude,
      longitude: item.longitude,
      hasHall: item.has_hall,
      hasSeparateKitchen: item.has_separate_kitchen,
      distance: undefined // Initialize with undefined
    }));
    
    if (filters?.nearLocation && filters.maxDistance) {
      properties = properties.filter(property => {
        if (!property.latitude || !property.longitude) return false;
        
        const distance = calculateDistance(
          filters.nearLocation.lat,
          filters.nearLocation.lng,
          property.latitude,
          property.longitude
        );
        
        // Explicitly assign distance to property
        property.distance = distance;
        
        return distance <= filters.maxDistance;
      });
      
      if (sortOption === 'nearest') {
        properties.sort((a, b) => {
          const distanceA = a.distance !== undefined ? a.distance : Infinity;
          const distanceB = b.distance !== undefined ? b.distance : Infinity;
          return distanceA - distanceB;
        });
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
      longitude: data.longitude,
      hasHall: data.has_hall,
      hasSeparateKitchen: data.has_separate_kitchen,
      nearbyCollege: data.nearby_college || 'Not specified'
    };
  } catch (error) {
    console.error('Error fetching property details:', error);
    return null;
  }
};

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
