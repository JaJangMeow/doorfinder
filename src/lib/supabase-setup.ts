
import { supabase } from './supabase';

export const setupSupabaseStorage = async () => {
  try {
    // Check if the "properties" bucket exists
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      throw bucketsError;
    }
    
    const propertiesBucketExists = buckets.some(bucket => bucket.name === 'properties');
    
    // Create the bucket if it doesn't exist
    if (!propertiesBucketExists) {
      try {
        const { data, error } = await supabase
          .storage
          .createBucket('properties', {
            public: true,
            fileSizeLimit: 5242880, // 5MB limit to avoid the "exceeded maximum allowed size" error
          });
        
        if (error) {
          throw error;
        }
        
        // Update bucket policies to make it public
        const { error: policyError } = await supabase
          .storage
          .bucket('properties')
          .update({ public: true });
        
        if (policyError) {
          console.error('Error setting bucket to public:', policyError);
        }
        
        console.log('Properties bucket created successfully');
      } catch (err) {
        console.error('Error creating properties bucket:', err);
        // Don't throw, allow app to continue even if bucket creation fails
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to setup storage:', error);
    // Don't throw, allow app to continue even if storage setup fails
    return false;
  }
};
