
import { PropertyData } from "@/components/PropertyCard";

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

export interface PropertyItem {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms?: number;
  available_from: string;
  image_url?: string;
  latitude: number | null;
  longitude: number | null;
  has_hall?: boolean;
  has_separate_kitchen?: boolean;
  property_type?: 'rental' | 'pg';
  gender_preference?: 'boys' | 'girls' | 'any';
  floor_number?: number;
  deposit_amount?: number;
}
