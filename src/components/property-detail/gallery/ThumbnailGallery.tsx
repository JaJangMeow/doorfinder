
import React, { useState } from 'react';
import { Play, ImageOff } from 'lucide-react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { MediaItem } from '../types';

interface ThumbnailGalleryProps {
  media: MediaItem[];
  title: string;
  currentIndex: number;
  onThumbnailClick: (index: number) => void;
}

const ThumbnailGallery: React.FC<ThumbnailGalleryProps> = ({
  media,
  title,
  currentIndex,
  onThumbnailClick
}) => {
  const [thumbnailErrors, setThumbnailErrors] = useState<Record<number, boolean>>({});
  
  const handleThumbnailError = (index: number) => {
    setThumbnailErrors(prev => ({...prev, [index]: true}));
  };

  return (
    <Carousel className="w-full">
      <CarouselContent className="py-1">
        {media.map((item, index) => (
          <CarouselItem key={index} className="basis-1/5 min-w-20">
            <div 
              onClick={() => onThumbnailClick(index)}
              className={`relative h-20 rounded-md overflow-hidden cursor-pointer transition-all ${
                index === currentIndex ? 'ring-2 ring-primary scale-[0.97]' : 'opacity-70 hover:opacity-100'
              }`}
            >
              {item.type === 'image' ? (
                thumbnailErrors[index] ? (
                  <div className="h-full w-full flex items-center justify-center bg-muted">
                    <ImageOff size={16} className="text-muted-foreground" />
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={`${title} - Thumbnail ${index + 1}`}
                    className="object-cover w-full h-full"
                    loading="lazy"
                    onError={() => handleThumbnailError(index)}
                  />
                )
              ) : (
                <div className="relative w-full h-full">
                  <video
                    src={item.url}
                    className="object-cover w-full h-full"
                    onError={() => handleThumbnailError(index)}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play size={16} className="text-white" />
                  </div>
                </div>
              )}
              
              {/* Highlight current item with an indicator */}
              {index === currentIndex && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-primary"></div>
              )}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {media.length > 5 && (
        <>
          <CarouselPrevious className="left-0 translate-x-0" />
          <CarouselNext className="right-0 translate-x-0" />
        </>
      )}
    </Carousel>
  );
};

export default ThumbnailGallery;
