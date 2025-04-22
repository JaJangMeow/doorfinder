
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MediaItem as MediaItemType } from './types';
import { 
  MediaItem,
  GalleryControls,
  FullscreenGallery,
  ThumbnailGallery,
  ErrorMessage,
  EmptyGalleryState,
  useGallery
} from './gallery';

interface PropertyMediaGalleryProps {
  media: MediaItemType[];
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
  // Use the full `useGallery` hook (make sure all returned properties are used!)
  const {
    validMedia,
    currentIndex,
    isPlaying,
    isFullscreen,
    mediaError,
    imageLoading,
    preloadedImages,
    videoRefs,
    galleryRef,
    handlePrevious,
    handleNext,
    togglePlay,
    enterFullscreen,
    exitFullscreen,
    handleMediaError,
    handleImageLoad,
    handleThumbnailClick,
    setIsPlaying,
    setMediaError
  } = useGallery(media);

  if (isLoading) {
    return <Skeleton className="w-full h-[300px] md:h-[400px] rounded-lg" />;
  }

  if (!validMedia || validMedia.length === 0) {
    // Only show EmptyGalleryState if there are NO images or media
    return <EmptyGalleryState />;
  }

  const currentMedia = validMedia[currentIndex];

  if (isFullscreen) {
    return (
      <FullscreenGallery
        media={validMedia}
        title={title}
        currentIndex={currentIndex}
        isPlaying={isPlaying}
        galleryRef={galleryRef}
        videoRefs={videoRefs}
        imageLoading={imageLoading}
        preloadedImages={preloadedImages}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onExitFullscreen={exitFullscreen}
        onMediaError={handleMediaError}
        onImageLoad={handleImageLoad}
        setIsPlaying={setIsPlaying}
      />
    );
  }

  return (
    <div ref={galleryRef} className="space-y-4">
      <div className="relative rounded-xl overflow-hidden bg-muted">
        {/* Height increased for more vertical viewing area on mobile */}
        <div className="aspect-[9/16] sm:aspect-[16/9] relative min-h-[450px] md:min-h-[500px]">
          <MediaItem
            item={currentMedia}
            title={title}
            index={currentIndex}
            currentIndex={currentIndex}
            isFullscreen={false}
            isPlaying={isPlaying}
            preloadedImages={preloadedImages}
            imageLoading={imageLoading}
            videoRefs={videoRefs}
            onMediaError={handleMediaError}
            onImageLoad={handleImageLoad}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />

          {mediaError && (
            <ErrorMessage message={mediaError} onClose={() => setMediaError(null)} />
          )}

          {/* Enhanced fullscreen button that's more prominent */}
          <button
            onClick={enterFullscreen}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-6 transition-all duration-200 flex items-center justify-center z-10"
            aria-label="View fullscreen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </button>

          <GalleryControls
            isFullscreen={false}
            isVideo={currentMedia.type === 'video'}
            isPlaying={isPlaying}
            isSaved={isSaved}
            isLoading={isLoading}
            hasMultipleMedia={validMedia.length > 1}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onTogglePlay={togglePlay}
            onSaveToggle={onSaveToggle}
            onEnterFullscreen={enterFullscreen}
          />

          <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {currentMedia.type === 'image' ? 'Image' : 'Video'} {currentIndex + 1} of {validMedia.length}
          </div>
        </div>
      </div>
      {validMedia.length > 1 && (
        <ThumbnailGallery
          media={validMedia}
          title={title}
          currentIndex={currentIndex}
          onThumbnailClick={handleThumbnailClick}
        />
      )}
    </div>
  );
};

export default PropertyMediaGallery;
