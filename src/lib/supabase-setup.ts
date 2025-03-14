
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
        public: true
      });
      
      if (createError) {
        console.error('Error creating properties bucket:', createError);
        return false;
      }
      
      // Update bucket to be public
      const { error: updateError } = await supabase.storage.updateBucket('properties', {
        public: true
      });
      
      if (updateError) {
        console.error('Error updating properties bucket visibility:', updateError);
        return false;
      }
    } else {
      console.log('Properties bucket already exists');
      
      // Ensure bucket is public
      const { error: updateError } = await supabase.storage.updateBucket('properties', {
        public: true
      });
      
      if (updateError) {
        console.error('Error updating properties bucket visibility:', updateError);
      }
    }
    
    console.log('Supabase storage setup complete');
    return true;
  } catch (error) {
    console.error('Unexpected error setting up Supabase storage:', error);
    return false;
  }
}
