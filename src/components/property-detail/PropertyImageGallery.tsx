
import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropertyImageGalleryProps {
  images: string[];
  title: string;
  isSaved: boolean;
  isLoading: boolean;
  onSaveToggle: () => void;
}

const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({ 
  images, 
  title, 
  isSaved,
  isLoading,
  onSaveToggle
}) => {
  return (
    <div>
      <div className="relative h-96 rounded-xl overflow-hidden">
        <img
          src={images[0] || 'https://via.placeholder.com/640x360'}
          alt={title}
          className="object-cover w-full h-full"
        />
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onSaveToggle}
          disabled={isLoading}
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm hover:bg-white"
        >
          <Heart 
            className={isSaved ? "fill-primary text-primary" : "text-muted-foreground"} 
            size={20} 
          />
        </Button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {images.slice(1, 4).map((image, index) => (
          <div key={index} className="relative h-32 rounded-xl overflow-hidden">
            <img
              src={image || 'https://via.placeholder.com/640x360'}
              alt={`${title} - Image ${index + 2}`}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyImageGallery;
