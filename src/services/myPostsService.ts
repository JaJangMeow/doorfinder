
import { supabase } from "@/lib/supabase";
import { PropertyData } from "@/components/PropertyCard";

export const fetchUserListings = async (): Promise<PropertyData[]> => {
  // Get current user
  const { data: sessionData } = await supabase.auth.getSession();
  
  if (!sessionData.session) {
    return [];
  }
  
  // Get user's own listings
  const { data: listingsData, error: listingsError } = await supabase
    .from('properties')
    .select('*')
    .eq('owner_id', sessionData.session.user.id)
    .order('created_at', { ascending: false });
  
  if (listingsError) throw listingsError;
  
  // Transform the data to match PropertyData interface
  const propertyData: PropertyData[] = listingsData.map(item => ({
    id: item.id,
    title: item.title,
    address: item.address,
    price: item.price,
    bedrooms: item.bedrooms,
    bathrooms: item.bathrooms || 1,
    availableFrom: item.available_from,
    imageUrl: item.images && item.images.length > 0 
      ? item.images[0] 
      : 'https://via.placeholder.com/640x360',
    latitude: item.latitude,
    longitude: item.longitude,
    hasHall: item.has_hall,
    hasSeparateKitchen: item.has_separate_kitchen
  }));
  
  return propertyData;
};

export const deleteUserListing = async (propertyId: string): Promise<void> => {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', propertyId);
    
  if (error) throw error;
};
