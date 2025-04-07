
import { supabase } from "@/lib/supabase";
import { PropertyDetailData } from "@/components/property-detail/types";

/**
 * Get detailed property information by ID
 */
export const getPropertyById = async (id: string): Promise<PropertyDetailData | null> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    if (!data) return null;
    
    // Create a default fallback image
    const fallbackImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2673&q=80';
    
    // Process media data from the database
    let mediaItems = [];
    
    // First try to use the media JSON field
    if (data.media && Array.isArray(data.media)) {
      mediaItems = data.media;
    } 
    // Then try to use the images array
    else if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      mediaItems = data.images.map(url => ({ url, type: 'image' }));
    } 
    // If a single image_url is available, use that
    else if (data.image_url) {
      mediaItems = [{ url: data.image_url, type: 'image' }];
    }
    
    // Validate each media item
    mediaItems = mediaItems.filter(item => 
      item && 
      item.url && 
      typeof item.url === 'string' && 
      item.url.trim() !== '' &&
      (item.type === 'image' || item.type === 'video')
    );
    
    console.log('Processed media items:', mediaItems);
    
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
      images: data.images || [data.image_url || fallbackImage],
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
