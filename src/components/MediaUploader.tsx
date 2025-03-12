
import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Video, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";

interface MediaFile {
  url: string;
  type: 'image' | 'video';
}

interface MediaUploaderProps {
  onMediaChange: (media: MediaFile[]) => void;
  initialMedia?: MediaFile[];
  maxImages?: number;
  maxVideos?: number;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ 
  onMediaChange, 
  initialMedia = [], 
  maxImages = 10,
  maxVideos = 5
}) => {
  const [media, setMedia] = useState<MediaFile[]>(initialMedia);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const imageCount = media.filter(item => item.type === 'image').length;
  const videoCount = media.filter(item => item.type === 'video').length;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    // Check if we're exceeding the max media count
    if (imageCount + imageFiles.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload a maximum of ${maxImages} images`,
        variant: "destructive",
      });
      return;
    }

    if (videoCount + videoFiles.length > maxVideos) {
      toast({
        title: "Too many videos",
        description: `You can only upload a maximum of ${maxVideos} videos`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Process files one by one to track progress
      const uploadedMedia: MediaFile[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileType = file.type.startsWith('image/') ? 'image' : 'video';
        
        // Validate file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image or video file`,
            variant: "destructive",
          });
          continue;
        }
        
        // Create a unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `property_${fileType}s/${fileName}`;

        console.log('Attempting to upload to path:', filePath);

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('properties')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          console.error(`Error uploading ${fileType}:`, error);
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}. ${error.message}`,
            variant: "destructive",
          });
          continue;
        }

        console.log('Upload successful, data:', data);

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('properties')
          .getPublicUrl(filePath);

        console.log('Public URL:', publicUrl);
        uploadedMedia.push({ url: publicUrl, type: fileType });
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }
      
      if (uploadedMedia.length > 0) {
        const newMedia = [...media, ...uploadedMedia];
        setMedia(newMedia);
        onMediaChange(newMedia);
        
        toast({
          title: "Upload successful",
          description: `Successfully uploaded ${uploadedMedia.filter(m => m.type === 'image').length} image(s) and ${uploadedMedia.filter(m => m.type === 'video').length} video(s)`,
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

  const removeMedia = (indexToRemove: number) => {
    const newMedia = media.filter((_, index) => index !== indexToRemove);
    setMedia(newMedia);
    onMediaChange(newMedia);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {media.map((item, index) => (
          <div key={index} className="relative rounded-md overflow-hidden h-32 bg-muted">
            {item.type === 'image' ? (
              <img 
                src={item.url} 
                alt={`Property image ${index + 1}`} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="relative w-full h-full bg-black/10">
                <video 
                  src={item.url} 
                  className="h-full w-full object-cover"
                  controls={false}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="text-white/80 h-10 w-10" />
                </div>
              </div>
            )}
            <button 
              onClick={() => removeMedia(index)} 
              className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        
        {(imageCount < maxImages || videoCount < maxVideos) && (
          <label className="border-2 border-dashed border-muted-foreground/30 rounded-md h-32 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
            <input 
              type="file" 
              accept="image/*,video/*" 
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
                  Click to add media
                </span>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <ImageIcon size={12} className="mr-1" />
                  <span>{imageCount}/{maxImages}</span>
                  <Video size={12} className="ml-2 mr-1" />
                  <span>{videoCount}/{maxVideos}</span>
                </div>
              </>
            )}
          </label>
        )}
      </div>
      
      <div className="text-sm text-muted-foreground flex items-center">
        <ImageIcon size={16} className="mr-1" />
        <span>
          {imageCount} of {maxImages} images uploaded
        </span>
        <Video size={16} className="ml-4 mr-1" />
        <span>
          {videoCount} of {maxVideos} videos uploaded
        </span>
      </div>
      {media.length === 0 && (
        <div className="text-xs text-amber-500">
          • Upload at least one photo or video to showcase your property
          <br />
          • Media should be clear and well-lit
          <br />
          • Include photos/videos of all rooms, kitchen, bathroom and exterior
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
