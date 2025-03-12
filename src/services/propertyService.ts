import { supabase } from "@/lib/supabase";
import { PropertyData } from "@/components/PropertyCard";
import { PropertyDetailData, MediaItem } from "@/components/property-detail";

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
  hasFurnished?: boolean;
  hasAC?: boolean;
  hasWifi?: boolean;
  hasGym?: boolean;
  propertyType?: 'rental' | 'pg';
  genderPreference?: 'boys' | 'girls' | 'any';
  floorNumber?: number;
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
      imageUrl: item.image_url || (item.media && item.media.length > 0 && item.media[0].type === 'image' ? 
        item.media[0].url : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2673&q=80'),
      latitude: item.latitude,
      longitude: item.longitude,
      hasHall: item.has_hall,
      hasSeparateKitchen: item.has_separate_kitchen,
      propertyType: item.property_type || 'rental',
      genderPreference: item.gender_preference || 'any',
      floorNumber: item.floor_number || 0,
      depositAmount: item.deposit_amount,
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
    if (filters?.college) {
      return getProperties(filters, sortOption);
    }
    
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
      
      if (filters.propertyType) {
        query = query.eq('property_type', filters.propertyType);
      }
      
      if (filters.genderPreference) {
        if (filters.genderPreference === 'any') {
          // If 'any' is selected, we want to show all properties
          // No additional filter needed
        } else {
          // Show only properties for the specific gender or with no preference ('any')
          query = query.or(`gender_preference.eq.${filters.genderPreference},gender_preference.eq.any`);
        }
      }
      
      if (filters.floorNumber !== undefined) {
        query = query.eq('floor_number', filters.floorNumber);
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
      imageUrl: item.image_url || (item.media && item.media.length > 0 && item.media[0].type === 'image' ? 
        item.media[0].url : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2673&q=80'),
      latitude: item.latitude,
      longitude: item.longitude,
      hasHall: item.has_hall,
      hasSeparateKitchen: item.has_separate_kitchen,
      propertyType: item.property_type || 'rental',
      genderPreference: item.gender_preference || 'any',
      floorNumber: item.floor_number || 0,
      depositAmount: item.deposit_amount,
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
    
    // Convert media from JSON to array of MediaItem
    let mediaItems: MediaItem[] = [];
    
    // Process media field if available
    if (data.media && Array.isArray(data.media)) {
      mediaItems = data.media as MediaItem[];
    } else if (data.images && Array.isArray(data.images)) {
      // Legacy support for images array
      mediaItems = data.images.map((url: string) => ({ url, type: 'image' as const }));
    }
    
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
      media: mediaItems,
      contactName: data.contact_name || 'Property Manager',
      contactEmail: data.contact_email || 'contact@example.com',
      contactPhone: data.contact_phone || '(555) 123-4567',
      latitude: data.latitude,
      longitude: data.longitude,
      hasHall: data.has_hall,
      hasSeparateKitchen: data.has_separate_kitchen,
      nearbyCollege: data.nearby_college || 'Not specified',
      propertyType: data.property_type || 'rental',
      genderPreference: data.gender_preference || 'any',
      floorNumber: data.floor_number || 0,
      depositAmount: data.deposit_amount,
      restrictions: data.restrictions
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
