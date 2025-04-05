
import React from 'react';
import { Play } from 'lucide-react';
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
                <img
                  src={item.url}
                  alt={`${title} - Thumbnail ${index + 1}`}
                  className="object-cover w-full h-full"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2673&q=80';
                  }}
                />
              ) : (
                <div className="relative w-full h-full">
                  <video
                    src={item.url}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.classList.add('bg-gray-200');
                        const errorIcon = document.createElement('div');
                        errorIcon.className = 'absolute inset-0 flex items-center justify-center bg-gray-100';
                        errorIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
                        parent.appendChild(errorIcon);
                      }
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play size={16} className="text-white" />
                  </div>
                </div>
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
