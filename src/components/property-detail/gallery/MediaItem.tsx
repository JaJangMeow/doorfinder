
import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Play } from 'lucide-react';
import { MediaItem as MediaItemType } from '../types';

interface MediaItemProps {
  item: MediaItemType;
  title: string;
  index: number;
  currentIndex: number;
  isFullscreen: boolean;
  isPlaying: boolean;
  preloadedImages: Record<number, boolean>;
  imageLoading: Record<number, boolean>;
  videoRefs: React.MutableRefObject<{ [key: number]: HTMLVideoElement | null }>;
  onMediaError: (type: 'image' | 'video', index: number) => void;
  onImageLoad: (index: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
}

const MediaItem: React.FC<MediaItemProps> = ({
  item,
  title,
  index,
  currentIndex,
  isFullscreen,
  isPlaying,
  preloadedImages,
  imageLoading,
  videoRefs,
  onMediaError,
  onImageLoad,
  onPlay,
  onPause,
  onEnded
}) => {
  if (item.type === 'image') {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        {imageLoading[index] && !preloadedImages[index] && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className={`h-8 w-8 animate-spin ${isFullscreen ? 'text-white' : 'text-primary'}`} />
          </div>
        )}
        <img
          src={item.url}
          alt={`${title} - Image ${index + 1}`}
          className={`${isFullscreen ? 'max-h-full max-w-full' : 'w-full h-full'} object-contain`}
          loading={isFullscreen ? "eager" : "lazy"}
          onLoad={() => onImageLoad(index)}
          onError={() => onMediaError('image', index)}
          style={{ 
            display: (imageLoading[index] && !preloadedImages[index]) ? 'none' : 'block',
            objectFit: 'contain' 
          }}
        />
      </div>
    );
  } else {
    return (
      <video
        ref={el => videoRefs.current[index] = el}
        src={item.url}
        className={`${isFullscreen ? 'max-h-full max-w-full' : 'w-full h-full'} object-contain`}
        controls={isFullscreen}
        preload={isFullscreen ? "auto" : "metadata"}
        loop
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        onError={() => onMediaError('video', index)}
        playsInline
      />
    );
  }
};

export default MediaItem;
