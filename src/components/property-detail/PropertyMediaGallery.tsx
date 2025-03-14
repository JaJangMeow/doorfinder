
import React, { useState, useRef, useEffect } from 'react';
import { Heart, ChevronLeft, ChevronRight, Play, Pause, X, Maximize, Minimize } from 'lucide-react';
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
  const [fullscreen, setFullscreen] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const galleryRef = useRef<HTMLDivElement>(null);

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

  const toggleFullscreen = () => {
    if (!galleryRef.current) return;
    
    if (!fullscreen) {
      if (galleryRef.current.requestFullscreen) {
        galleryRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        const currentMedia = media[currentIndex];
        if (currentMedia?.type === 'video') {
          e.preventDefault();
          togglePlay();
        }
      } else if (e.key === 'Escape' && fullscreen) {
        document.exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, media, isPlaying, fullscreen]);

  if (!media || media.length === 0) {
    return (
      <div className="relative h-96 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">No media available</p>
      </div>
    );
  }

  const currentMedia = media[currentIndex];

  return (
    <div ref={galleryRef} className={`${fullscreen ? 'bg-black fixed inset-0 z-50 p-4' : ''}`}>
      <div className={`relative ${fullscreen ? 'h-full' : 'h-96'} rounded-xl overflow-hidden`}>
        {currentMedia.type === 'image' ? (
          <img
            src={currentMedia.url}
            alt={`${title} - Image ${currentIndex + 1}`}
            className={`object-contain ${fullscreen ? 'w-full h-full' : 'object-cover w-full h-full'}`}
          />
        ) : (
          <video
            ref={el => videoRefs.current[currentIndex] = el}
            src={currentMedia.url}
            className={`object-contain ${fullscreen ? 'w-full h-full' : 'object-cover w-full h-full'}`}
            controls={fullscreen}
            loop
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
        )}

        {/* Previous/Next buttons */}
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

        {/* Video controls */}
        {currentMedia.type === 'video' && !fullscreen && (
          <Button 
            variant="outline" 
            size="icon" 
            onClick={togglePlay}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </Button>
        )}

        {/* Fullscreen toggle */}
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleFullscreen}
          className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full"
        >
          {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </Button>

        {/* Save button */}
        {!fullscreen && (
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
        )}

        {/* Close fullscreen button */}
        {fullscreen && (
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => document.exitFullscreen()}
            className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm hover:bg-white"
          >
            <X size={20} />
          </Button>
        )}

        {/* Media type indicator */}
        <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {currentMedia.type === 'image' ? 'Image' : 'Video'} {currentIndex + 1} of {media.length}
        </div>
      </div>

      {/* Thumbnails */}
      {media.length > 1 && !fullscreen && (
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
