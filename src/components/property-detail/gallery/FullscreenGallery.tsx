
import React from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaItem as MediaItemType } from '../types';
import MediaItem from './MediaItem';

interface FullscreenGalleryProps {
  media: MediaItemType[];
  title: string;
  currentIndex: number;
  isPlaying: boolean;
  galleryRef: React.RefObject<HTMLDivElement>;
  videoRefs: React.MutableRefObject<{ [key: number]: HTMLVideoElement | null }>;
  imageLoading: Record<number, boolean>;
  preloadedImages: Record<number, boolean>;
  onPrevious: () => void;
  onNext: () => void;
  onExitFullscreen: () => void;
  onMediaError: (type: 'image' | 'video', index: number) => void;
  onImageLoad: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
}

const FullscreenGallery: React.FC<FullscreenGalleryProps> = ({
  media,
  title,
  currentIndex,
  isPlaying,
  galleryRef,
  videoRefs,
  imageLoading,
  preloadedImages,
  onPrevious,
  onNext,
  onExitFullscreen,
  onMediaError,
  onImageLoad,
  setIsPlaying
}) => {
  const currentMedia = media[currentIndex];

  if (!currentMedia) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
        <div className="text-white text-center">
          <p>No media available</p>
          <Button 
            variant="outline" 
            onClick={onExitFullscreen}
            className="mt-4 bg-white/20 hover:bg-white/30 text-white"
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={galleryRef} className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onExitFullscreen}
          className="bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white"
        >
          <X size={20} />
        </Button>
      </div>
      
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-full h-full max-w-screen-xl max-h-screen flex items-center justify-center">
          <MediaItem 
            item={currentMedia} 
            title={title}
            index={currentIndex}
            currentIndex={currentIndex}
            isFullscreen={true}
            isPlaying={isPlaying}
            preloadedImages={preloadedImages}
            imageLoading={imageLoading}
            videoRefs={videoRefs}
            onMediaError={onMediaError}
            onImageLoad={onImageLoad}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
        
        {media.length > 1 && (
          <>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onPrevious}
              className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white rounded-full z-10"
            >
              <ChevronLeft size={24} />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onNext}
              className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white rounded-full z-10"
            >
              <ChevronRight size={24} />
            </Button>
          </>
        )}
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
          {currentIndex + 1} / {media.length}
        </div>
      </div>
    </div>
  );
};

export default FullscreenGallery;
