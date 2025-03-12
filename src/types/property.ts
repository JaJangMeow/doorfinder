
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

export interface PropertyFormData {
  title: string;
  address: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  square_feet: string;
  description: string;
  available_from: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  has_hall: boolean;
  has_separate_kitchen: boolean;
  nearby_college: string;
  floor_number: string;
  property_type: string;
  gender_preference: string;
  restrictions: string;
  deposit_amount: string;
}
