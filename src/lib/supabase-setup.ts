
import { supabase } from './supabase';

export async function setupSupabaseStorage() {
  try {
    console.log('Setting up Supabase storage...');
    
    // Check if 'properties' bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking buckets:', bucketsError);
      return false;
    }
    
    const propertiesBucketExists = buckets.some(bucket => bucket.name === 'properties');
    
    // If bucket doesn't exist, create it
    if (!propertiesBucketExists) {
      console.log('Creating properties bucket...');
      const { error: createError } = await supabase.storage.createBucket('properties', {
        public: true,
        fileSizeLimit: null // Allow unlimited file size for videos
      });
      
      if (createError) {
        console.error('Error creating properties bucket:', createError);
        // Continue execution even if bucket creation fails
        // This handles the case where the user doesn't have permission to create buckets
        console.log('Continuing without properties bucket');
        return true; // Return true to allow the app to continue loading
      }
      
      // Update bucket to be public
      const { error: updateError } = await supabase.storage.updateBucket('properties', {
        public: true,
        fileSizeLimit: null // Allow unlimited file size for videos
      });
      
      if (updateError) {
        console.error('Error updating properties bucket visibility:', updateError);
        return true; // Return true to allow the app to continue loading
      }
    } else {
      console.log('Properties bucket already exists');
      
      // Ensure bucket is public with unlimited file size
      const { error: updateError } = await supabase.storage.updateBucket('properties', {
        public: true,
        fileSizeLimit: null // Allow unlimited file size for videos
      });
      
      if (updateError) {
        console.error('Error updating properties bucket visibility:', updateError);
        return true; // Return true to allow the app to continue loading
      }
    }
    
    console.log('Supabase storage setup complete');
    return true;
  } catch (error) {
    console.error('Unexpected error setting up Supabase storage:', error);
    return true; // Return true to allow the app to continue loading even if there's an error
  }
}
