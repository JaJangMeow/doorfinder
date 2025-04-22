
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
        <div className="aspect-[16/9] relative min-h-[300px] md:min-h-[400px]">
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
