
import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Play, AlertTriangle } from 'lucide-react';
import { MediaItem as MediaItemType } from '../types';
import { Button } from '@/components/ui/button';

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
  const [retryCount, setRetryCount] = useState(0);
  const [imgError, setImgError] = useState(false);
  const maxRetries = 2;
  
  // Fallback image URL
  const fallbackImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2673&q=80';
  
  const handleImageError = () => {
    if (retryCount < maxRetries) {
      // Try reloading the image
      setRetryCount(prevCount => prevCount + 1);
      setTimeout(() => {
        const img = new Image();
        img.src = item.url + (item.url.includes('?') ? '&' : '?') + 'retry=' + new Date().getTime();
        img.onload = () => {
          setImgError(false);
        };
        img.onerror = () => {
          // If still failing after retries, report the error
          if (retryCount === maxRetries - 1) {
            setImgError(true);
            onMediaError('image', index);
          }
        };
      }, 500 * (retryCount + 1)); // Increase delay with each retry
    } else {
      setImgError(true);
      onMediaError('image', index);
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgError(false);
    setRetryCount(0);
    // Force reload the image with a cache-busting parameter
    const newUrl = item.url + (item.url.includes('?') ? '&' : '?') + 'cache=' + new Date().getTime();
    const img = new Image();
    img.src = newUrl;
    img.onload = () => {
      onImageLoad(index);
    };
  };

  // For images, optimize rendering
  if (item.type === 'image') {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        {imageLoading[index] && !preloadedImages[index] && !imgError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className={`h-8 w-8 animate-spin ${isFullscreen ? 'text-white' : 'text-primary'}`} />
          </div>
        )}
        
        {imgError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-2" />
            <p className="text-sm text-muted-foreground mb-3">Failed to load image</p>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleRetry}
              className="flex items-center gap-1"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <img
            src={item.url}
            alt={`${title} - Image ${index + 1}`}
            className={`${isFullscreen ? 'max-h-full max-w-full' : 'w-full h-full'} object-contain`}
            loading={index === currentIndex || isFullscreen ? "eager" : "lazy"}
            onLoad={() => onImageLoad(index)}
            onError={handleImageError}
            style={{ 
              display: (imageLoading[index] && !preloadedImages[index] && !imgError) ? 'none' : 'block',
              objectFit: 'contain' 
            }}
            // Add cache-control for Service Worker
            data-cache-priority={index === currentIndex ? 'high' : 'normal'}
          />
        )}
      </div>
    );
  } 
  // For videos, add better error handling
  else {
    const [videoError, setVideoError] = useState(false);
    
    const handleVideoError = () => {
      setVideoError(true);
      onMediaError('video', index);
    };
    
    const handleRetryVideo = (e: React.MouseEvent) => {
      e.stopPropagation();
      setVideoError(false);
      // Force reload video
      if (videoRefs.current[index]) {
        const video = videoRefs.current[index];
        if (video) {
          video.load();
          video.play().catch(() => {
            // If play fails, it might be due to autoplay restrictions
            setVideoError(true);
          });
        }
      }
    };
    
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        {videoError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-2" />
            <p className="text-sm text-muted-foreground mb-3">Failed to load video</p>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleRetryVideo}
              className="flex items-center gap-1"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <video
            ref={el => videoRefs.current[index] = el}
            src={item.url}
            className={`${isFullscreen ? 'max-h-full max-w-full' : 'w-full h-full'} object-contain`}
            controls={isFullscreen}
            preload={index === currentIndex || isFullscreen ? "auto" : "metadata"}
            loop
            onPlay={onPlay}
            onPause={onPause}
            onEnded={onEnded}
            onError={handleVideoError}
            playsInline
          />
        )}
      </div>
    );
  }
};

export default MediaItem;
