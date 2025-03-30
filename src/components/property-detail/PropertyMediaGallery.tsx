import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, ChevronLeft, ChevronRight, Play, Pause, X, Maximize, Minimize, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [mediaError, setMediaError] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const galleryRef = useRef<HTMLDivElement>(null);

  // Filter out invalid media
  const validMedia = media.filter(item => item.url && (item.type === 'image' || item.type === 'video'));

  const pauseCurrentVideo = useCallback(() => {
    if (validMedia[currentIndex]?.type === 'video') {
      const video = videoRefs.current[currentIndex];
      if (video) {
        video.pause();
        setIsPlaying(false);
      }
    }
  }, [currentIndex, validMedia]);

  const handlePrevious = useCallback(() => {
    pauseCurrentVideo();
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? validMedia.length - 1 : prevIndex - 1
    );
  }, [validMedia.length, pauseCurrentVideo]);

  const handleNext = useCallback(() => {
    pauseCurrentVideo();
    setCurrentIndex(prevIndex => 
      prevIndex === validMedia.length - 1 ? 0 : prevIndex + 1
    );
  }, [validMedia.length, pauseCurrentVideo]);

  const togglePlay = useCallback(() => {
    const video = videoRefs.current[currentIndex];
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [currentIndex, isPlaying, videoRefs]);

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

  const handleMediaError = (type: 'image' | 'video', index: number) => {
    console.error(`Error loading ${type} at index ${index}`);
    setMediaError(`Error loading ${type}. Please try again.`);
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
        if (validMedia.length > 0 && validMedia[currentIndex]?.type === 'video') {
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
  }, [currentIndex, validMedia, isPlaying, fullscreen, handleNext, handlePrevious, togglePlay]);

  // Handle case when media array changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
    setMediaError(null);
  }, [media]);

  // Make sure currentIndex is valid
  useEffect(() => {
    if (validMedia.length > 0 && currentIndex >= validMedia.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, validMedia]);

  if (isLoading) {
    return <Skeleton className="w-full h-[300px] md:h-[400px] rounded-lg" />;
  }

  if (!validMedia || validMedia.length === 0) {
    return (
      <div className="relative h-96 rounded-xl overflow-hidden bg-muted flex flex-col items-center justify-center">
        <AlertTriangle size={48} className="text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg">No media available</p>
        <p className="text-muted-foreground text-sm mt-2">
          This property has no images or videos to display
        </p>
      </div>
    );
  }

  const currentMedia = validMedia[currentIndex];

  return (
    <div ref={galleryRef} className={`${fullscreen ? 'bg-black fixed inset-0 z-50 p-4' : ''}`}>
      <div className={`relative ${fullscreen ? 'h-full' : 'h-96'} rounded-xl overflow-hidden`}>
        {mediaError && (
          <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50">
            {mediaError}
            <button 
              onClick={() => setMediaError(null)}
              className="absolute right-2 top-2"
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        {currentMedia.type === 'image' ? (
          <img
            src={currentMedia.url}
            alt={`${title} - Image ${currentIndex + 1}`}
            className={`object-contain ${fullscreen ? 'w-full h-full' : 'object-cover w-full h-full'}`}
            onError={() => handleMediaError('image', currentIndex)}
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
            onError={() => handleMediaError('video', currentIndex)}
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
          {currentMedia.type === 'image' ? 'Image' : 'Video'} {currentIndex + 1} of {validMedia.length}
        </div>
      </div>

      {/* Thumbnails */}
      {validMedia.length > 1 && !fullscreen && (
        <div className="mt-4 grid grid-cols-5 gap-2 overflow-x-auto pb-2">
          {validMedia.map((item, index) => (
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
                      // Replace with error placeholder
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
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyMediaGallery;
