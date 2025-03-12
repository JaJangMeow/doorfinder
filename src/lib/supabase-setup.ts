
import { supabase } from './supabase';

export const setupSupabaseStorage = async () => {
  try {
    // Check if properties bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking buckets:', bucketsError);
      return;
    }
    
    const propertiesBucketExists = buckets.some(bucket => bucket.name === 'properties');
    
    // Create the bucket if it doesn't exist
    if (!propertiesBucketExists) {
      const { error: createError } = await supabase.storage.createBucket('properties', {
        public: true,
        fileSizeLimit: 100000000, // 100MB
      });
      
      if (createError) {
        console.error('Error creating properties bucket:', createError);
        return;
      }
      
      console.log('Created "properties" storage bucket');
      
      // Set up bucket policies
      const { error: policyError } = await supabase.storage.from('properties')
        .setPublic(['property_images/*', 'property_videos/*']);
        
      if (policyError) {
        console.error('Error setting bucket policy:', policyError);
      }
    }
  } catch (error) {
    console.error('Error setting up Supabase storage:', error);
  }
};
