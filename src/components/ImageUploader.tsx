
import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";

interface ImageUploaderProps {
  onImagesChange: (urls: string[]) => void;
  initialImages?: string[];
  maxImages?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImagesChange, 
  initialImages = [], 
  maxImages = 5 
}) => {
  const [images, setImages] = useState<string[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    
    // Check if we're exceeding the max image count
    if (images.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload a maximum of ${maxImages} images`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Process files one by one to track progress
      const uploadedUrls = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds the 5MB size limit`,
            variant: "destructive",
          });
          continue;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image file`,
            variant: "destructive",
          });
          continue;
        }
        
        // Create a unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `property_images/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('properties')
          .upload(filePath, file);

        if (error) {
          console.error('Error uploading image:', error);
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}. ${error.message}`,
            variant: "destructive",
          });
          continue;
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('properties')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }
      
      if (uploadedUrls.length > 0) {
        const newImages = [...images, ...uploadedUrls];
        setImages(newImages);
        onImagesChange(newImages);
        
        toast({
          title: "Upload successful",
          description: `Successfully uploaded ${uploadedUrls.length} image(s)`,
        });
      }
    } catch (error) {
      console.error('Error in upload process:', error);
      toast({
        title: "Upload error",
        description: "An unexpected error occurred during the upload process",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative rounded-md overflow-hidden h-32 bg-muted">
            <img 
              src={url} 
              alt={`Property image ${index + 1}`} 
              className="h-full w-full object-cover"
            />
            <button 
              onClick={() => removeImage(index)} 
              className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        
        {images.length < maxImages && (
          <label className="border-2 border-dashed border-muted-foreground/30 rounded-md h-32 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleFileChange} 
              className="hidden" 
              disabled={isUploading}
            />
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 size={24} className="animate-spin text-primary mb-2" />
                <span className="text-sm text-muted-foreground">
                  Uploading... {uploadProgress}%
                </span>
              </div>
            ) : (
              <>
                <Upload size={24} className="text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Click to add images
                </span>
              </>
            )}
          </label>
        )}
      </div>
      
      <div className="text-sm text-muted-foreground flex items-center">
        <ImageIcon size={16} className="mr-1" />
        <span>
          {images.length} of {maxImages} images uploaded. 
          {images.length === 0 && " At least one image is required."}
        </span>
      </div>
      {images.length === 0 && (
        <div className="text-xs text-amber-500">
          • Upload at least one photo to showcase your property
          <br />
          • Photos should be clear and well-lit
          <br />
          • Include photos of all rooms, kitchen, bathroom and exterior
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
