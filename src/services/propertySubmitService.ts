
import { supabase } from "@/lib/supabase";
import { MediaItem, PropertyFormData, Coordinates } from "@/types/property";

export const submitProperty = async (
  formData: PropertyFormData,
  coordinates: Coordinates,
  media: MediaItem[]
) => {
  // Data validation before insert
  if (!formData.title || !formData.address || isNaN(parseFloat(formData.price)) || !coordinates.lat || !coordinates.lng) {
    throw new Error("Required fields are missing");
  }

  if (media.length === 0) {
    throw new Error("At least one image or video is required");
  }

  // Get first image for the main image_url
  const mainImageUrl = media.find(item => item.type === 'image')?.url || media[0].url;

  // Convert numeric fields
  const numericPrice = parseFloat(formData.price);
  const numericBedrooms = parseInt(formData.bedrooms);
  const numericBathrooms = parseInt(formData.bathrooms);
  const numericSquareFeet = parseInt(formData.square_feet);
  const numericFloorNumber = parseInt(formData.floor_number);
  const numericDepositAmount = formData.deposit_amount ? parseFloat(formData.deposit_amount) : null;

  // Create the property record
  const { data, error } = await supabase
    .from('properties')
    .insert([
      {
        title: formData.title,
        address: formData.address,
        price: numericPrice,
        bedrooms: numericBedrooms,
        bathrooms: numericBathrooms,
        square_feet: numericSquareFeet,
        description: formData.description,
        available_from: formData.available_from,
        image_url: mainImageUrl, // First image as the main image
        media: media, // All media items as a JSON array
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        has_hall: formData.has_hall,
        has_separate_kitchen: formData.has_separate_kitchen,
        nearby_college: formData.nearby_college || "Not specified",
        // New fields
        floor_number: numericFloorNumber,
        property_type: formData.property_type,
        gender_preference: formData.gender_preference,
        restrictions: formData.restrictions,
        deposit_amount: numericDepositAmount,
      }
    ])
    .select();

  if (error) {
    console.error('Supabase error details:', error);
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
};
