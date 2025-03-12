
import React, { useState, useRef } from 'react';
import { Heart, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface PropertyMediaGalleryProps {
  media: MediaItem[];
  title: string;
  isSaved: boolean;
  isLoading: boolean;
  onSaveToggle: () => void;
}

const PropertyMediaGallery: React.FC<PropertyMediaGalleryProps> = ({ 
  media, 
  title, 
  isSaved,
  isLoading,
  onSaveToggle
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handlePrevious = () => {
    pauseCurrentVideo();
    setCurrentIndex(prev => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNext = () => {
    pauseCurrentVideo();
    setCurrentIndex(prev => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const togglePlay = () => {
    const currentMedia = media[currentIndex];
    if (currentMedia.type === 'video') {
      const videoElement = videoRefs.current[currentIndex];
      if (videoElement) {
        if (isPlaying) {
          videoElement.pause();
        } else {
          videoElement.play();
        }
        setIsPlaying(!isPlaying);
      }
    }
  };

  const pauseCurrentVideo = () => {
    const currentMedia = media[currentIndex];
    if (currentMedia?.type === 'video') {
      const videoElement = videoRefs.current[currentIndex];
      if (videoElement) {
        videoElement.pause();
        setIsPlaying(false);
      }
    }
  };

  if (!media || media.length === 0) {
    return (
      <div className="relative h-96 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">No media available</p>
      </div>
    );
  }

  const currentMedia = media[currentIndex];

  return (
    <div>
      <div className="relative h-96 rounded-xl overflow-hidden">
        {currentMedia.type === 'image' ? (
          <img
            src={currentMedia.url}
            alt={`${title} - Image ${currentIndex + 1}`}
            className="object-cover w-full h-full"
          />
        ) : (
          <video
            ref={el => videoRefs.current[currentIndex] = el}
            src={currentMedia.url}
            className="object-cover w-full h-full"
            controls={false}
            loop
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
        )}

        {media.length > 1 && (
          <>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handlePrevious}
              className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full"
            >
              <ChevronLeft size={20} />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleNext}
              className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full"
            >
              <ChevronRight size={20} />
            </Button>
          </>
        )}

        {currentMedia.type === 'video' && (
          <Button 
            variant="outline" 
            size="icon" 
            onClick={togglePlay}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </Button>
        )}

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

      {media.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-2 overflow-x-auto pb-2">
          {media.map((item, index) => (
            <div 
              key={index} 
              onClick={() => {
                pauseCurrentVideo();
                setCurrentIndex(index);
              }}
              className={`relative h-20 rounded-md overflow-hidden cursor-pointer ${index === currentIndex ? 'ring-2 ring-primary' : ''}`}
            >
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={`${title} - Thumbnail ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="relative w-full h-full">
                  <video
                    src={item.url}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play size={16} className="text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyMediaGallery;
